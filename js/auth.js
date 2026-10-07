const API_BASE = "http://127.0.0.1:8000";

async function login(email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Login failed");
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("role", data.role);
    if (data.role === "it_admin") window.location.href = "../it-admin/dashboard.html";
    else if (data.role === "facility_admin") window.location.href = "../facility-admin/dashboard.html";
    else window.location.href = "../user/dashboard.html";
  } catch (err) {
    showMessage(err.message, true);
  }
}

async function register(email, password, fullName, role) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name: fullName, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Registration failed");
    window.location.href = "login.html";
  } catch (err) {
    showMessage(err.message, true);
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "../landing/login.html";
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    login(document.getElementById("email").value, document.getElementById("password").value);
  });
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    register(
      document.getElementById("email").value,
      document.getElementById("password").value,
      document.getElementById("fullName").value,
      document.getElementById("role") ? document.getElementById("role").value : "user"
    );
  });
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}
