const mongoose = require("mongoose");
const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const User = require("../models/User");
const WalletTransaction = require("../models/WalletTransaction");
const { autoModerateAuction } = require("../services/moderationService");

// SYSTEM BID LOGIC
function calculateRaiseBid(current) {
  if (current < 5000) return current + 500;
  if (current < 20000) return current + 500;
  if (current < 50000) return current + 1000;
  return current + 5000;
}

function calculateBasePrice(category, expectedPrice, answers) {

  const categoryBase = {
    vehicles: 15000,
    mobiles: 10000,
    electronics: 8000
  };

  let totalPoints = 0;

  // answers array like [4,3,2,1,4,3...]
  answers.forEach(point => {
    totalPoints += Number(point);
  });

  let multiplier = 1;

  if (totalPoints <= 10) multiplier = 0.5;
  else if (totalPoints <= 20) multiplier = 1.0;
  else if (totalPoints <= 30) multiplier = 1.5;
  else multiplier = 2.0;

  const baseCategoryPrice = categoryBase[category.toLowerCase()] || 8000;

  let rawPrice = baseCategoryPrice * multiplier;

  let finalPrice = rawPrice;

  if (rawPrice > expectedPrice) {
    const diff = rawPrice - expectedPrice;

    if (diff <= 5000) finalPrice = expectedPrice;
    else if (diff <= 10000) finalPrice = expectedPrice + 5000;
    else if (diff <= 15000) finalPrice = expectedPrice + 10000;
    else finalPrice = expectedPrice + 15000;
  }

  finalPrice = Math.round(finalPrice / 100) * 100;

  return { finalPrice, totalPoints, multiplier };
}

