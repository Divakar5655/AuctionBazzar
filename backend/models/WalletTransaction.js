const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // types: ADD_FUNDS, BID_BLOCK, BID_UNBLOCK, SALE_PAYMENT, SALE_PAYOUT, COMMISSION
    type: {
      type: String,
      enum: [
        "ADD_FUNDS",
        "BID_BLOCK",
        "BID_UNBLOCK",
        "SALE_PAYMENT",
        "SALE_PAYOUT",
        "COMMISSION",
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);


