const API_BASE = "http://localhost:5000/api";

function showToast(message, success = true) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.style.background = success ? "#16a34a" : "#dc2626";
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// COMMON API REQUEST FUNCTION 
async function apiRequest(endpoint, method = "GET", data = null) {
  const res = await fetch(API_BASE + endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : null,
  });

  return res.json();
}

// REGISTER USER
async function registerUser() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const result = await apiRequest("/auth/register", "POST", {
      name,
      email,
      password
    });

    if (result.error) {
      alert(result.error);
    } else {
      alert("Registration successful");
      window.location.href = "login.html";
    }
  } catch (err) {
    alert("Registration failed");
    console.error(err);
  }
}

// LOGIN USER
async function loginUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const result = await apiRequest("/auth/login", "POST", {
      email,
      password
    });

    if (result.error) {
      alert(result.error);
    } else {
      const token = result.token || result.accessToken;
      const role = result.user.role.toLowerCase();
      
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      
      if (role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "dashboard.html";
      }
      alert("Login successful");
    }
  } catch (err) {
    alert("Login failed");
    console.error(err);
  }
}