// CREATE AUCTION REQUEST
exports.createAuctionRequest = async (req, res) => {
  try {
    console.log("FILES:", req.files);
    console.log("BODY:", req.body);

    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const { title, description, category, startTime, endTime, expectedPrice, answers } = req.body;

    /*const categoryPrices = {
      electronics: 500,
      furniture: 300,
      vehicles: 1500,
      "fashion & accessories": 150,
      mobiles: 400
    };*/

    if (!title || !category || !startTime || !endTime) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    //const basePrice = req.body.basePrice || categoryPrices[category.toLowerCase()] || 200;
    //const basePrice = categoryPrices[category.toLowerCase()] || 200;

    if (!expectedPrice || !answers) {
      return res.status(400).json({ message: "Expected price or answers missing" });
    }
    
    const parsedAnswers = JSON.parse(answers);
    const pricing = calculateBasePrice(category, Number(expectedPrice), parsedAnswers);

    const auction = await Auction.create({
      title,
      description,
      category,
      basePrice: pricing.finalPrice,
      expectedPrice: Number(expectedPrice),
      totalPoints: pricing.totalPoints,
      level: pricing.multiplier,
      seller: req.user._id,
      startTime,
      endTime,
      images,
      status: "in_review",
      currentHighestBid: 0,
      currentHighestBidder: null
    });
    
    res.status(201).json({
      message: "Auction submitted. AI review in background.",
      auctionStatus: auction.status
    });
    
    autoModerateAuction(auction);
  
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};  

// ADMIN APPROVE 
exports.approveAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    if (auction.status !== "in_review")
      return res.status(400).json({ message: "Auction already processed" });

    auction.status = "upcoming";
    auction.approvedBy = req.user._id;
    auction.approvedAt = new Date();
    await auction.save();

    res.json({ message: "Auction approved", auction });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ADMIN REJECT
exports.rejectAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    auction.status = "rejected";
    await auction.save();

    res.json({ message: "Auction rejected", auction });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PENDING AUCTIONS
exports.getPendingAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ status: "in_review" })
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json(auctions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUBLIC LIST
exports.getAuctionList = async (req, res) => {
  const auctions = await Auction.find({
    status: { $in: ["upcoming", "active", "completed"] },
  }).sort({ status: 1, startTime: -1, createdAt: -1 });

  const formatted = auctions.map((a) => ({
    _id: a._id,
    title: a.title,
    category: a.category,
    status: a.status,
    basePrice: a.basePrice,
    currentHighestBid: a.currentHighestBid || 0,
    soldPrice: a.soldPrice || 0,
    startTime: a.startTime,
    endTime: a.endTime,
    images: a.images || [],
  }));

  res.json(formatted);
};

// AUCTION DETAIL
exports.getAuctionById = async (req, res) => {
  const auction = await Auction.findById(req.params.id).populate(
    "seller",
    "name email"
  );
  if (!auction) return res.status(404).json({ message: "Auction not found" });
  res.json(auction);
};

// PLACE BID (RAISE / MONSTER)
exports.placeBid = async (req, res) => {
  try {
    const type = req.body?.type || "raise";
    const auction = await Auction.findById(req.params.id);
    const userId = req.user._id;

    if (!auction) return res.status(404).json({ message: "Auction not found" });
    if (auction.status !== "active")
      return res.status(400).json({ message: "Auction not active" });

    if (auction.seller.toString() === userId.toString())
      return res
        .status(400)
        .json({ message: "Seller cannot bid on own auction" });

    const now = new Date();
    if (now < auction.startTime || now > auction.endTime)
      return res.status(400).json({ message: "Auction time over" });

    const current =
      auction.currentHighestBid > 0
        ? auction.currentHighestBid
        : auction.basePrice;

    let nextBid =
      type === "monster"
        ? current + 10000
        : calculateRaiseBid(current);

    const user = await User.findById(userId);
    const available = user.totalBalance - user.blockedBalance;
    if (available < nextBid)
      return res.status(400).json({ message: "Insufficient balance" });

    // release previous bidder
    if (
      auction.currentHighestBidder &&
      auction.currentHighestBidder.toString() !== userId.toString()
    ) {
      const prev = await User.findById(auction.currentHighestBidder);
      prev.blockedBalance -= auction.currentHighestBid;
      if (prev.blockedBalance < 0) prev.blockedBalance = 0;
      await prev.save();
    }

    // block new amount
    user.blockedBalance += nextBid - (auction.currentHighestBid || 0);
    await user.save();

    const bid = await Bid.create({
      auctionId: auction._id,
      bidderId: userId,
      amount: nextBid,
    });

    auction.currentHighestBid = nextBid;
    auction.currentHighestBidder = userId;
    await auction.save();

    res.status(201).json({ message: "Bid placed", bid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// USER DASHBOARD STATS
exports.getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const activeAuctions = await Auction.countDocuments({
      seller: userId,
      status: "active"
    });

    const totalBids = await Bid.countDocuments({
      bidderId: userId
    });

    const itemsWon = await Auction.countDocuments({
      currentHighestBidder: userId,
      status: "completed"
    });

    const earningsAgg = await Auction.aggregate([
      { $match: { seller: userId, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$soldPrice" } } }
    ]);

    res.json({
      activeAuctions,
      totalBids,
      itemsWon,
      totalEarnings: earningsAgg[0]?.total || 0
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// MY BIDS
exports.getMyBids = async (req, res) => {
  try {
    const userId = req.user._id;

    const bids = await Bid.find({ bidderId: userId })
      .sort({ createdAt: -1 })
      .populate("auctionId");

    const latestBidPerAuction = {};

    bids.forEach(bid => {
      const auction = bid.auctionId;
      if (!auction) return;

      if (!latestBidPerAuction[auction._id]) {
        latestBidPerAuction[auction._id] = {
          auctionId: auction._id,
          title: auction.title,
          myBid: bid.amount,
          currentBid: auction.currentHighestBid || auction.basePrice,
          status: auction.status
        };
      }
    });

    res.json(Object.values(latestBidPerAuction));

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load bids" });
  }
};

// BID HISTORY
exports.getBidHistory = async (req, res) => {
  const bids = await Bid.find({ auctionId: req.params.id })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("bidderId", "name");

  res.json({ bids });
};

// MY AUCTIONS 
exports.getMyAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ seller: req.user._id });

    const result = await Promise.all(
      auctions.map(async (a) => {
        const bidCount = await Bid.countDocuments({ auctionId: a._id });

        return {
          _id: a._id,
          title: a.title,
          currentHighestBid: a.currentHighestBid || a.basePrice,
          bids: bidCount,
          status: a.status,
          startTime: a.startTime,
          endTime: a.endTime
        };
      })
    );

    const priority = { active: 1, upcoming: 2, completed: 3, rejected: 4 };
    result.sort((a, b) => priority[a.status] - priority[b.status]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// MY AUCTION HISTORY
exports.getMyAuctionHistory = async (req, res) => {
  const auctions = await Auction.find({
    seller: req.user._id,
    status: "completed",
  }).sort({ updatedAt: -1 });

  res.json(auctions);
};

// USER AUCTION FULL HISTORY (APPROVED / REJECTED)
exports.getUserAuctionSummary = async (req, res) => {
  try {
    const auctions = await Auction.find({
      seller: req.user._id,
      status: { $in: ["completed", "rejected"] }
    }).sort({ updatedAt: -1 });

    const formatted = auctions.map(a => ({
      title: a.title,
      status: a.status, // completed / rejected
      basePrice: a.basePrice,
      soldPrice: a.status === "completed" ? a.soldPrice : 0,
      commission: a.status === "completed" ? a.commission : 0,
      updatedAt: a.updatedAt
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


