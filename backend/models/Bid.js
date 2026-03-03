const mongoose = require("mongoose");
const { Schema } = mongoose;

const bidSchema = new Schema({
  auctionId: { type: Schema.Types.ObjectId, ref: "Auction", required: true },
  bidderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true }
}, { timestamps: { createdAt: "createdAt", updatedAt: false } });

module.exports = mongoose.model("Bid", bidSchema);
