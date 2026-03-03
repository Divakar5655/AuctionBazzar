const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  addFunds,
  getMyTransactions,
  getMyWallet
} = require("../controllers/walletController");

// ADD FUNDS
router.post("/add", protect, addFunds);

// GET WALLET
router.get("/me", protect, getMyWallet);

// GET TRANSACTIONS
router.get("/transactions", protect, getMyTransactions);

module.exports = router;
