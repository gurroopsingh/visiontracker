import mongoose from "mongoose";
import Item from "../models/Item.js";
import logger from "../utils/logger.js";

// Allowed sort fields — whitelist prevents arbitrary field injection
const ALLOWED_SORT_FIELDS = new Set([
  "createdAt",
  "title",
  "date",
  "category",
  "status",
]);

/**
 * @desc    Get all items with optional filters, pagination, and sorting
 * @route   GET /api/items
 * @access  Public
 *
 * Query params:
 *   type      — "lost" | "found"
 *   category  — e.g. "Electronics"
 *   status    — "active" | "resolved" | "closed"
 *   search    — text search on title, description, location
 *   page      — page number (default: 1)
 *   limit     — items per page (default: 12, max: 50)
 *   sort      — field name, prefix with "-" for descending (default: -createdAt)
 */
const getItems = async (req, res, next) => {
  try {
    const { type, category, status, search, sort } = req.query;

    // ── Pagination ────────────────────────────────────────────────────────────
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    // ── Sorting ───────────────────────────────────────────────────────────────
    // Default: newest first (-createdAt)
    let sortObj = { createdAt: -1 };
    if (sort) {
      const isDesc = sort.startsWith("-");
      const field = isDesc ? sort.slice(1) : sort;
      if (ALLOWED_SORT_FIELDS.has(field)) {
        sortObj = { [field]: isDesc ? -1 : 1 };
      }
      // Silently ignore invalid sort fields — don't expose internal field names
    }

    // ── Filters ───────────────────────────────────────────────────────────────
    const filter = {};
    if (type && ["lost", "found"].includes(type)) filter.type = type;
    if (category) filter.category = category;
    if (status && ["active", "resolved", "closed"].includes(status))
      filter.status = status;
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
        { location: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    // ── Query ─────────────────────────────────────────────────────────────────
    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate("reportedBy", "name email")
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Item.countDocuments(filter),
    ]);

    logger.debug("Items fetched", {
      event: "items_listed",
      filter,
      page,
      limit,
      total,
    });

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get items reported by the currently authenticated user
 * @route   GET /api/items/my
 * @access  Private (requires protect middleware)
 *
 * Query params: same as GET /api/items (type, page, limit, sort, status)
 * This endpoint is registered BEFORE /:id in itemRoutes.js to avoid
 * "my" being treated as a MongoDB ObjectId.
 */
const getMyItems = async (req, res, next) => {
  try {
    const { type, status, sort } = req.query;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    let sortObj = { createdAt: -1 };
    if (sort) {
      const isDesc = sort.startsWith("-");
      const field = isDesc ? sort.slice(1) : sort;
      if (ALLOWED_SORT_FIELDS.has(field)) {
        sortObj = { [field]: isDesc ? -1 : 1 };
      }
    }

    const filter = { reportedBy: req.user._id };
    if (type && ["lost", "found"].includes(type)) filter.type = type;
    if (status && ["active", "resolved", "closed"].includes(status))
      filter.status = status;

    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate("reportedBy", "name email")
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Item.countDocuments(filter),
    ]);

    logger.debug("User's own items fetched", {
      event: "my_items_listed",
      userId: req.user._id,
      total,
    });

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single item by id
 * @route   GET /api/items/:id
 * @access  Public
 */
const getItemById = async (req, res, next) => {
  try {
    // Validate that the id is a valid MongoDB ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found." });
    }

    const item = await Item.findById(req.params.id).populate(
      "reportedBy",
      "name email"
    );

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found." });
    }

    res.status(200).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Report a lost item
 * @route   POST /api/items/lost
 * @access  Private
 */
const reportLostItem = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      brand,
      color,
      location,
      date,
      additionalDetails,
    } = req.body;

    const item = await Item.create({
      type: "lost",
      title,
      description,
      category,
      brand,
      color,
      location,
      date,
      additionalDetails,
      reportedBy: req.user._id,
    });

    const populated = await item.populate("reportedBy", "name email");

    logger.info("Lost item reported", {
      event: "item_created",
      itemId: item._id,
      type: "lost",
      userId: req.user._id,
    });

    res.status(201).json({ success: true, item: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Report a found item
 * @route   POST /api/items/found
 * @access  Private
 */
const reportFoundItem = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      brand,
      color,
      location,
      date,
      additionalDetails,
    } = req.body;

    const item = await Item.create({
      type: "found",
      title,
      description,
      category,
      brand,
      color,
      location,
      date,
      additionalDetails,
      reportedBy: req.user._id,
    });

    const populated = await item.populate("reportedBy", "name email");

    logger.info("Found item reported", {
      event: "item_created",
      itemId: item._id,
      type: "found",
      userId: req.user._id,
    });

    res.status(201).json({ success: true, item: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an item (owner or admin only)
 * @route   PUT /api/items/:id
 * @access  Private
 */
const updateItem = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found." });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found." });
    }

    // Only the reporter can update
    if (item.reportedBy.toString() !== req.user._id.toString()) {
      logger.warn("Unauthorized item update attempt", {
        event: "item_update_forbidden",
        itemId: item._id,
        requesterId: req.user._id,
        ownerId: item.reportedBy,
      });
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this item.",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "brand",
      "color",
      "location",
      "date",
      "additionalDetails",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    await item.save();
    await item.populate("reportedBy", "name email");

    logger.info("Item updated", {
      event: "item_updated",
      itemId: item._id,
      userId: req.user._id,
    });

    res.status(200).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an item (owner only)
 * @route   DELETE /api/items/:id
 * @access  Private
 */
const deleteItem = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found." });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found." });
    }

    if (item.reportedBy.toString() !== req.user._id.toString()) {
      logger.warn("Unauthorized item delete attempt", {
        event: "item_delete_forbidden",
        itemId: item._id,
        requesterId: req.user._id,
        ownerId: item.reportedBy,
      });
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this item.",
      });
    }

    await item.deleteOne();

    logger.info("Item deleted", {
      event: "item_deleted",
      itemId: item._id,
      userId: req.user._id,
    });

    res.status(200).json({ success: true, message: "Item deleted." });
  } catch (error) {
    next(error);
  }
};

export {
  getItems,
  getMyItems,
  getItemById,
  reportLostItem,
  reportFoundItem,
  updateItem,
  deleteItem,
};
