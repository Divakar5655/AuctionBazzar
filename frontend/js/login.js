/*document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Login failed");
            return;
        }

        // Save token
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.role);

        alert("Login successful");

        // Role based redirect
        if (data.user.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "dashboard.html";
        }

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
});*/
