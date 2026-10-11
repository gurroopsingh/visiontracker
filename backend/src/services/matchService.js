import path from "path";
import { fileURLToPath } from "url";
import Item from "../models/Item.js";
import Match from "../models/Match.js";
import { compareImages } from "./aiService.js";
import { emitToUser } from "../config/socket.js";
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AI_MATCH_THRESHOLD = parseFloat(process.env.AI_MATCH_THRESHOLD || "0.75");
const UPLOADS_DIR = path.join(__dirname, "../../uploads");

/**
 * Build the absolute disk path for an item's image from its imageUrl field.
 * imageUrl is stored as "/uploads/<filename>".
 */
const resolveImagePath = (imageUrl) => {
  if (!imageUrl) return null;
  const filename = path.basename(imageUrl);
  return path.join(UPLOADS_DIR, filename);
};

/**
 * Triggered when a found item with an image is reported.
 * Scans all active LOST items that also have images, runs CLIP comparison,
 * and saves a Match record + sends a Socket.IO notification for every hit.
 *
 * This runs asynchronously — errors here must NEVER crash the report endpoint.
 *
 * @param {Object} foundItem - The newly created found item Mongoose document
 */
export const runMatchSearch = async (foundItem) => {
  try {
    if (!foundItem.imageUrl) {
      logger.debug("Match search skipped — found item has no image", {
        event: "match_skip_no_image",
        itemId: foundItem._id,
      });
      return;
    }

    const foundImagePath = resolveImagePath(foundItem.imageUrl);
    if (!foundImagePath) return;

    // Fetch all active lost items that have an image
    const lostItems = await Item.find({
      type: "lost",
      status: "active",
      imageUrl: { $ne: null, $exists: true },
      _id: { $ne: foundItem._id },
    }).populate("reportedBy", "name email");

    if (lostItems.length === 0) {
      logger.debug("No candidate lost items with images to match against", {
        event: "match_no_candidates",
      });
      return;
    }

    logger.info(`Running AI match search for found item ${foundItem._id} against ${lostItems.length} lost items`, {
      event: "match_search_start",
      foundItemId: foundItem._id,
      candidateCount: lostItems.length,
    });

    for (const lostItem of lostItems) {
      const lostImagePath = resolveImagePath(lostItem.imageUrl);
      if (!lostImagePath) continue;

      // Call the CLIP microservice
      const result = await compareImages(foundImagePath, lostImagePath);

      if (!result) continue; // AI service unavailable — skip gracefully

      if (result.is_match) {
        // Save match record to DB (with score + model version for auditability)
        const match = await Match.create({
          foundItem: foundItem._id,
          lostItem: lostItem._id,
          similarityScore: result.similarity,
          modelVersion: result.model,
          threshold: result.threshold,
          notified: false,
        });

        logger.info("AI match found!", {
          event: "match_found",
          matchId: match._id,
          foundItemId: foundItem._id,
          lostItemId: lostItem._id,
          similarity: result.similarity,
          model: result.model,
        });

        // Notify the owner of the lost item via Socket.IO
        if (lostItem.reportedBy?._id) {
          emitToUser(lostItem.reportedBy._id, "notification", {
            type: "match",
            message: `🎉 A potential match was found for your lost item: "${lostItem.title}" (${Math.round(result.similarity * 100)}% confidence)`,
            matchId: match._id,
            foundItemId: foundItem._id,
            lostItemId: lostItem._id,
            similarity: result.similarity,
          });

          await Match.findByIdAndUpdate(match._id, { notified: true });
        }
      }
    }

    logger.info("AI match search complete", {
      event: "match_search_done",
      foundItemId: foundItem._id,
    });
  } catch (error) {
    // Never let match errors surface to the user
    logger.error(`runMatchSearch error: ${error.message}`, {
      event: "match_search_error",
      error: error.message,
      foundItemId: foundItem?._id,
    });
  }
};
