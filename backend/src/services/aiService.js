import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import logger from "../utils/logger.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_MATCH_THRESHOLD = parseFloat(process.env.AI_MATCH_THRESHOLD || "0.75");

/**
 * Check if the AI microservice is reachable
 */
export const pingAIService = async () => {
  try {
    const res = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 3000 });
    return res.data?.status === "ok";
  } catch {
    return false;
  }
};

/**
 * Compare two local image files using the CLIP /match endpoint.
 * Returns null (graceful fallback) if the AI service is unreachable.
 *
 * @param {string} imagePathA - Absolute path to the first image file
 * @param {string} imagePathB - Absolute path to the second image file
 * @returns {Object|null} { similarity, is_match, threshold, model, model_version }
 */
export const compareImages = async (imagePathA, imagePathB) => {
  try {
    if (!fs.existsSync(imagePathA) || !fs.existsSync(imagePathB)) {
      logger.warn("AI compareImages: one or both image files not found", {
        event: "ai_compare_missing_file",
        imagePathA,
        imagePathB,
      });
      return null;
    }

    const form = new FormData();
    form.append("image_a", fs.createReadStream(imagePathA));
    form.append("image_b", fs.createReadStream(imagePathB));

    const res = await axios.post(`${AI_SERVICE_URL}/match`, form, {
      headers: form.getHeaders(),
      timeout: 30000,
    });

    logger.info("AI image comparison complete", {
      event: "ai_compare_done",
      similarity: res.data.similarity,
      is_match: res.data.is_match,
      model: res.data.model,
    });

    return res.data;
  } catch (error) {
    logger.warn(`AI service unavailable or error: ${error.message}`, {
      event: "ai_service_error",
      error: error.message,
    });
    return null; // Graceful fallback — never crash the main API
  }
};
