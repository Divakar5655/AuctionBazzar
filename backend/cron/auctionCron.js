const cron = require("node-cron");
const Auction = require("../models/Auction");
const User = require("../models/User");
const WalletTransaction = require("../models/WalletTransaction");
const { autoModerateAuction } = require("../services/moderationService");

cron.schedule("*/15 * * * * *", async () => {
  try {
    const now = new Date();
    console.log("⏰ Auction cron running...");

    // UPCOMING → ACTIVE
    await Auction.updateMany(
      { status: "upcoming", startTime: { $lte: now } },
      { $set: { status: "active" } }
    );
    
    // 🧠 AI REVIEW CHECK (every 15 sec)
    const reviewAuctions = await Auction.find({
      status: "in_review",
      aiDecisionPending: true,
      createdAt: { $lte: new Date(Date.now() - 5000) }
    });
    
    for (const auction of reviewAuctions) {
      try {
        const decision = await autoModerateAuction(auction);

        if (decision.status === "approved") {
          auction.status = "upcoming";
          auction.autoApproved = true;
        } else {
          auction.status = "rejected";
          auction.moderationReason = decision.reason;
        }

        auction.aiDecisionPending = false;
        await auction.save();
        console.log(`🤖 AI reviewed: ${auction.title} → ${auction.status}`);

      } catch (err) {
        console.log("AI processing failed:", err.message);
      }
    }

    // ACTIVE → COMPLETED
    const auctions = await Auction.find({
      status: "active",
      endTime: { $lte: now },
      isSettled: false,
    });

    for (const auction of auctions) {
      // LOCK AUCTION 
      const lockedAuction = await Auction.findOneAndUpdate(
        { _id: auction._id, isSettled: false },
        { $set: { isSettled: true,} },
        { new: true }
      );

      if (!lockedAuction) continue;

      // NO BIDS CASE
      if (!lockedAuction.currentHighestBidder) {
        lockedAuction.status = "completed";
        lockedAuction.soldPrice = 0;
        lockedAuction.isSettled = true;
        await lockedAuction.save();
        console.log(`⚠️ Auction ended (no bids): ${lockedAuction.title}`);
        continue;
      }

      const winner = await User.findById(
        lockedAuction.currentHighestBidder
      );
      const seller = await User.findById(lockedAuction.seller);
      const admin = await User.findOne({ role: "admin" });

      if (!winner || !seller) continue;

      const amount = lockedAuction.currentHighestBid;
      const commission = Math.floor(amount * 0.05);
      const sellerAmount = amount - commission;

      // WALLET SETTLEMENT
      winner.blockedBalance -= amount;
      winner.totalBalance -= amount;
      if (winner.blockedBalance < 0) winner.blockedBalance = 0;
      await winner.save();

      seller.totalBalance += sellerAmount;
      await seller.save();

      if (admin) {
        admin.totalBalance += commission;
        await admin.save();
      }

      //   TRANSACTIONS
      await WalletTransaction.create([
        {
          userId: winner._id,
          type: "SALE_PAYMENT",
          amount,
          note: `Won auction: ${lockedAuction.title}`,
        },
        {
          userId: seller._id,
          type: "SALE_PAYOUT",
          amount: sellerAmount,
          note: `Sold auction: ${lockedAuction.title}`,
        },
        admin && {
          userId: admin._id,
          type: "COMMISSION",
          amount: commission,
          note: `Commission for auction: ${lockedAuction.title}`,
        },
      ].filter(Boolean));
      
      lockedAuction.status = "completed";
      lockedAuction.isSettled = true;
      lockedAuction.soldPrice = lockedAuction.currentHighestBid;
      lockedAuction.winner = winner._id;

      await lockedAuction.save();

      console.log(`✅ Auction completed: ${lockedAuction.title}`);
    }
  } catch (err) {
    console.error("❌ Auction cron error:", err.message);
  }
});
