import mongoose from "mongoose";

/**
 * Match — records an AI-detected potential match between two items.
 *
 * The score and model version are stored to make the match traceable
 * and auditable (as required by the project spec).
 */
const matchSchema = new mongoose.Schema(
  {
    // The "found" item (the one just reported that triggered the search)
    foundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    // The "lost" item this was matched against
    lostItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    // Cosine similarity score returned by CLIP (0.0 – 1.0)
    similarityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    // The CLIP model name used for this match — stored for auditability
    modelVersion: {
      type: String,
      required: true,
      default: "openai/clip-vit-base-patch32",
    },
    // Threshold at time of matching (env-configurable)
    threshold: {
      type: Number,
      required: true,
    },
    // Whether notifications were dispatched
    notified: {
      type: Boolean,
      default: false,
    },
    // Owner action on the match
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Unique compound index — prevents duplicate matches for the same found+lost pair
// Also powers the findOneAndUpdate upsert in matchService.js
matchSchema.index({ foundItem: 1, lostItem: 1 }, { unique: true });
// Additional single-field indexes for fast per-item lookups
matchSchema.index({ lostItem: 1 });
matchSchema.index({ foundItem: 1 });

const Match = mongoose.model("Match", matchSchema);
export default Match;
