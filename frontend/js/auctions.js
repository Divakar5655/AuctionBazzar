const API_BASE = "https://auctionbazzar.onrender.com/api"
let allAuctions = [];
let currentFilter = "all";
let currentCategory = "all"; 

// TIMER
function getRemainingTime(endTime) {
  const end = new Date(endTime);
  const now = new Date();
  const diff = end - now;
  if (diff <= 0) return "Ended";
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hrs}h ${mins}m`;
}

function goToindex() {
  window.location.href = "index.html";
}
function goToCreateAuction() {
  const token = localStorage.getItem("token");
  if (!token) return (window.location.href = "login.html");
  window.location.href = "create-auction.html";
}
window.goToCreateAuction = goToCreateAuction;

function goToDashboard() {
  window.location.href = "dashboard.html";
}
window.goToDashboard = goToDashboard;

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
window.logout = logout;

/* ================= CARD CREATOR ================= */
function createCard(a) {
  let priceText = "";

  if (a.status === "upcoming") {
    priceText = `Base Price: ₹${a.basePrice}`;
  }

  if (a.status === "active") {
    priceText = `Base Price: ₹${a.basePrice}<br>Current Bid: ₹${a.currentHighestBid || a.basePrice}`;
  }

  if (a.status === "completed") {
    priceText = `Base Price: ₹${a.basePrice}<br>Sold Price: ₹${a.soldPrice}`;
  }

  const imageUrl =
    a.images && a.images.length > 0
      ? `https://auctionbazzar.onrender.com${a.images[0]}`
      : "https://via.placeholder.com/400x200";

  return `
  <div class="auction-card">
    <div class="image-box">
      <img src="${imageUrl}" />
      <div class="timer">${getRemainingTime(a.endTime)}</div>
    </div>

    <div class="card-body">
      <div class="category-badge">${a.category}</div>

      <div class="card-title">
        ${a.title} - ${
    a.description ? a.description.split(" ").slice(0, 3).join(" ") : ""
  }...
      </div>

      <div class="status ${a.status}">Status: ${a.status}</div>
      <div class="price">${priceText}</div>

      <button class="bid-btn"
      onclick="window.location.href='auction-detail.html?id=${a._id}'">
      View Auction
      </button>
    </div>
  </div>`;
}

/* ================= LOAD AUCTIONS ================= */
async function loadAuctions() {
  const res = await fetch(`${API_BASE}/auctions`);
  allAuctions = await res.json();
  renderFeatured();
  renderAuctions();
}

/* ================= FEATURED ================= */
function renderFeatured() {
  const container = document.getElementById("featuredAuctions");
  const featured = allAuctions.filter(a =>
    (a.status === "active" && a.currentHighestBid >= 30000) ||
    (a.status === "completed" && a.soldPrice >= 50000)
  );

  container.innerHTML = "";
  featured.forEach((a) => (container.innerHTML += createCard(a)));
}

/* ================= FILTER SYSTEM ================= */
function renderAuctions() {
  let filtered = allAuctions;

  // CATEGORY FILTER
  if (currentCategory !== "all") {
    filtered = filtered.filter(a =>
      a.category && a.category.toLowerCase() === currentCategory
    );
  }

  // STATUS FILTER
  if (currentFilter === "upcoming")
    filtered = filtered.filter(a => a.status === "upcoming");

  if (currentFilter === "hot")
    filtered = filtered.filter(a => a.status === "active");

  if (currentFilter === "completed")
    filtered = filtered.filter(a => a.status === "completed");

  if (currentFilter === "ending") {
    filtered = filtered.filter(a => {
      const diff = new Date(a.endTime) - new Date();
      return diff > 0 && diff < 5 * 60 * 1000;
    });
  }

  const list = document.getElementById("auctionList");
  list.innerHTML = "";
  filtered.forEach(a => list.innerHTML += createCard(a));
}

/* ================= TAB BUTTONS ================= */
document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    
    if (currentFilter === "all") {
      renderFeatured();
    } else {
      document.getElementById("featuredAuctions").innerHTML = "";
    }
    renderAuctions();
  });
});

document.querySelectorAll(".category-bar button").forEach(btn => {
  btn.addEventListener("click", () => {

    document.querySelectorAll(".category-bar button")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    currentCategory = btn.innerText.toLowerCase();
    renderAuctions();
  });
});

/* ================= SEARCH ================= */
document.querySelector(".search-bar").addEventListener("input", e => {
  const text = e.target.value.toLowerCase();

  const filtered = allAuctions.filter(a =>
    a.title.toLowerCase().includes(text) ||
    (a.category && a.category.toLowerCase().includes(text))
  );

  const list = document.getElementById("auctionList");
  list.innerHTML = "";
  filtered.forEach(a => list.innerHTML += createCard(a));
});

/* ================= START ================= */
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    document.getElementById("createBtn").style.display = "none";
    //document.getElementById("dashboardIcon").style.display = "none";
    document.getElementById("logoutBtn").style.display = "none";
  }
  loadAuctions();
});


