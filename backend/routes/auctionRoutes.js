const express = require("express");
const router = express.Router();  
const upload = require("../middleware/upload");

const {
  createAuctionRequest,
  approveAuction,
  rejectAuction,
  getPendingAuctions,
  getAuctionList,
  getAuctionById,
  placeBid,
  getMyBids,
  getBidHistory,
  getUserDashboardStats,
  getMyAuctions,
  getMyAuctionHistory,
  getUserAuctionSummary
} = require("../controllers/auctionController");

const { protect, requireAdmin } = require("../middleware/authMiddleware");

// ADMIN
router.get("/admin/pending", protect, requireAdmin, getPendingAuctions);
router.patch("/admin/:id/approve", protect, requireAdmin, approveAuction);
router.patch("/admin/:id/reject", protect, requireAdmin, rejectAuction);

// USER
router.post("/", protect,upload.array("images", 10),createAuctionRequest);
router.post("/:id/bid", protect, placeBid);
router.get("/my-bids", protect, getMyBids);
router.get("/dashboard-stats", protect, getUserDashboardStats);
router.get("/my-auctions", protect, getMyAuctions);
router.get("/my-auctions/history", protect, getMyAuctionHistory);
router.get("/my-history", protect, getMyAuctionHistory);
router.get("/my-auctions/summary", protect, getUserAuctionSummary);

// PUBLIC
router.get("/", getAuctionList);
router.get("/:id", getAuctionById);
router.get("/:id/bids", getBidHistory);

module.exports = router;

