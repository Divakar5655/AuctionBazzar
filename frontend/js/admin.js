const API_BASE = "https://auctionbazzar.onrender.com/api"

const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toLowerCase();

if (!token) window.location.href = "login.html";
if (role !== "admin") window.location.href = "dashboard.html";

document.addEventListener("DOMContentLoaded", loadAdmin);

/* ================= SECTION SWITCH ================= */

function showSection(event, section) {
  event.preventDefault();

  document.querySelectorAll(".page-section").forEach(sec => {
    sec.style.display = "none";
  });

  document.getElementById(section + "Section").style.display = "block";

  document.querySelectorAll(".sidebar a").forEach(a => {
    a.classList.remove("active");
  });

  event.currentTarget.classList.add("active");
}

/* ================= API ================= */

async function api(endpoint, options = {}) {
  const res = await fetch(API_BASE + endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error("API Error");
  return res.json();
}

/* ================= LOAD DATA ================= */

async function loadAdmin() {
  try {
    const stats = await api("/admin/stats");
    document.getElementById("totalUsers").innerText = stats.totalUsers || 0;
    document.getElementById("totalAuctions").innerText = stats.totalAuctions || 0;
    document.getElementById("activeAuctions").innerText = stats.activeAuctions || 0;
    document.getElementById("completedAuctions").innerText = stats.completedAuctions || 0
    document.getElementById("totalRevenue").innerText = "₹" + (stats.totalRevenue || 0);
    document.getElementById("pendingRequests").innerText = stats.pendingRequests || 0;
    document.getElementById("avgAuctionValue").innerText = "₹" + (stats.avgAuctionValue || 0);
    document.getElementById("blockedUsers").innerText = stats.blockedUsers || 0;

    const wallet = await api("/admin/wallet");
    document.getElementById("walletBalance").innerText = "₹" + (wallet.totalBalance || 0);
    document.getElementById("blockedBalance").innerText = "₹" + (wallet.blockedBalance || 0);

    loadUsers();
    loadAuctions();
    loadAuctionRequests();

  } catch (err) {
    console.error(err);
  }
}

/* ================= USERS ================= */
async function loadUsers() {
  const users = await api("/admin/users");
  const tbody = document.getElementById("userTableBody");
  tbody.innerHTML = "";

  users.forEach(u => {
    tbody.innerHTML += `
      <tr>
        <td>${u.name}</td>
        <td>
          <span class="status-badge ${
            u.isBlocked ? "status-blocked" : "status-active"
          }">
            ${u.isBlocked ? "Blocked" : "Active"}
          </span>
        </td>

        <td>${u.completedAuctions}</td>
        <td>₹${u.totalSpent}</td>
        <td>₹${u.totalEarn}</td>
        <td>
          ${
            u.isBlocked
              ? `<button class="approve-btn"
                  onclick="toggleBlock('${u._id}')">
                  Unblock
                </button>`
              : `<button class="reject-btn"
                  onclick="toggleBlock('${u._id}')">
                  Block
                </button>`
          }
        </td>
      </tr>
    `;
  });
}

async function toggleBlock(id) {
  try {
    await api(`/admin/users/${id}/block`, {
      method: "PATCH"
    });

    alert("User status updated");
    loadAdmin();

  } catch (err) {
    console.error(err);
    alert("Failed to update user");
  }
}

/* ================= AUCTIONS ================= */

async function loadAuctions() {
  const auctions = await api("/admin/auctions");
  const tbody = document.getElementById("auctionTableBody");
  tbody.innerHTML = "";

  auctions.forEach(a => {
    tbody.innerHTML += `
      <tr>
        <td>${a.title}</td>
        <td><span class="status-badge status-${a.status}">${a.status}</span></td>
        <td>${a.seller?.name || "-"}</td>
        <td>${a.status === "completed" ? "₹" + a.finalPrice : "-"}</td>
        <td>${a.bidCount || 0}</td>
        <td>
          <button onclick="viewAuction('${a._id}')">View</button>
          <button class="reject-btn" onclick="deleteAuction('${a._id}')">Delete</button>
          </td>
          </tr>
          `;
        });
      }

function viewAuction(id) {
  window.location.href = `auction-detail.html?id=${id}`;
}

async function deleteAuction(id) {
  if (!confirm("Are you sure to delete?")) return;

  try {
    await api(`/admin/auctions/${id}`, {
      method: "DELETE"
    });

    alert("Auction deleted");
    loadAuctions();
  } catch (err) {
    alert("Delete failed");
    console.error(err);
  }
}

/* PENDING REQUESTS */
async function loadAuctionRequests() {
  try {
    const requests = await api("/admin/auctions/review");

    const reqList = document.getElementById("auctionRequests");
    reqList.innerHTML = "";

    if (!requests.length) {
      reqList.innerHTML = "<li>No pending requests</li>";
      return;
    }

    requests.forEach(a => {
      reqList.innerHTML += `
      <div class="request-card">
      <h3><strong>
      <a href="/auction-detail.html?id=${a._id}" style="color:blue;text-decoration:underline;">
      ${a.title}
      </a>
      </strong></h3>
      
      <p><b>Seller:</b> ${a.seller?.name || "N/A"}</p>
      <p><b>Base Price:</b> ₹${a.basePrice}</p>
      <p><b>Start:</b> ${new Date(a.startTime).toLocaleString()}</p>
      <p><b>End:</b> ${new Date(a.endTime).toLocaleString()}</p>
      
      <div class="request-buttons">
      <button class="approve-btn" onclick="approveAuction('${a._id}')">
      Approve
      </button>
      <button class="reject-btn" onclick="rejectAuction('${a._id}')">
      Reject
      </button>
      </div>
      </div>
      `;
    });

  } catch (err) {
    console.error("Request Load Error:", err);
  }
}

async function approveAuction(id) {
  await api(`/admin/auctions/${id}/manual-approve`, { method: "PATCH" });
  loadAdmin();
}

async function rejectAuction(id) {
  await api(`/admin/auctions/${id}/manual-reject`, { method: "PATCH" });
  loadAdmin();
}

/* WALLET */
function openAddFundsModal() {
  addFundsModal.style.display = "block";
}

function closeAddFundsModal() {
  addFundsModal.style.display = "none";
  addFundsMsg.innerText = "";
  addAmount.value = "";
}

async function addFunds() {
  const amount = addAmount.value;
  if (!amount || amount <= 0) {
    addFundsMsg.innerText = "Enter valid amount";
    return;
  }

  await api("/wallet/add", {
    method: "POST",
    body: JSON.stringify({ amount: Number(amount) })
  });
  
  addFundsMsg.innerText = "✅Money added successfully!";
  setTimeout(() => {
    closeAddFundsModal();
    loadAdmin();
  }, 800);
}

/* ================= OTHER ================= */

async function downloadCSV() {
  const data = await api("/admin/reports/completed-auctions");
  let csv = "Title,FinalPrice\n";
  data.forEach(r => {
    csv += `${r.title},${r.finalPrice}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "report.csv";
  a.click();
}

function visitSite() {
  window.location.href = "auctions.html";
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}
