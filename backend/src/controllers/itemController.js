import Item from "../models/Item.js";

/**
 * @desc    Get all items (with optional filters)
 * @route   GET /api/items
 * @access  Public
 * Query params: type, category, status, search
 */
const getItems = async (req, res, next) => {
  try {
    const { type, category, status, search } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const items = await Item.find(filter)
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: items.length, items });
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
    const item = await Item.findById(req.params.id).populate(
      "reportedBy",
      "name email"
    );

    if (!item) {
      res.statusCode = 404;
      throw new Error("Item not found.");
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
    const item = await Item.findById(req.params.id);

    if (!item) {
      res.statusCode = 404;
      throw new Error("Item not found.");
    }

    // Only the reporter can update
    if (item.reportedBy.toString() !== req.user._id.toString()) {
      res.statusCode = 403;
      throw new Error("You are not authorized to update this item.");
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
    const item = await Item.findById(req.params.id);

    if (!item) {
      res.statusCode = 404;
      throw new Error("Item not found.");
    }

    if (item.reportedBy.toString() !== req.user._id.toString()) {
      res.statusCode = 403;
      throw new Error("You are not authorized to delete this item.");
    }

    await item.deleteOne();

    res.status(200).json({ success: true, message: "Item deleted." });
  } catch (error) {
    next(error);
  }
};

export {
  getItems,
  getItemById,
  reportLostItem,
  reportFoundItem,
  updateItem,
  deleteItem,
};
