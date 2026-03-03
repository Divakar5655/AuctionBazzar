const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Wallet fields
    totalBalance: {
      type: Number,
      default: 0,
    },

    blockedBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true, }
);

// Virtual availableBalance = totalBalance - blockedBalance
userSchema.virtual("availableBalance").get(function () {
  return this.totalBalance - this.blockedBalance;
});

module.exports = mongoose.model("User", userSchema);

