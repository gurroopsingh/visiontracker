import mongoose from "mongoose";

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Books & Stationery",
  "Accessories",
  "ID & Cards",
  "Bags & Luggage",
  "Keys",
  "Sports Equipment",
  "Other",
];

const itemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["lost", "found"],
      required: [true, "Item type (lost or found) is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: CATEGORIES,
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    color: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    additionalDetails: {
      type: String,
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
      default: null,
      // Phase 2: will be populated by Multer / cloud storage upload
    },
    status: {
      type: String,
      enum: ["active", "resolved", "closed"],
      default: "active",
    },
    // Reference to the User who reported this item
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search and filter performance
itemSchema.index({ type: 1, status: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ reportedBy: 1 });

const Item = mongoose.model("Item", itemSchema);
export default Item;
