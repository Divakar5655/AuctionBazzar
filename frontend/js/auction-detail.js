const API_BASE = "https://auctionbazzar.onrender.com"

const timeBar = document.getElementById("auctionTimeBar");
const auctionTimer = document.getElementById("auctionTimer");

let images = [];
let currentIndex = 0;

const params = new URLSearchParams(window.location.search);
const auctionId = params.get("id");
const token = localStorage.getItem("token");

// ===== AUTH NAV FIX =====
const navRight = document.querySelector(".nav-right");
const tokenCheck = localStorage.getItem("token");

if (!tokenCheck) {
  navRight.innerHTML = `
    <a href="auctions.html">All Auctions</a>
    <a href="login.html">Login</a>
  `;
}

if (!auctionId) {
  alert("Auction ID missing");
  throw new Error("Auction ID missing");
}

if (!auctionId) {
  alert("Invalid auction");
  window.location.href = "dashboard.html";
}

let timeInterval = null;
let bidInterval = null;

// LOAD AUCTION
fetch(`${API_BASE}/auctions/${auctionId}`, {
  headers: token ? { Authorization: `Bearer ${token}` } : {}
})
  .then(res => res.json())
  .then(auction => {
    
    if (auction.images && auction.images.length > 0) {
      images = auction.images.map(img => `${API_BASE}${img}`);
      currentIndex = 0;
      showImage();
    } else {
        document.getElementById("mainImage").src =
        "https://via.placeholder.com/300x200?text=No+Image";
      }
      
      const thumbContainer = document.getElementById("thumbContainer");
      thumbContainer.innerHTML = "";
      images.forEach((img, i) => {
        const t = document.createElement("img");
        t.src = img;
        t.onclick = () => {
          currentIndex = i;
          showImage();
        };
        thumbContainer.appendChild(t);
      });
      
      document.getElementById("title").innerText = auction.title;
      document.getElementById("description").innerText = auction.description;
      document.getElementById("status").innerText = auction.status;
      document.getElementById("basePrice").innerText = auction.basePrice;
      
      const bidSection = document.getElementById("bidSection");

    // RESET
    clearInterval(timeInterval);
    clearInterval(bidInterval);
    bidSection.style.display = "none";

    // UPCOMING

    if (auction.status === "upcoming") {
      document.getElementById("winnerSection").style.display = "none";
      //document.getElementById("currentBid").innerText = auction.basePrice;

      timeBar.style.display = "flex";
      timeBar.className = "detail-time-bar time-upcoming";
      document.getElementById("timeLabel").innerText = "Starts In";
      
      timeInterval = setInterval(() => {
        const left = getTimeLeft(auction.startTime);
        auctionTimer.innerText = left;
      }, 1000);
      showUpcomingHistory();
    }

    // ACTIVE

    if (auction.status === "active") {
      document.getElementById("priceLabel").innerText = "Current Price";
      //document.getElementById("winnerSection").style.display = "none";

      const currentPrice =
        auction.currentHighestBid && auction.currentHighestBid > 0
          ? auction.currentHighestBid
          : auction.basePrice;

      document.getElementById("currentBid").innerText = currentPrice;

      bidSection.style.display = "block";
      timeBar.style.display = "flex";
      document.getElementById("timeLabel").innerText = "Time Left";

      timeInterval = setInterval(() => {
        const diff = new Date(auction.endTime) - new Date();
        
        if (diff <= 60000) {
          timeBar.className = "detail-time-bar time-ending";
        } else {
          timeBar.className = "detail-time-bar time-active";
        }
        
        auctionTimer.innerText = getTimeLeft(auction.endTime);
      }, 1000);
      
      loadBidHistory();
      bidInterval = setInterval(loadBidHistory, 5000);
    }

    // COMPLETED
    if (auction.status === "completed") {
      const finalPrice = auction.soldPrice || auction.currentHighestBid;
      
      if (!finalPrice || finalPrice === 0) {
        document.getElementById("priceLabel").innerText = "Auction";
        document.getElementById("currentBid").innerText = "UNSOLD";
        document.getElementById("winnerSection").style.display = "none";
      } else {
        document.getElementById("priceLabel").innerText = "Sold Price";
        document.getElementById("currentBid").innerText = finalPrice;
        
        loadBidHistory(true);
      }
    }
  })
  .catch(err => {
    console.error(err);
    alert("Failed to load auction");
  });

// RAISE BID
function raiseBid() {
  fetch(`${API_BASE}/auctions/${auctionId}/bid`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ type: "raise" })
  })
  .then(res => {
    if (!res.ok) throw new Error();
    return res.json();
  })
  .then(() => {
    document.getElementById("bidMsg").innerText = "Bid raised successfully";
    loadBidHistory();
  })
  .catch(() => alert("Raise bid failed"));
}

// MONSTER BID
function monsterBid() {
  const ok = confirm("Are you sure? Monster Bid will jump the price!");
  if (!ok) return;

  fetch(`${API_BASE}/auctions/${auctionId}/bid`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ type: "monster" })
  })
  .then(res => {
    if (!res.ok) throw new Error();
    return res.json();
  })
  .then(() => {
    document.getElementById("bidMsg").innerText = "🔥 Monster Bid placed!";
    loadBidHistory();
  })
  .catch(() => alert("Monster bid failed"));
}

// BID HISTORY
function loadBidHistory(showWinner = false) {
  fetch(`${API_BASE}/auctions/${auctionId}/bids`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
    .then(res => res.json())
    .then(({ bids }) => {
      const list = document.getElementById("bidHistory");
      list.innerHTML = "";

      if (!bids || bids.length === 0) {
        list.innerHTML = "<li>No bids yet</li>";
        return;
      }

      if (showWinner) {
        document.getElementById("winnerSection").style.display = "block";
        document.getElementById("winnerName").innerText =
          bids[0].bidderId?.name || "User";
      }

      bids.forEach(bid => {
        const li = document.createElement("li");
        const time = new Date(bid.createdAt).toLocaleString();
        li.innerText = `User - ₹${bid.amount} • ${time}`;
        list.appendChild(li);
      });

      // sync current price with latest bid
      document.getElementById("currentBid").innerText = bids[0].amount;
    })
    .catch(err => console.error(err));
}
// UPCOMING HISTORY
function showUpcomingHistory() {
  document.getElementById("bidHistory").innerHTML =
    "<li>Bid history will be available after auction starts.</li>";
}
// TIME LEFT
function getTimeLeft(endTime) {
  const diff = new Date(endTime) - new Date();
  if (diff <= 0) return "Ended";

  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return `${h}h ${m}m ${s}s`;
}

// IMAGE GALLERY
function showImage() {
  const leftArrow = document.querySelector(".left-arrow");
  const rightArrow = document.querySelector(".right-arrow");
  const thumbs = document.querySelectorAll("#thumbContainer img");
  thumbs.forEach((t, i) => {
    t.style.border = i === currentIndex ? "2px solid #2874f0" : "2px solid transparent";
    });

  if (!images || images.length === 0) return;

  document.getElementById("mainImage").src = images[currentIndex];

  if (images.length > 1) {
    leftArrow.style.display = "block";
    rightArrow.style.display = "block";
  } else {
    leftArrow.style.display = "none";
    rightArrow.style.display = "none";
  }
}

function nextImage() {
    if (images.length === 0) return;
    currentIndex = (currentIndex + 1) % images.length;
    showImage();
}

function prevImage() {
    if (images.length === 0) return;
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage();
}
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
