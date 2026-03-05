import { API_BASE } from "./api.js";

const electronicsQuestions = [
  {
    question: "What is the current condition of the product?",
    options: [
      { text: "Brand New", value: 4 },
      { text: "Like New", value: 3 },
      { text: "Used", value: 2 },
      { text: "Heavily Used", value: 1 }
    ]
  },
  {
    question: "What is the warranty status of the product?",
    options: [
      { text: "More than 1 year warranty remaining", value: 4 },
      { text: "6–12 months remaining", value: 3 },
      { text: "Less than 6 months remaining", value: 2 },
      { text: "No warranty available", value: 1 }
    ]
  },
  {
    question: "Is the original purchase invoice available?",
    options: [
      { text: "Yes, original invoice available", value: 4 },
      { text: "Soft copy available", value: 3 },
      { text: "Partial documentation available", value: 2 },
      { text: "No invoice available", value: 1 }
    ]
  },
  {
    question: "Are original accessories included?",
    options: [
      { text: "Yes, all original accessories included", value: 4 },
      { text: "Some original accessories included", value: 3 },
      { text: "Few original accessories included", value: 2 },
      { text: "No accessories included", value: 1 }
    ]
  },
  {
    question: "Is there any physical damage on the product?",
    options: [
      { text: "No physical damage", value: 4 },
      { text: "Minor scratches only", value: 3 },
      { text: "Visible wear and tear", value: 2 },
      { text: "Major damage present", value: 1 }
    ]
  },
  {
    question: "How long has the product been used?",
    options: [
      { text: "Less than 3 months", value: 4 },
      { text: "Less than 1 year", value: 3 },
      { text: "1–2 years", value: 2 },
      { text: "More than 2 years", value: 1 }
    ]
  },
  {
    question: "How would you rate the brand reputation?",
    options: [
      { text: "Excellent", value: 4 },
      { text: "Good", value: 3 },
      { text: "Average", value: 2 },
      { text: "Poor", value: 1 }
    ]
  },
  {
    question: "What is the battery health status (if applicable)?",
    options: [
      { text: "Above 90% health", value: 4 },
      { text: "Between 80–90% health", value: 3 },
      { text: "Between 70–80% health", value: 2 },
      { text: "Below 70% health", value: 1 }
    ]
  },
  {
    question: "What is the current market demand for this product?",
    options: [
      { text: "High demand", value: 4 },
      { text: "Moderate demand", value: 3 },
      { text: "Low demand", value: 2 },
      { text: "No demand", value: 1 }
    ]
  },
  {
    question: "Has the product ever been repaired?",
    options: [
      { text: "Never repaired", value: 4 },
      { text: "Minor repairs", value: 3 },
      { text: "Major repairs", value: 2 },
      { text: "Repaired multiple times", value: 1 }
    ]
  }
];

const vehicleQuestions = [
  {
    question: "What is the current overall condition of the vehicle?",
    options: [
      { text: "Excellent condition", value: 4 },
      { text: "Good condition", value: 3 },
      { text: "Average condition", value: 2 },
      { text: "Needs major repair", value: 1 }
    ]
  },
  {
    question: "What is the total distance driven?",
    options: [
      { text: "Less than 10,000 km", value: 4 },
      { text: "10,000–50,000 km", value: 3 },
      { text: "50,000–100,000 km", value: 2 },
      { text: "More than 100,000 km", value: 1 }
    ]
  },
  {
    question: "Is the vehicle accident-free?",
    options: [
      { text: "Completely accident-free", value: 4 },
      { text: "Minor accident history", value: 3 },
      { text: "Moderate damage history", value: 2 },
      { text: "Major accident history", value: 1 }
    ]
  },
  {
    question: "What is the current engine mileage performance of the vehicle?",
    options: [
      { text: "Excellent mileage as per manufacturer standard", value: 4 },
      { text: "Good mileage with minor variation", value: 3 },
      { text: "Average mileage performance", value: 2 },
      { text: "Poor mileage performance", value: 1 }
    ]
  },
  {
    question: "What is the fuel efficiency condition?",
    options: [
      { text: "Excellent efficiency", value: 4 },
      { text: "Good efficiency", value: 3 },
      { text: "Average efficiency", value: 2 },
      { text: "Poor efficiency", value: 1 }
    ]
  },
  {
    question: "Are all original documents available?",
    options: [
      { text: "All documents available", value: 4 },
      { text: "Most documents available", value: 3 },
      { text: "Some documents missing", value: 2 },
      { text: "Major documents missing", value: 1 }
    ]
  },
  {
    question: "Is insurance active?",
    options: [
      { text: "More than 1 year remaining", value: 4 },
      { text: "Less than 1 year remaining", value: 3 },
      { text: "About to expire", value: 2 },
      { text: "No insurance", value: 1 }
    ]
  },
  {
    question: "What is the tire condition?",
    options: [
      { text: "Brand new tires", value: 4 },
      { text: "Good condition tires", value: 3 },
      { text: "Worn tires", value: 2 },
      { text: "Need replacement", value: 1 }
    ]
  },
  {
    question: "How many previous owners?",
    options: [
      { text: "First owner", value: 4 },
      { text: "Second owner", value: 3 },
      { text: "Third owner", value: 2 },
      { text: "Multiple owners", value: 1 }
    ]
  },
  {
    question: "What is the market demand of this model?",
    options: [
      { text: "Very high demand", value: 4 },
      { text: "High demand", value: 3 },
      { text: "Moderate demand", value: 2 },
      { text: "Low demand", value: 1 }
    ]
  }
];

