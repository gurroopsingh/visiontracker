import path from "path";
import Item from "../models/Item.js";
import Match from "../models/Match.js";
import { compareImages } from "./aiService.js";
import { emitToUser } from "../config/socket.js";
import logger from "../utils/logger.js";

const AI_MATCH_THRESHOLD = parseFloat(process.env.AI_MATCH_THRESHOLD || "0.75");
// Must match uploadMiddleware.js — both resolve UPLOAD_DIR from CWD (/app in Docker)
const UPLOADS_DIR = path.resolve(process.env.UPLOAD_DIR || "uploads");

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
 * Scans all active LOST items (owned by OTHER users) that also have images,
 * runs CLIP comparison, and saves a Match record + sends a Socket.IO
 * notification for every hit above the threshold.
 *
 * This runs asynchronously — errors here must NEVER crash the report endpoint.
 *
 * @param {Object} foundItem - The newly created found item Mongoose document
 */
export const runMatchSearch = async (foundItem) => {
  try {
    if (!foundItem.imageUrl) {
      logger.info("[matchService] Skipped — found item has no image", {
        event: "match_skip_no_image",
        itemId: foundItem._id,
      });
      return;
    }

    const foundImagePath = resolveImagePath(foundItem.imageUrl);
    if (!foundImagePath) {
      logger.warn("[matchService] Could not resolve image path for found item", {
        event: "match_skip_bad_path",
        itemId: foundItem._id,
        imageUrl: foundItem.imageUrl,
      });
      return;
    }

    // Bug fix ⌛: exclude lost items owned by the same user who reported the found item.
    // A user finding their own lost item is a self-report, not a cross-user match.
    const lostItems = await Item.find({
      type: "lost",
      status: "active",
      imageUrl: { $exists: true, $ne: null },
      _id: { $ne: foundItem._id },
      reportedBy: { $ne: foundItem.reportedBy }, // ✔ cross-user only
    }).populate("reportedBy", "name email");

    if (lostItems.length === 0) {
      logger.info("[matchService] No candidate lost items from other users with images", {
        event: "match_no_candidates",
        foundItemId: foundItem._id,
        reportedBy: foundItem.reportedBy,
      });
      return;
    }

    logger.info(
      `[matchService] Starting AI match search: found=${foundItem._id} vs ${lostItems.length} lost item(s)`,
      {
        event: "match_search_start",
        foundItemId: foundItem._id,
        candidateCount: lostItems.length,
      }
    );

    for (const lostItem of lostItems) {
      const lostImagePath = resolveImagePath(lostItem.imageUrl);
      if (!lostImagePath) {
        logger.warn(`[matchService] Skipping lostItem=${lostItem._id} — could not resolve image path`, {
          event: "match_skip_lost_bad_path",
          lostItemId: lostItem._id,
          imageUrl: lostItem.imageUrl,
        });
        continue;
      }

      let result;
      try {
        // Call the CLIP microservice (foundImagePath first, lostImagePath second)
        result = await compareImages(foundImagePath, lostImagePath);
      } catch (compareErr) {
        logger.error(
          `[matchService] compareImages threw for pair found=${foundItem._id} lost=${lostItem._id}: ${compareErr.message}`,
          { event: "match_compare_error", error: compareErr.message, stack: compareErr.stack }
        );
        continue;
      }

      if (!result) {
        logger.warn(
          `[matchService] AI service returned null for pair found=${foundItem._id} lost=${lostItem._id} — service unavailable`,
          { event: "match_ai_null", foundItemId: foundItem._id, lostItemId: lostItem._id }
        );
        continue;
      }

      logger.info(
        `[matchService] Similarity found=${foundItem._id} vs lost=${lostItem._id}: ${result.similarity?.toFixed(4)} (threshold=${AI_MATCH_THRESHOLD})`,
        {
          event: "match_similarity",
          foundItemId: foundItem._id,
          lostItemId: lostItem._id,
          similarity: result.similarity,
          is_match: result.is_match,
        }
      );

      if (result.is_match) {
        // Bug fix ⌛: use upsert to prevent duplicate Match records for the same pair
        // if runMatchSearch is triggered more than once (e.g. retries, re-uploads).
        const match = await Match.findOneAndUpdate(
          { foundItem: foundItem._id, lostItem: lostItem._id },
          {
            $setOnInsert: {
              foundItem: foundItem._id,
              lostItem: lostItem._id,
              similarityScore: result.similarity,
              modelVersion: result.model || "openai/clip-vit-base-patch32",
              threshold: result.threshold ?? AI_MATCH_THRESHOLD,
              notified: false,
              status: "pending",
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        logger.info("[matchService] Match saved!", {
          event: "match_found",
          matchId: match._id,
          foundItemId: foundItem._id,
          lostItemId: lostItem._id,
          similarity: result.similarity,
          model: result.model,
          wasNew: !match.notified, // approximate — true if this is first notification
        });

        // Notify the owner of the lost item via Socket.IO
        const ownerId = lostItem.reportedBy?._id;
        if (ownerId) {
          // Ensure the userId is a plain string for reliable Map lookup
          emitToUser(ownerId.toString(), "notification", {
            type: "match",
            message: `🎉 A potential match was found for your lost item: "${lostItem.title}" (${
              Math.round(result.similarity * 100)
            }% confidence)`,
            matchId: match._id,
            foundItemId: foundItem._id,
            lostItemId: lostItem._id,
            similarity: result.similarity,
          });

          // Mark notified only after emit attempt (even if user is offline, record the attempt)
          if (!match.notified) {
            await Match.findByIdAndUpdate(match._id, { notified: true });
          }
        } else {
          logger.warn(
            `[matchService] lostItem=${lostItem._id} has no reportedBy owner — cannot send notification`,
            { event: "match_no_owner", lostItemId: lostItem._id }
          );
        }
      }
    }

    logger.info("[matchService] AI match search complete", {
      event: "match_search_done",
      foundItemId: foundItem._id,
    });
  } catch (error) {
    // Never let match errors surface to the user — but always log them in full
    logger.error(`[matchService] runMatchSearch fatal error: ${error.message}`, {
      event: "match_search_error",
      error: error.message,
      stack: error.stack,
      foundItemId: foundItem?._id,
    });
  }
};
