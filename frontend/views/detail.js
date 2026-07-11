export default async function renderDetail(appContainer, eventId) {
    if (!eventId) {
        appContainer.innerHTML = `
            <section class="card-view">
                <h1 class="view-title">Event Details</h1>
                <p style="color: var(--error); margin-top: 1rem;">
                    <i class="fa-solid fa-triangle-exclamation"></i> Missing event ID in URL.
                </p>
            </section>
        `;
        return;
    }

    appContainer.innerHTML = `
        <div class="view-header">
            <h1 class="view-title">Event Details</h1>
            <div style="display: flex; gap: 0.75rem;">
                <a href="#events" class="btn btn-secondary">
                    <i class="fa-solid fa-arrow-left"></i> Back
                </a>
                <a class="btn btn-secondary" id="edit-event-btn" href="#edit-event/${eventId}">
                    <i class="fa-solid fa-pen"></i> Edit
                </a>
            </div>
        </div>
        <div id="event-detail-content">
            <div style="text-align: center; padding: 3rem;">
                <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
                <p style="color: var(--text-secondary);">Loading event details...</p>
            </div>
        </div>
    `;

    const contentContainer = document.getElementById("event-detail-content");
    if (!contentContainer) return;

    // Helper function to fetch and render everything
    async function loadAndRender() {
        try {
            window.showLoading();
            
            // 1. Fetch Event Details
            const eventRes = await fetch(`${window.API}/api/events/${eventId}`);
            const eventJson = await eventRes.json();
            if (!eventJson.success) {
                window.showToast(eventJson.message || "Failed to load event details", "error");
                contentContainer.innerHTML = `
                    <div class="card-view" style="text-align: center;">
                        <i class="fa-solid fa-circle-exclamation" style="font-size: 3rem; color: var(--error); margin-bottom: 1rem;"></i>
                        <h3>Event Not Found</h3>
                        <p style="color: var(--text-secondary); margin-top: 0.5rem;">${eventJson.message || "The requested event could not be found."}</p>
                    </div>
                `;
                return;
            }
            const event = eventJson.data || {};

            // 2. Fetch Attendees List
            const attendeesRes = await fetch(`${window.API}/api/events/${eventId}/attendees`);
            const attendeesJson = await attendeesRes.json();
            const attendees = Array.isArray(attendeesJson.data) ? attendeesJson.data : [];

            const isExpired = event.date ? new Date(event.date) < new Date() : false;
            const isFull = attendees.length >= event.capacity;
            const isClosed = isFull || isExpired;
            const progressPercent = Math.min(100, Math.round((attendees.length / event.capacity) * 100));

            // Format event date beautifully
            let formattedDate = "No date specified";
            if (event.date) {
                const dateObj = new Date(event.date);
                formattedDate = dateObj.toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }

            // Build layout
            contentContainer.innerHTML = `
                <div class="detail-grid">
                    <!-- Left Column: Event details -->
                    <div class="card-view" style="margin-bottom: 0;">
                        <span class="badge">${event.category || "General"}</span>
                        <h2 style="font-family: var(--font-heading); font-size: 1.75rem; margin-bottom: 1.25rem;">${event.title || "Untitled Event"}</h2>
                        
                        <div class="info-item">
                            <i class="fa-solid fa-calendar-day"></i>
                            <div>
                                <strong>Date & Time</strong>
                                <p>${formattedDate}</p>
                            </div>
                        </div>

                        <div class="info-item">
                            <i class="fa-solid fa-location-dot"></i>
                            <div>
                                <strong>Location</strong>
                                <p>${event.location || "Online"}</p>
                            </div>
                        </div>

                        <div class="capacity-tracker">
                            <div class="capacity-header">
                                <span style="color: var(--text-secondary); font-weight: 500;">
                                    <i class="fa-solid fa-users"></i> Attendance
                                </span>
                                <span style="font-weight: 600; color: ${isFull ? 'var(--error)' : 'var(--text-primary)'}">
                                    ${attendees.length} / ${event.capacity}
                                </span>
                            </div>
                            <div class="progress-bar-bg">
                                <div class="progress-bar-fill ${isFull ? 'full' : ''}" style="width: ${progressPercent}%;"></div>
                            </div>
                        </div>

                        <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
                            <h4 style="font-family: var(--font-heading); margin-bottom: 0.5rem; color: var(--text-primary);">Description</h4>
                            <p style="color: var(--text-secondary); white-space: pre-line;">${event.description || "No description provided."}</p>
                        </div>
                    </div>

                    <!-- Right Column: Registration & Attendees -->
                    <div style="display: flex; flex-direction: column; gap: 2rem;">
                        <!-- Registration Form Card -->
                        <div class="card-view" style="margin-bottom: 0;">
                            <h3 style="font-family: var(--font-heading); margin-bottom: 1rem;">Register for Event</h3>
                            ${isExpired ? `
                                <div style="background: rgba(245, 158, 11, 0.1); border: 1px dashed var(--warning); border-radius: 8px; padding: 1rem; text-align: center; color: var(--warning); font-weight: 500; font-size: 0.9rem; margin-bottom: 1rem;">
                                    <i class="fa-solid fa-calendar-xmark"></i> This event has already passed. Registration closed.
                                </div>
                            ` : isFull ? `
                                <div style="background: rgba(239, 68, 68, 0.1); border: 1px dashed var(--error); border-radius: 8px; padding: 1rem; text-align: center; color: var(--error); font-weight: 500; font-size: 0.9rem; margin-bottom: 1rem;">
                                    <i class="fa-solid fa-triangle-exclamation"></i> This event is at capacity. Registration closed.
                                </div>
                            ` : ''}
                            <form id="registration-form">
                                <div class="form-group">
                                    <label for="reg-name">Full Name</label>
                                    <input type="text" id="reg-name" class="form-control" placeholder="Your name" required ${isClosed ? 'disabled' : ''}>
                                    <div class="invalid-feedback" id="error-name"></div>
                                </div>
                                <div class="form-group">
                                    <label for="reg-email">Email Address</label>
                                    <input type="email" id="reg-email" class="form-control" placeholder="your.email@example.com" required ${isClosed ? 'disabled' : ''}>
                                    <div class="invalid-feedback" id="error-email"></div>
                                </div>
                                <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 0.5rem;" ${isClosed ? 'disabled' : ''}>
                                    <i class="fa-solid fa-user-plus"></i> Confirm Registration
                                </button>
                            </form>
                        </div>

                        <!-- Attendees List Card -->
                        <div class="card-view" style="margin-bottom: 0; flex: 1; display: flex; flex-direction: column;">
                            <h3 style="font-family: var(--font-heading); margin-bottom: 0.5rem;">Attendees</h3>
                            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.5rem;">${attendees.length} people registered</p>
                            
                            <div class="attendee-list" style="flex: 1;">
                                ${attendees.length === 0 ? `
                                    <div style="text-align: center; color: var(--text-muted); padding: 2rem 0; font-style: italic;">
                                        No attendees registered yet.
                                    </div>
                                ` : attendees.map(attendee => `
                                    <div class="attendee-item">
                                        <div class="attendee-info">
                                            <h4>${attendee.name || "Anonymous"}</h4>
                                            <p>${attendee.email || "No email"}</p>
                                        </div>
                                        <button class="btn-icon-danger cancel-reg-btn" data-id="${attendee._id}" data-name="${attendee.name}" aria-label="Cancel registration">
                                            <i class="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                `).join("")}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Wire Registration Form Submission
            const form = document.getElementById("registration-form");
            if (form) {
                form.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    
                    // Clear errors
                    document.getElementById("error-name").textContent = "";
                    document.getElementById("error-email").textContent = "";
                    document.getElementById("reg-name").classList.remove("is-invalid");
                    document.getElementById("reg-email").classList.remove("is-invalid");

                    const name = document.getElementById("reg-name").value.trim();
                    const email = document.getElementById("reg-email").value.trim();

                    // Client validation
                    if (!name) {
                        showFieldError("reg-name", "error-name", "Name is required");
                        return;
                    }
                    if (!email) {
                        showFieldError("reg-email", "error-email", "Email is required");
                        return;
                    }

                    try {
                        window.showLoading();
                        const regRes = await fetch(`${window.API}/api/events/${eventId}/register`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ name, email })
                        });
                        const regJson = await regRes.json();
                        
                        if (!regJson.success) {
                            window.showToast(regJson.message || "Failed to register", "error");
                            
                            // Highlight fields if specific validation errors are returned
                            if (regJson.message && regJson.message.toLowerCase().includes("email")) {
                                showFieldError("reg-email", "error-email", regJson.message);
                            }
                            return;
                        }

                        window.showToast("Successfully registered for this event!", "success");
                        // Refresh the view
                        await loadAndRender();
                    } catch (err) {
                        window.showToast("Connection error while registering", "error");
                    } finally {
                        window.hideLoading();
                    }
                });
            }

            // Wire Cancellation Buttons
            document.querySelectorAll(".cancel-reg-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const registrationId = btn.getAttribute("data-id");
                    const attendeeName = btn.getAttribute("data-name");
                    
                    window.showModal(`Are you sure you want to cancel the registration for "${attendeeName}"?`, async () => {
                        try {
                            window.showLoading();
                            const delRes = await fetch(`${window.API}/api/events/${eventId}/registrations/${registrationId}`, {
                                method: "DELETE"
                            });
                            const delJson = await delRes.json();

                            if (!delJson.success) {
                                window.showToast(delJson.message || "Failed to cancel registration", "error");
                                return;
                            }

                            window.showToast(`Cancelled registration for ${attendeeName}`, "success");
                            // Refresh the view
                            await loadAndRender();
                        } catch (err) {
                            window.showToast("Connection error while cancelling registration", "error");
                        } finally {
                            window.hideLoading();
                        }
                    });
                });
            });

        } catch (error) {
            window.showToast("Failed to connect to backend service", "error");
            contentContainer.innerHTML = `
                <div class="card-view" style="text-align: center;">
                    <i class="fa-solid fa-circle-exclamation" style="font-size: 3rem; color: var(--error); margin-bottom: 1rem;"></i>
                    <h3>Service Error</h3>
                    <p style="color: var(--text-secondary); margin-top: 0.5rem;">Could not connect to the backend server. Make sure it is running on ${window.API}</p>
                </div>
            `;
        } finally {
            window.hideLoading();
        }
    }

    function showFieldError(inputId, errorId, message) {
        const input = document.getElementById(inputId);
        const errorEl = document.getElementById(errorId);
        if (input) input.classList.add("is-invalid");
        if (errorEl) errorEl.textContent = message;
    }

    // Initial load
    await loadAndRender();
}

