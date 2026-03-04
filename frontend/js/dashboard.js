import { API_BASE, api } from "./api.js";

window.onload = () => {
  checkAuth();
  loadProfile();
  loadStats();
  loadMyAuctions();
  loadMyBids();
  loadWallet();
};

const role = localStorage.getItem("role");
if (role === "admin") {
    window.location.href = "admin.html";
}

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

function checkAuth(){
  const token = localStorage.getItem("token");
  if(!token){
    window.location.href = "login.html";
  }
}

function showSection(event, id) {
  event.preventDefault();

  // Hide all sections
  document.querySelectorAll(".page-section").forEach(sec => {
    sec.style.display = "none";
  });

  // Show selected
  document.getElementById(id).style.display = "block";

  // Active sidebar highlight
  document.querySelectorAll(".sidebar a").forEach(a => {
    a.classList.remove("active");
  });

  event.currentTarget.classList.add("active");
}

// PROFILE
async function loadProfile(){
  const res = await api("/auth/me");
  document.getElementById("welcomeText").innerText = `Welcome back, ${res.name}!`;
  document.getElementById("editName").value = res.name;
  document.getElementById("editEmail").value = res.email;
}

async function saveProfile(){
  const name = document.getElementById("editName").value;
  const email = document.getElementById("editEmail").value;

  const res = await fetch(`${API_BASE}/auth/update-profile`,{
    method:"PUT",
    headers:{
      "Content-Type":"application/json",
      Authorization:"Bearer "+localStorage.getItem("token")
    },
    body:JSON.stringify({name,email})
  });

  const data = await res.json();
  document.getElementById("profileMsg").innerText = data.message;
}

// STATS
async function loadStats(){
  const stats = await api("/auctions/dashboard-stats");
  document.getElementById("statActive").innerText = stats.activeAuctions;
  document.getElementById("statBids").innerText = stats.totalBids;
  document.getElementById("statWon").innerText = stats.itemsWon;
  document.getElementById("statEarnings").innerText = stats.totalEarnings;
}

// MY AUCTIONS
async function loadMyAuctions(){
  const auctions = await api("/auctions/my-auctions");
  const table = document.getElementById("myAuctionsTable");
  table.innerHTML = "";

  auctions.forEach(a => {

    let statusLabel = "";
    let statusClass = "";

    if(a.status === "active"){
      statusLabel = "Active";
      statusClass = "status-green";
    }
    else if(a.status === "completed"){
      statusLabel = "Sold";
      statusClass = "status-white";
    }
    else if(a.status === "rejected"){
      statusLabel = "Rejected";
      statusClass = "status-red";
    }
    else{
      statusLabel = a.status;
      statusClass = "status-white";
    }

    table.innerHTML += `
      <tr>
        <td>${a.title}</td>
        <td>₹${a.currentHighestBid || 0}</td>
        <td>${a.bids || 0}</td>
        <td>
          <span class="status-badge ${statusClass}">
            ${statusLabel}
          </span>
        </td>
        <td>
          <span class="${getTimeLeft(a.endTime)==='Completed'?'time-red':'time-green'}">
            ${getTimeLeft(a.endTime)}
          </span>
        </td>
        <td>
          <button class="view-btn" onclick="viewAuction('${a._id}')">View</button>
        </td>
      </tr>
    `;
  });
}

// MY BIDS
async function loadMyBids(){
  const bids = await api("/auctions/my-bids");
  const table = document.getElementById("myBidsTable");
  table.innerHTML = "";

  bids.forEach(b => {

    let statusText = "";
    let showRebid = false;
    let rowClass = "";

    if(b.status === "active"){
      if(b.myBid === b.currentBid){
        statusText = "Winning";
        rowClass = "row-green";
      } else {
        statusText = "Outbid";
        rowClass = "row-red";
      }
      showRebid = true;
    }
    else if(b.status === "completed"){
      if(b.myBid === b.currentBid){
        statusText = "Won";
        rowClass = "row-green";
      } else {
        statusText = "Lost";
        rowClass = "row-red";
      }
    }
    else{
      statusText = b.status;
    }

    table.innerHTML += `
      <tr class="${rowClass}">
        <td>${b.title}</td>
        <td>₹${b.myBid}</td>
        <td>₹${b.currentBid}</td>
        <td>
        <span class="status-badge ${rowClass === 'row-green' ? 'status-green' : 'status-red'}">
        ${statusText}
        </span>
        </td>
        <td>
          <button class="view-white" onclick="viewAuction('${b.auctionId}')">View</button>
          ${showRebid ? 
            `<button class="rebid-black" onclick="bidAgain('${b.auctionId}')">Bid Again</button>`
            : ""}
        </td>
      </tr>
    `;
  });
}

function viewAuction(id){
  window.location.href = `auction-detail.html?id=${id}`;
}

function bidAgain(id){
  window.location.href = `auction-detail.html?id=${id}&rebid=true`;
}

//TIME LEFT
function getTimeLeft(endTime) {
  const diff = new Date(endTime) - new Date();
  if (diff <= 0) return "Completed";

  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff / (1000 * 60)) % 60);

  return `${hrs}h ${mins}m`;
}

// WALLET
async function loadWallet(){
  const wallet = await api("/wallet/me");
  document.getElementById("walletAvailable").innerText = wallet.availableBalance;
  document.getElementById("walletBlocked").innerText = wallet.blockedBalance;
}

function openAddFundsModal(){
  document.getElementById("addFundsModal").style.display="flex";
}

function closeAddFundsModal(){
  document.getElementById("addFundsModal").style.display="none";
  document.getElementById("addFundsMsg").innerText="";
  document.getElementById("addAmount").value="";
}

function addFunds(){
  const amount = document.getElementById("addAmount").value;

  if(!amount || amount <= 0){
    document.getElementById("addFundsMsg").innerText="Enter valid amount";
    return;
  }

  fetch(`${API_BASE}/wallet/add`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      Authorization:"Bearer "+localStorage.getItem("token")
    },
    body: JSON.stringify({ amount: Number(amount) })
  })
  .then(res=>res.json())
  .then(data=>{
    document.getElementById("addFundsMsg").innerText="Money added successfully!";
    setTimeout(()=>{
      closeAddFundsModal();
      loadWallet();
    },800);
  })
  .catch(()=>{
    document.getElementById("addFundsMsg").innerText="Failed to add money";
  });
}

// LOGOUT
function logout(){
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}

window.showSection = showSection;
window.logout = logout;
window.openAddFundsModal = openAddFundsModal;
window.closeAddFundsModal = closeAddFundsModal;
window.addFunds = addFunds;
window.saveProfile = saveProfile;