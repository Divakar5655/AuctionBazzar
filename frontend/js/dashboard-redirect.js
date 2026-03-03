function goToDashboard() {
  const role = localStorage.getItem("role");

  if (role === "admin") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "dashboard.html";
  }
}
