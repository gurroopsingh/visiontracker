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
import { protect } from "../middleware/authMiddleware.js";
import { upload, handleUploadError } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────────────────────
// GET /api/items — list all items with filters, pagination, sorting
router.get("/", getItems);

// ── Protected routes (require valid JWT) ──────────────────────────────────────
// IMPORTANT: /my must be registered BEFORE /:id to prevent Express from
// treating the literal string "my" as a MongoDB ObjectId parameter.
router.get("/my", protect, getMyItems);

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

export default router;
