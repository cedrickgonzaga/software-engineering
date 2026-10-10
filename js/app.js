
async function fetchTickets() {
  const container = document.getElementById("ticketsContainer");
  if (!container) return;
  
  try {
    const role = localStorage.getItem("role");
    let query = supabaseClient.from("tickets").select("*").order("created_at", { ascending: false });


    if (window.location.href.includes("it-admin")) {
        query = query.eq("category", "IT");
    } else if (window.location.href.includes("facility-admin")) {
        query = query.eq("category", "Facility");
    }

    const { data, error } = await query;
    if (error) throw error;

    container.innerHTML = "";
    const isAdmin = window.location.href.includes("-admin");
    data.forEach(t => {
      const tr = document.createElement("tr");
      
      let statusHtml = `<span class="badge badge-${t.status.toLowerCase()}">${t.status}</span>`;
      if (isAdmin) {
          statusHtml = `
              <select class="form-control" style="padding: 0.2rem; font-size: 0.8rem; width: auto;" onchange="updateTicketStatus('${t.id}', this.value)">
                  <option value="pending" ${t.status === 'pending' ? 'selected' : ''}>Pending</option>
                  <option value="progress" ${t.status === 'progress' ? 'selected' : ''}>In Progress</option>
                  <option value="resolved" ${t.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                  <option value="rejected" ${t.status === 'rejected' ? 'selected' : ''}>Rejected</option>
              </select>
          `;
      }

      tr.innerHTML = `
        <td>${t.id.substring(0, 8)}...</td>
        <td>${t.title}</td>
        <td>${t.category}</td>
        <td>${statusHtml}</td>
        <td>${new Date(t.created_at).toLocaleDateString()}</td>
      `;
      container.appendChild(tr);
    });


    updateStats(data);
  } catch (err) {
    console.error("Error fetching tickets:", err.message);
  }
}

function updateStats(tickets) {
  const pendingStat = document.getElementById("stat-pending");
  const progressStat = document.getElementById("stat-progress");
  const resolvedStat = document.getElementById("stat-resolved");

  if (pendingStat && progressStat && resolvedStat) {
      pendingStat.textContent = tickets.filter(t => t.status === 'pending').length;
      progressStat.textContent = tickets.filter(t => t.status === 'progress').length;
      resolvedStat.textContent = tickets.filter(t => t.status === 'resolved').length;
  }
}

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
      alert("Error: " + err.message);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("ticketsContainer")) fetchTickets();
});


window.updateTicketStatus = async function(ticketId, newStatus) {
    try {
        const { error } = await supabaseClient
            .from("tickets")
            .update({ status: newStatus })
            .eq("id", ticketId);
            
        if (error) throw error;
        

        fetchTickets();
    } catch (err) {
        alert("Error updating status: " + err.message);
    }
}