const mobileQuestions = [
  {
    question: "What is the overall physical condition of the mobile?",
    options: [
      { text: "Like brand new", value: 4 },
      { text: "Minor scratches", value: 3 },
      { text: "Visible wear", value: 2 },
      { text: "Cracked/damaged", value: 1 }
    ]
  },
  {
    question: "What is the battery health percentage?",
    options: [
      { text: "Above 95%", value: 4 },
      { text: "85–95%", value: 3 },
      { text: "70–85%", value: 2 },
      { text: "Below 70%", value: 1 }
    ]
  },
  {
    question: "Is the original charger included?",
    options: [
      { text: "Original charger included", value: 4 },
      { text: "Compatible charger included", value: 3 },
      { text: "No charger included", value: 2 },
      { text: "Damaged charger", value: 1 }
    ]
  },
  {
    question: "Is the display in good condition?",
    options: [
      { text: "Perfect display", value: 4 },
      { text: "Minor scratches", value: 3 },
      { text: "Dead pixels present", value: 2 },
      { text: "Cracked display", value: 1 }
    ]
  },
  {
    question: "Has the phone ever been repaired?",
    options: [
      { text: "Never repaired", value: 4 },
      { text: "Minor repair", value: 3 },
      { text: "Major repair", value: 2 },
      { text: "Multiple repairs", value: 1 }
    ]
  },
  {
    question: "Is the device under warranty?",
    options: [
      { text: "More than 6 months", value: 4 },
      { text: "Less than 6 months", value: 3 },
      { text: "Expired warranty", value: 2 },
      { text: "No warranty ever", value: 1 }
    ]
  },
  {
    question: "Is the storage capacity sufficient for market demand?",
    options: [
      { text: "High storage variant", value: 4 },
      { text: "Mid storage variant", value: 3 },
      { text: "Low storage variant", value: 2 },
      { text: "Very low storage", value: 1 }
    ]
  },
  {
    question: "Is the brand reputation strong?",
    options: [
      { text: "Premium brand", value: 4 },
      { text: "Well-known brand", value: 3 },
      { text: "Average brand", value: 2 },
      { text: "Low brand value", value: 1 }
    ]
  },
  {
    question: "What is the resale market demand?",
    options: [
      { text: "Very high demand", value: 4 },
      { text: "High demand", value: 3 },
      { text: "Moderate demand", value: 2 },
      { text: "Low demand", value: 1 }
    ]
  },
  {
    question: "Are all accessories available?",
    options: [
      { text: "All accessories available", value: 4 },
      { text: "Most accessories available", value: 3 },
      { text: "Few accessories", value: 2 },
      { text: "No accessories", value: 1 }
    ]
  }
];

let evaluationAnswers = [];
let evaluationCompleted = false;

// Category based base price
const categoryPrices = {
  electronics: 8000,
  vehicles: 15000,
  mobiles: 10000
};

const imageInput = document.getElementById("images");
const previewContainer = document.getElementById("imagePreview");

let selectedFiles = [];

imageInput.addEventListener("change", function (e) {
    selectedFiles = Array.from(e.target.files);
    renderPreview();
});

function renderPreview() {
  previewContainer.innerHTML = "";

  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const div = document.createElement("div");
      div.classList.add("preview-item");

      if (index === 0) {
        div.classList.add("cover");
      }

      div.innerHTML = `
        <img src="${e.target.result}">
        ${index === 0 ? `<span class="cover-badge">Cover</span>` : ""}
        <button class="remove-btn" data-index="${index}">×</button>
      `;

      // 🔥 REMOVE EVENT DIRECTLY HERE
      div.querySelector(".remove-btn").addEventListener("click", function (ev) {
        ev.stopPropagation();
        selectedFiles.splice(index, 1);
        renderPreview();
      });

      // 🔥 Cover select
      div.addEventListener("click", function (event) {
        if (event.target.classList.contains("remove-btn")) return;

        selectedFiles.unshift(selectedFiles.splice(index, 1)[0]);
        renderPreview();
      });

      previewContainer.appendChild(div);
    };

    reader.readAsDataURL(file);
  });
}

