window.onload = () => {
  loadFeatured();
  initCounter();
  getRemainingTime();
  scrollReveal();
  setupAuth();
};

function getRemainingTime(endTime){
  const end = new Date(endTime);
  const now = new Date();
  const diff = end - now;

  if(diff <= 0) return "Ended";

  const hrs = Math.floor(diff/(1000*60*60));
  const mins = Math.floor((diff%(1000*60*60))/(1000*60));

  return `${hrs}h ${mins}m`;
}

async function loadFeatured(){
  try{
    const auctions = await api("/auctions");

    const featured = auctions.slice(0,4); // SIMPLE

    const container = document.getElementById("featuredAuctions");
    container.innerHTML="";

    featured.forEach(a=>{
      container.innerHTML+=`
        <div class="auction-card">
          <img class="auction-img" src="http://localhost:5000${a.images[0] || ''}">
          <div class="card-body">
            <div class="category-badge">${a.category || "featuredAuction"}</div>
            <div class="card-title">${a.title}</div>
            <div class="status ${a.status}">${a.status}</div>
            <p class="home-price">₹${a.currentHighestBid && a.currentHighestBid > 0
              ? a.currentHighestBid
              : a.basePrice}
              </p>
            <a href="auction-detail.html?id=${a._id}">
              <button class="bid-btn">View Auction</button>
            </a>
          </div>
        </div>
      `;
    });

  }catch(err){
    console.error(err);
  }
}

function initCounter(){
  const counters = document.querySelectorAll(".counter");

  counters.forEach(counter=>{
    const target = +counter.getAttribute("data-target");
    let count = 0;
    const step = target / 100;

    const update = () => {
      count += step;
      if(count < target){
        counter.innerText = Math.floor(count).toLocaleString();
        requestAnimationFrame(update);
      } else {
        counter.innerText = target.toLocaleString();
      }
    };
    update();
  });
}

function scrollReveal(){
  const reveals = document.querySelectorAll(".reveal");

  window.addEventListener("scroll", ()=>{
    reveals.forEach(el=>{
      const top = el.getBoundingClientRect().top;
      if(top < window.innerHeight - 100){
        el.classList.add("active");
      }
    });
  });
}

function setupAuth(){
  const token = localStorage.getItem("token");
  const authLink = document.getElementById("authLink");

  if(token){
    authLink.innerText = "Logout";
    authLink.href = "#";
    authLink.onclick = () => {
      localStorage.removeItem("token");
      location.reload();
    };
  }
}
