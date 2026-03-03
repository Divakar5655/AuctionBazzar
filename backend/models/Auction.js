const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    category: String,

    expectedPrice: { type: Number, required: true },
    totalPoints: { type: Number, default: 0 },
    level: { type: Number },

    basePrice: { type: Number, required: true },
    images: [String],
    currentHighestBid: { type: Number, default: 0 },
    currentHighestBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    
    status: {
      type: String,
      enum: ["in_review", "upcoming", "active", "completed", "rejected"],
      default: "in_review"
    },

    soldPrice: {
      type: Number,
      default: 0,
    },

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    autoApproved: { type: Boolean, default: false },
    moderationReason: String,

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: Date,

    isSettled: {
      type: Boolean,
      default: false,
    },
    
    commission: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Auction", auctionSchema);
