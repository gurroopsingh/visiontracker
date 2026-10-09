import express from "express";
import {
  getItems,
  getMyItems,
  getItemById,
  reportLostItem,
  reportFoundItem,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";
import { getMatches, acceptMatch, rejectMatch } from "../controllers/matchController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload, handleUploadError } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────────────────────
// GET /api/items — list all items with filters, pagination, sorting
router.get("/", getItems);

// ── Protected routes (require valid JWT) ──────────────────────────────────────
// IMPORTANT: /my and /matches must be registered BEFORE /:id to prevent Express
// from treating literal strings as MongoDB ObjectId parameters.
router.get("/my", protect, getMyItems);

// GET /api/items/matches — list AI matches for current user's lost items
router.get("/matches", protect, getMatches);

// POST /api/items/lost  — report a lost item
router.post("/lost", protect, upload.single("image"), handleUploadError, reportLostItem);

// POST /api/items/found — report a found item
router.post("/found", protect, upload.single("image"), handleUploadError, reportFoundItem);

// ── Parameterised routes ──────────────────────────────────────────────────────
// GET /api/items/:id    — single item (public)
router.get("/:id", getItemById);

// PUT /api/items/:id    — update (owner only)
router.put("/:id", protect, upload.single("image"), handleUploadError, updateItem);

// DELETE /api/items/:id — delete (owner only)
router.delete("/:id", protect, deleteItem);

// PATCH /api/items/matches/:id/accept — owner accepts the match
router.patch("/matches/:id/accept", protect, acceptMatch);

// PATCH /api/items/matches/:id/reject — owner rejects the match
router.patch("/matches/:id/reject", protect, rejectMatch);

export default router;
