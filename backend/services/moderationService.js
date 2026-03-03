const path = require("path");

// 🔥 SMART CATEGORY KEYWORDS (AI LABEL FRIENDLY)
const categoryMap = {
  vehicles: [
    "car","vehicle","truck","motorcycle","bike","bicycle","scooter",
    "van","bus","auto","jeep","taxi","supercar","sports car","sedan"
  ],

  furniture: [
    "sofa","couch","chair","table","desk","bed","furniture",
    "cabinet","wardrobe","drawer","shelf","bench","stool"
  ],

  electronics: [
    "laptop","computer","tv","television","monitor","tablet","camera","speaker","fridge",
    "refrigerator","ac","air conditioner","fan","electronics"
  ],

  fashion: [
    "shirt","tshirt","jacket","coat","jeans","pants","dress",
    "shoe","sneaker","watch","bag","handbag","backpack","ring","necklace","bracelet","hat","cap",
    "clothes","clothing","fashion","accessory"
  ],

  mobiles: [
    "phone","mobile","smartphone","iphone","android","cellphone"
  ]
};

function textMatch(text, words) {
  text = text.toLowerCase();
  return words.some(w => text.includes(w));
}

async function autoModerateAuction(auction) {
  console.log("🤖 AI moderation scheduled for:", auction.title);

  setTimeout(async () => {
    const Auction = require("../models/Auction");

    const freshAuction = await Auction.findById(auction._id);
    if (!freshAuction || freshAuction.approvedBy) {
      console.log("⛔ Admin already handled");
      return;
    }

    const title = freshAuction.title.toLowerCase();
    const fileName = freshAuction.images?.[0]?.toLowerCase() || "";
    const category = freshAuction.category.toLowerCase();

    let matchedCategory = null;

    for (const cat in categoryMap) {
      const words = categoryMap[cat];
      if (textMatch(title, words) || textMatch(fileName, words)) {
        matchedCategory = cat;
        break;
      }
    }

    if (!matchedCategory) {
      freshAuction.status = "rejected";
      freshAuction.aiDecision = "rejected";
      freshAuction.aiReason = "No keyword match";
    } else if (matchedCategory !== category) {
      freshAuction.status = "rejected";
      freshAuction.aiDecision = "rejected";
      freshAuction.aiReason = "Keyword does not match selected category";
    } else {
      freshAuction.status = "upcoming";
      freshAuction.aiDecision = "approved";
      freshAuction.aiReason = "Keyword matched category";
    }

    await freshAuction.save();
    console.log("🤖 AI Decision:", freshAuction.aiDecision);
  }, 40000);
}

module.exports = { autoModerateAuction };
