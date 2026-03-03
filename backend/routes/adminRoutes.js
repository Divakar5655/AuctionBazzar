const express = require("express");
const router = express.Router();
const Auction = require('../models/Auction');

const {
  getDashboardStats,
  getAllUsers,
  toggleUserBlock,
  getAdminWallet,
  getAllAuctions,
  getPendingAuctions,
  approveAuction,
  rejectAuction,
  forceCompleteAuction,
  completedAuctionsReport,
} = require("../controllers/adminController");

const { protect, requireAdmin } = require("../middleware/authMiddleware");

// DASHBOARD STATS
router.get("/stats", protect, requireAdmin, getDashboardStats);

// USERS
router.get("/users", protect, requireAdmin, getAllUsers);
router.patch("/users/:id/block", protect, requireAdmin, toggleUserBlock);

// ADMIN WALLET
router.get("/wallet", protect, requireAdmin, getAdminWallet);

// AUCTIONS
router.get("/auctions", protect, requireAdmin, getAllAuctions);
router.patch("/auctions/:id/force-complete", protect, requireAdmin, forceCompleteAuction);
router.get("/auctions/review", protect, requireAdmin, getPendingAuctions);

// REPORT
router.get("/reports/completed-auctions", protect, requireAdmin, completedAuctionsReport);

router.patch('/auctions/:id/manual-approve', protect, requireAdmin, async (req, res) => {
  const auction = await Auction.findById(req.params.id);
  if (!auction) return res.status(404).json({ message: 'Auction not found' });

  auction.status = 'upcoming';
  auction.aiDecisionPending = false;
  await auction.save();

  res.json({ success: true });
});

router.patch('/auctions/:id/manual-reject', protect, requireAdmin, async (req, res) => {
  const auction = await Auction.findById(req.params.id);
  if (!auction) return res.status(404).json({ message: 'Auction not found' });

  auction.status = 'rejected';
  auction.aiDecisionPending = false;
  await auction.save();

  res.json({ success: true });
});

router.delete("/auctions/:id", protect, requireAdmin, async (req, res) => {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    await auction.deleteOne();
    res.json({ success: true });
  }
);


module.exports = router;
