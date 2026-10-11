let allTickets = [];

function formatTicketId(rawId) {
  if (!rawId) return "";
  const clean = String(rawId).replace(/[^a-zA-Z0-9]/g, "");
  return "#FP-" + clean.slice(0, 6).toUpperCase();
}

function copyTicketId(e, rawId) {
  e.stopPropagation();
  const formatted = formatTicketId(rawId);
  navigator.clipboard.writeText(formatted).then(() => {
    const el = e.currentTarget;
    el.classList.add("copied");
    setTimeout(() => {
      el.classList.remove("copied");
    }, 1500);
  });
}

function openTicketModal(ticket) {
  const modal = document.getElementById("ticketDetailModal");
  if (!modal) return;

  const idEl = document.getElementById("modalTicketId");
  const titleEl = document.getElementById("modalTicketTitle");
  const catEl = document.getElementById("modalTicketCategory");
  const locEl = document.getElementById("modalTicketLocation");
  const statusEl = document.getElementById("modalTicketStatus");
  const dateEl = document.getElementById("modalTicketDate");
  const descEl = document.getElementById("modalTicketDesc");

  if (idEl) {
    idEl.textContent = formatTicketId(ticket.id);
    idEl.title = ticket.id;
    idEl.onclick = (e) => copyTicketId(e, ticket.id);
  }
  if (titleEl) titleEl.textContent = ticket.title || "Untitled";
  if (catEl) catEl.textContent = ticket.category || "General";
  if (locEl) locEl.textContent = ticket.location || "N/A";
  if (statusEl) {
    statusEl.innerHTML = `<span class="badge badge-${ticket.status.toLowerCase()}">${ticket.status}</span>`;
  }
  if (dateEl) {
    dateEl.textContent = ticket.created_at ? new Date(ticket.created_at).toLocaleString() : "N/A";
  }
  if (descEl) descEl.textContent = ticket.description || "No description provided.";

  modal.classList.add("active");
}

function closeTicketModal() {
  const modal = document.getElementById("ticketDetailModal");
  if (modal) {
    modal.classList.remove("active");
  }
}

