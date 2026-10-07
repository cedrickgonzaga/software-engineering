const API_BASE_URL = "http://127.0.0.1:8000";
async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "../landing/login.html";
    }
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "API Error");
  }
  return res.json();
}

async function fetchTickets() {
  const container = document.getElementById("ticketsContainer");
  if (!container) return;
  try {
    const data = await apiFetch("/tickets/");
    container.innerHTML = "";
    data.forEach(t => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${t.id}</td>
        <td>${t.title}</td>
        <td>${t.category}</td>
        <td><span class="badge badge-${t.status.toLowerCase()}">${t.status}</span></td>
        <td>${t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}</td>
      `;
      container.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
  }
}

const reportFacilityForm = document.getElementById("reportFacilityForm");
if (reportFacilityForm) {
  reportFacilityForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const location = document.getElementById("location").value;
    try {
      await apiFetch("/tickets/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, description, location, status: "pending" })
      });
      const modal = document.getElementById("successModal");
      if (modal) {
        modal.classList.add("active");
        setTimeout(() => {
          window.location.href = "activity.html";
        }, 2000);
      } else {
        window.location.href = "activity.html";
      }
    } catch (err) {
      alert(err.message);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("ticketsContainer")) fetchTickets();
});
