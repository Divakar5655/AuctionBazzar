const User = require("../models/User");
const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const WalletTransaction = require("../models/WalletTransaction");

// DASHBOARD
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAuctions = await Auction.countDocuments();
    const activeAuctions = await Auction.countDocuments({ status: "active" });
    const completedAuctions = await Auction.countDocuments({ status: "completed" });
    const pendingRequests = await Auction.countDocuments({ status: "in_review" });

    // TOTAL REVENUE (commission)
    const commissionAgg = await WalletTransaction.aggregate([
      { $match: { type: "COMMISSION" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // AVG AUCTION VALUE
    const avgAgg = await Auction.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, avgValue: { $avg: "$currentHighestBid" } } }
    ]);

    res.json({
      totalUsers,
      totalAuctions,
      activeAuctions,
      completedAuctions,
      pendingRequests,
      totalRevenue: commissionAgg[0]?.total || 0,
      avgAuctionValue: Math.round(avgAgg[0]?.avgValue || 0)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// USERS
exports.getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");

  const enhancedUsers = await Promise.all(users.map(async (u) => {

    // Total Earn (seller)
    const earnedAgg = await Auction.aggregate([
      { $match: { seller: u._id, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$currentHighestBid" } } }
    ]);

    // Total Spent (winner)
    const spentAgg = await Auction.aggregate([
      { $match: { currentHighestBidder: u._id, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$currentHighestBid" } } }
    ]);

    return {
      ...u.toObject(),
      totalEarn: earnedAgg[0]?.total || 0,
      totalSpent: spentAgg[0]?.total || 0,
      completedAuctions: await Auction.countDocuments({
        seller: u._id,
        status: "completed"
      })
    };
  }));

  res.json(enhancedUsers);
};

// BLOCK / UNBLOCK USER
exports.toggleUserBlock = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.json({ message: `User ${user.isBlocked ? "blocked" : "unblocked"}` });
};

//AUCTIONS
exports.getAllAuctions = async (req, res) => {
  const auctions = await Auction.find()
    .populate("seller", "name")
    .sort({ createdAt: -1 });

  const enhanced = await Promise.all(
    auctions.map(async (a) => {

      const bidCount = await Bid.countDocuments({ auctionId: a._id });

      return {
        ...a.toObject(),
        bidCount,
        finalPrice: a.status === "completed"
          ? a.currentHighestBid
          : null
      };
    })
  );

  res.json(enhanced);
};

exports.getPendingAuctions = async (req, res) => {
  const auctions = await Auction.find({ status: "in_review" })
    .populate("seller", "name email")
    .sort({ createdAt: -1 });
  res.json(auctions);
};

exports.approveAuction = async (req,res)=>{
  const auction = await Auction.findById(req.params.id);
  auction.status = "upcoming";
  auction.aiDecisionPending = false;
  auction.autoApproved = false;
  auction.approvedBy = req.user._id;
  auction.approvedAt = new Date();

  await auction.save();
  res.json({ message:"Approved by Admin" });
};

exports.rejectAuction = async (req,res)=>{
  const auction = await Auction.findById(req.params.id);
  auction.status = "rejected";
  auction.aiDecisionPending = false;
  auction.moderationReason = "Rejected by Admin";
  
  await auction.save();
  res.json({ message:"Rejected by Admin" });
};

exports.forceCompleteAuction = async (req, res) => {
  const auction = await Auction.findById(req.params.id);
  if (!auction) return res.status(404).json({ message: "Auction not found" });

  auction.status = "completed";
  await auction.save();

  res.json({ message: "Auction force completed" });
};

// Wallet
exports.getAdminWallet = async (req, res) => {
  const admin = await User.findById(req.user._id);

  res.json({
    totalBalance: admin.totalBalance,
    blockedBalance: admin.blockedBalance 
  });
};

// REPORT
exports.completedAuctionsReport = async (req, res) => {
  const auctions = await Auction.find({ status: "completed" })
    .populate("seller", "name")
    .populate("currentHighestBidder", "name");

  const report = auctions.map(a => ({
    title: a.title,
    finalPrice: a.currentHighestBid || 0,
    seller: a.seller?.name || "NA",
    winner: a.currentHighestBidder?.name || "No Winner",
    commission: a.currentHighestBid ? a.currentHighestBid * 0.05 : 0
  }));

  res.json(report);
};
