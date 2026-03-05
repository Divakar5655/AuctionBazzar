const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require("./cron/auctionCron");
const adminRoutes = require("./routes/adminRoutes");
const auctionRoutes = require("./routes/auctionRoutes");
const walletRoutes = require("./routes/walletRoutes");
const path= require("path");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/auctiondb";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected 🚀"))
  .catch((err) => console.log("Mongo error:", err));

// TEST ROUTE
app.get("/api/test-user", async (req, res) => {
  try {
    let user = await User.findOne({ email: "test@auctionbazaar.com" });

    if (!user) {
      user = await User.create({
        name: "Test User",
        email: "test@auctionbazaar.com",
        password: "temp123",
        role: "user",
        totalBalance: 1000,
        blockedBalance: 200,
      });
    }

    res.json({
      message: "Test user OK",
      user,
      availableBalance: user.availableBalance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ AUTH ROUTES yaha mount kar
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/admin", adminRoutes);

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
}); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