function renderQuestions(questions) {
  const container = document.getElementById("questionsContainer");
  container.innerHTML = "";

  questions.forEach((q, index) => {
    const div = document.createElement("div");
    div.classList.add("question-box");

    let optionsHTML = "";

    q.options.forEach(opt => {
      optionsHTML += `
        <label>
          <input type="radio" name="question${index}" value="${opt.value}">
          ${opt.text}
        </label><br>
      `;
    });

    div.innerHTML = `
      <p><strong>${index + 1}. ${q.question}</strong></p>
      ${optionsHTML}
    `;

    container.appendChild(div);
  });
}

document.getElementById("questionSubmitBtn").addEventListener("click", function() {

  let answers = [];
  const totalQuestions = document.querySelectorAll(".question-box").length;

  for (let i = 0; i < totalQuestions; i++) {
    const selected = document.querySelector(`input[name="question${i}"]:checked`);
    if (!selected) {
      alert("Please answer all questions");
      return;
    }
    answers.push(Number(selected.value));
  }

  evaluationAnswers = answers;
  evaluationCompleted = true;

  const totalPoints = answers.reduce((a,b)=>a+b,0);
  const expectedPrice = Number(document.getElementById("expectedPrice").value);
  const category = document.getElementById("category").value;

  let multiplier = 1;

  if (totalPoints <= 10) multiplier = 0.5;
  else if (totalPoints <= 20) multiplier = 1;
  else if (totalPoints <= 30) multiplier = 1.5;
  else multiplier = 2;
  
  let base = categoryPrices[category] * multiplier;

  if (totalPoints >= 35) {
    let specialCap = 0;
    if (category === "vehicles") specialCap = 50000;
    if (category === "electronics") specialCap = 25000;
    if (category === "mobiles") specialCap = 20000;
    base = Math.min(expectedPrice, specialCap);
  } else {
    if (base > expectedPrice) base = expectedPrice;
  }

  const finalBase = Math.round(base / 100) * 100;

  document.getElementById("basePrice").value = finalBase;

  // 🔥 DESCRIPTION GENERATION FIX
  const descriptionText = generateProfessionalDescription(
    category,
    answers,
    totalPoints,
    finalBase
  );

  document.getElementById("description").value = descriptionText;

  document.getElementById("questionModal").style.display = "none";
});

// Auto set base price when category changes
document.getElementById("category").addEventListener("change", function () {
  const selected = this.value;

  if (!document.getElementById("expectedPrice").value) {
    alert("Please enter expected price first");
    this.value = "";
    return;
  }

  if (selected === "electronics") {
    renderQuestions(electronicsQuestions);
    document.getElementById("questionModal").style.display = "block";
  }

  if (selected === "vehicles") {
    renderQuestions(vehicleQuestions);
    document.getElementById("questionModal").style.display = "block";
  }

  if (selected === "mobiles") {
    renderQuestions(mobileQuestions);
    document.getElementById("questionModal").style.display = "block";
  }
});

document.querySelector(".modal-cancel").addEventListener("click", function(){
  document.getElementById("questionModal").style.display = "none";
});

function generateProfessionalDescription(category, answers, totalPoints, basePrice) {

  let grade = "";

  if (totalPoints >= 35) grade = "Premium Grade Condition";
  else if (totalPoints >= 25) grade = "Excellent Condition";
  else if (totalPoints >= 15) grade = "Good Condition";
  else grade = "Average Condition";

  return `
This product has undergone a professional 10-point evaluation process.
Product Category: ${category}
Overall Condition Grade: ${grade}
Total Evaluation Score: ${totalPoints}/40
Based on detailed analysis including physical condition, demand, documentation, and performance metrics.
The item reflects reliability, authenticity, and competitive resale value in the current market.
This listing ensures transparency and structured valuation for serious buyers.
`;
}

document.getElementById("createAuctionForm")
.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!evaluationCompleted) {
    alert("Please complete product evaluation first");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first");
    return;
  }

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;
  const expectedPrice = document.getElementById("expectedPrice").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const imagesInput = document.getElementById("images");

  if (!title || !description || !category || !expectedPrice) {
    alert("❌ Invalid input");
    return;
  }

  if (new Date(endTime) <= new Date(startTime)) {
    alert("❌ End time must be after start time");
    return;
  }

  const formData = new FormData();

  formData.append("title", title);
  formData.append("description", description);
  formData.append("category", category);
  formData.append("expectedPrice", expectedPrice);
  formData.append("startTime", startTime);
  formData.append("endTime", endTime);

  formData.append("answers", JSON.stringify(evaluationAnswers));

  for (let i = 0; i < imagesInput.files.length && i < 10; i++) {
    formData.append("images", imagesInput.files[i]);
  }
  

  const res = await fetch(`${API_BASE}/auctions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await res.json();

  if (res.ok) {
    alert("✅ Auction submitted");
    window.location.href = "auctions.html";
  } else {
    alert("❌ " + result.message);
  }
});
