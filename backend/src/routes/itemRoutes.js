import express from "express";
import {
  getItems,
  getItemById,
  reportLostItem,
  reportFoundItem,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getItems);
router.get("/:id", getItemById);

// Protected routes (require valid JWT)
router.post("/lost", protect, reportLostItem);
router.post("/found", protect, reportFoundItem);
router.put("/:id", protect, updateItem);
router.delete("/:id", protect, deleteItem);

export default router;
