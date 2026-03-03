const User = require("../models/User");
const WalletTransaction = require("../models/WalletTransaction");

// ADD FUNDS
exports.addFunds = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const user = await User.findById(req.user.id);

    user.totalBalance += amount;
    await user.save();

    await WalletTransaction.create({
      userId: user._id,
      type: "ADD_FUNDS",
      amount,
      note: "Funds added",
    });

    res.json({
      message: "Funds added successfully",
      totalBalance: user.totalBalance,
      blockedBalance: user.blockedBalance,
      availableBalance: user.totalBalance - user.blockedBalance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// MY TRANSACTIONS
exports.getMyTransactions = async (req, res) => {
  try {
    const txns = await WalletTransaction.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(txns);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// MY WALLET
exports.getMyWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      totalBalance: user.totalBalance,
      blockedBalance: user.blockedBalance,
      availableBalance: user.totalBalance - user.blockedBalance,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