function renderTickets(tickets) {
  const container = document.getElementById("ticketsContainer");
  if (!container) return;

  container.innerHTML = "";

  const colCount = document.querySelectorAll("table thead th").length || 6;

  if (!tickets || tickets.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="${colCount}" style="padding: 0;">
          <div class="empty-state">
            <span class="material-symbols-outlined">inbox</span>
            <div class="empty-state-title">No tickets found</div>
            <div class="empty-state-desc">There are currently no tickets matching your criteria.</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  const isAdmin = window.location.href.includes("-admin");
  const isDashboard = window.location.href.includes("dashboard.html");

  tickets.forEach(t => {
    const tr = document.createElement("tr");
    tr.className = "clickable-row";

    tr.addEventListener("click", (e) => {
      if (e.target.tagName === "SELECT" || e.target.classList.contains("ticket-id")) {
        return;
      }
      openTicketModal(t);
    });

    let statusHtml = `<span class="badge badge-${t.status.toLowerCase()}">${t.status}</span>`;
    if (isAdmin) {
      statusHtml = `
        <select class="status-select status-${t.status.toLowerCase()}" onchange="updateTicketStatus('${t.id}', this.value, this)">
          <option value="pending" ${t.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="progress" ${t.status === 'progress' ? 'selected' : ''}>In Progress</option>
          <option value="resolved" ${t.status === 'resolved' ? 'selected' : ''}>Resolved</option>
          <option value="rejected" ${t.status === 'rejected' ? 'selected' : ''}>Rejected</option>
        </select>
      `;
    }

    const idSpan = `<span class="ticket-id" title="Click to copy ID" onclick="copyTicketId(event, '${t.id}')">${formatTicketId(t.id)}</span>`;

    if (isDashboard) {
      tr.innerHTML = `
        <td>${idSpan}</td>
        <td>${t.title}</td>
        <td>${t.location || 'N/A'}</td>
        <td>${statusHtml}</td>
        <td>${new Date(t.created_at).toLocaleDateString()}</td>
      `;
    } else {
      tr.innerHTML = `
        <td>${idSpan}</td>
        <td>${t.title}</td>
        <td>${t.category}</td>
        <td>${t.location || 'N/A'}</td>
        <td>${statusHtml}</td>
        <td>${new Date(t.created_at).toLocaleDateString()}</td>
      `;
    }

    container.appendChild(tr);
  });
}

function applyFiltersAndRender() {
  const dateSortEl = document.getElementById("dateSort");
  const statusFilterEl = document.getElementById("statusFilter");
  const searchInputEl = document.getElementById("searchInput");

  let filtered = [...allTickets];

  if (searchInputEl && searchInputEl.value.trim() !== "") {
    const q = searchInputEl.value.trim().toLowerCase();
    filtered = filtered.filter(t => {
      const titleMatch = t.title && t.title.toLowerCase().includes(q);
      const locMatch = t.location && t.location.toLowerCase().includes(q);
      const descMatch = t.description && t.description.toLowerCase().includes(q);
      const idMatch = formatTicketId(t.id).toLowerCase().includes(q);
      const catMatch = t.category && t.category.toLowerCase().includes(q);
      return titleMatch || locMatch || descMatch || idMatch || catMatch;
    });
  }

  if (statusFilterEl && statusFilterEl.value !== "all") {
    filtered = filtered.filter(t => t.status.toLowerCase() === statusFilterEl.value.toLowerCase());
  }

  const sortOrder = dateSortEl ? dateSortEl.value : "desc";
  filtered.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const isDashboard = window.location.href.includes("dashboard.html");
  if (isDashboard) {
    filtered = filtered.slice(0, 5);
  }

  renderTickets(filtered);
}

function updateStats(tickets) {
  const pendingStat = document.getElementById("stat-pending");
  const progressStat = document.getElementById("stat-progress");
  const resolvedStat = document.getElementById("stat-resolved");

  if (pendingStat) {
    pendingStat.textContent = tickets.filter(t => t.status.toLowerCase() === 'pending').length;
  }
  if (progressStat) {
    progressStat.textContent = tickets.filter(t => t.status.toLowerCase() === 'progress').length;
  }
  if (resolvedStat) {
    resolvedStat.textContent = tickets.filter(t => t.status.toLowerCase() === 'resolved').length;
  }
}

async function fetchTickets() {
  const hasContainer = document.getElementById("ticketsContainer");
  const hasStats = document.getElementById("stat-pending");
  if (!hasContainer && !hasStats) return;

  try {
    let query = supabaseClient.from("tickets").select("*").order("created_at", { ascending: false });

    if (window.location.href.includes("it-admin")) {
      query = query.eq("category", "IT");
    } else if (window.location.href.includes("facility-admin")) {
      query = query.eq("category", "Facility");
    }

    const { data, error } = await query;
    if (error) throw error;

    allTickets = data || [];

    updateStats(allTickets);

    if (hasContainer) {
      applyFiltersAndRender();
    }
  } catch (err) {
    console.error(err.message);
  }
}

window.updateTicketStatus = async function(ticketId, newStatus, selectEl) {
  try {
    const { error } = await supabaseClient
      .from("tickets")
      .update({ status: newStatus })
      .eq("id", ticketId);

    if (error) throw error;

    if (selectEl) {
      selectEl.className = "status-select status-" + newStatus.toLowerCase();
    }

    const target = allTickets.find(t => t.id === ticketId);
    if (target) {
      target.status = newStatus;
    }

    updateStats(allTickets);
  } catch (err) {
    alert(err.message);
  }
};

window.copyTicketId = copyTicketId;

const reportFacilityForm = document.getElementById("reportFacilityForm");
if (reportFacilityForm) {
  reportFacilityForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      alert("You must be logged in to submit a report.");
      return;
    }

    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const location = document.getElementById("location").value;

    try {
      const { error } = await supabaseClient.from("tickets").insert([
        {
          title: title,
          category: category,
          description: description,
          location: location,
          status: "pending",
          user_id: user.id
        }
      ]);

      if (error) throw error;

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
  fetchTickets();

  const dateSortEl = document.getElementById("dateSort");
  if (dateSortEl) {
    dateSortEl.addEventListener("change", applyFiltersAndRender);
  }

  const statusFilterEl = document.getElementById("statusFilter");
  if (statusFilterEl) {
    statusFilterEl.addEventListener("change", applyFiltersAndRender);
  }

  const searchInputEl = document.getElementById("searchInput");
  if (searchInputEl) {
    searchInputEl.addEventListener("input", applyFiltersAndRender);
  }

  const closeModalBtn = document.getElementById("closeModalBtn");
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeTicketModal);
  }

  const ticketModal = document.getElementById("ticketDetailModal");
  if (ticketModal) {
    ticketModal.addEventListener("click", (e) => {
      if (e.target === ticketModal) {
        closeTicketModal();
      }
    });
  }
});
