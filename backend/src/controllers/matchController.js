/**
 * matchController.js — Match accept/reject/list endpoints
 *
 * GET    /api/items/matches        — list matches for the logged-in user's lost items
 * PATCH  /api/items/matches/:id/accept — owner of the lost item accepts match
 * PATCH  /api/items/matches/:id/reject — owner of the lost item rejects match
 */

import Match from "../models/Match.js";
import Item from "../models/Item.js";

// ── GET /api/items/matches ─────────────────────────────────────────────────────
export const getMatches = async (req, res, next) => {
  try {
    // Return all Match docs where the lost item belongs to current user
    const userItems = await Item.find({ reportedBy: req.user._id, type: "lost" }).select("_id");
    const userItemIds = userItems.map((i) => i._id);

    const matches = await Match.find({ lostItem: { $in: userItemIds } })
      .populate("lostItem", "title imageUrl location")
      .populate("foundItem", "title imageUrl location")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: matches.length, matches });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/items/matches/:id/accept ───────────────────────────────────────
export const acceptMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id).populate("lostItem");
    if (!match) return res.status(404).json({ success: false, message: "Match not found." });

    // Only the owner of the lost item can accept
    const lostItem = match.lostItem;
    if (!lostItem || lostItem.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorised to accept this match." });
    }

    match.status = "accepted";
    await match.save();

    res.status(200).json({ success: true, message: "Match accepted.", match });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/items/matches/:id/reject ───────────────────────────────────────
export const rejectMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id).populate("lostItem");
    if (!match) return res.status(404).json({ success: false, message: "Match not found." });

    // Only the owner of the lost item can reject
    const lostItem = match.lostItem;
    if (!lostItem || lostItem.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorised to reject this match." });
    }

    match.status = "rejected";
    await match.save();

    res.status(200).json({ success: true, message: "Match rejected.", match });
  } catch (err) {
    next(err);
  }
};
