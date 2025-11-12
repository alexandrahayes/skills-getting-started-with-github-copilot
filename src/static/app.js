document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;


        // Build participants list HTML (no bullets, with delete icon)
        let participantsListHtml = "";
        if (details.participants.length > 0) {
          participantsListHtml = details.participants.map(p => `
            <div class="participant-row">
              <span class="participant-email">${p}</span>
              <span class="delete-participant" title="Remove participant" data-activity="${name}" data-email="${p}">&#128465;</span>
            </div>
          `).join("");
        } else {
          participantsListHtml = `<div class="participant-row"><em>No participants yet</em></div>`;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participants:</strong>
            <div class="participants-list">
              ${participantsListHtml}
            </div>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add event listeners for delete icons
        activityCard.querySelectorAll('.delete-participant').forEach(icon => {
          icon.addEventListener('click', function() {
            const activityName = this.getAttribute('data-activity');
            const email = this.getAttribute('data-email');
            unregisterParticipant(activityName, email);
          });
        });
// Unregister participant from activity
function unregisterParticipant(activityName, email) {
  fetch(`/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`, {
    method: "DELETE"
  })
    .then(response => response.json())
    .then(result => {
      const messageDiv = document.getElementById("message");
      if (result.message) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }
      fetchActivities();
    })
    .catch(() => {
      const messageDiv = document.getElementById("message");
      messageDiv.textContent = "Failed to unregister participant.";
      messageDiv.className = "error";
    });
}

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Immediately refresh activities after signup
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
