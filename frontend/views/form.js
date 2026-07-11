export default async function renderForm(appContainer, eventId) {
    const isEdit = Boolean(eventId);

    appContainer.innerHTML = `
        <div class="view-header">
            <h1 class="view-title">${isEdit ? "Edit Event" : "Create Event"}</h1>
            <a href="#events" class="btn btn-secondary">
                <i class="fa-solid fa-arrow-left"></i> Cancel
            </a>
        </div>
        <div class="card-view">
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                ${isEdit ? "Modify the event details below. All fields are required." : "Enter the details to create a new event. All fields are required."}
            </p>
            <form id="event-form" style="display: grid; gap: 0.25rem; max-width: 680px;">
                <div class="form-group">
                    <label for="event-title">Event Title</label>
                    <input type="text" id="event-title" name="title" class="form-control" placeholder="e.g. Annual Tech Summit" required>
                    <div class="invalid-feedback" id="error-title"></div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label for="event-category">Category</label>
                        <select id="event-category" name="category" class="form-control" required>
                            <option value="" disabled selected>Select a category</option>
                            <option value="Technology">Technology</option>
                            <option value="Art">Art</option>
                            <option value="Business">Business</option>
                            <option value="Social">Social</option>
                            <option value="Sports">Sports</option>
                            <option value="Education">Education</option>
                            <option value="Music">Music</option>
                            <option value="Other">Other</option>
                        </select>
                        <div class="invalid-feedback" id="error-category"></div>
                    </div>
                    <div class="form-group">
                        <label for="event-capacity">Capacity</label>
                        <input type="number" id="event-capacity" name="capacity" class="form-control" min="1" placeholder="e.g. 100" required>
                        <div class="invalid-feedback" id="error-capacity"></div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label for="event-location">Location</label>
                        <input type="text" id="event-location" name="location" class="form-control" placeholder="e.g. Cairo or Online" required>
                        <div class="invalid-feedback" id="error-location"></div>
                    </div>
                    <div class="form-group">
                        <label for="event-date">Date & Time</label>
                        <input type="datetime-local" id="event-date" name="date" class="form-control" required>
                        <div class="invalid-feedback" id="error-date"></div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="event-description">Description</label>
                    <textarea id="event-description" name="description" class="form-control" rows="5" placeholder="Provide a detailed description of the event..." style="resize: vertical;" required></textarea>
                    <div class="invalid-feedback" id="error-description"></div>
                </div>

                <button class="btn btn-primary" type="submit" style="justify-content: center; padding: 0.8rem; margin-top: 1rem; font-size: 1rem;">
                    <i class="fa-solid fa-cloud-arrow-up"></i> ${isEdit ? "Save Changes" : "Publish Event"}
                </button>
            </form>
        </div>
    `;

    const form = document.getElementById("event-form");
    if (!form) return;

    // Fetch and prefill data if in Edit Mode
    if (isEdit) {
        try {
            window.showLoading();
            const res = await fetch(`${window.API}/api/events/${eventId}`);
            const json = await res.json();
            
            if (json.success && json.data) {
                const event = json.data;
                form.title.value = event.title || "";
                form.category.value = event.category || "";
                form.capacity.value = event.capacity || "";
                form.location.value = event.location || "";
                form.description.value = event.description || "";
                
                // Format ISO string from DB to datetime-local input layout YYYY-MM-DDTHH:MM
                if (event.date) {
                    const date = new Date(event.date);
                    const tzOffset = date.getTimezoneOffset() * 60000;
                    const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
                    form.date.value = localISOTime;
                }
            } else {
                window.showToast(json.message || "Failed to load event data", "error");
            }
        } catch (error) {
            window.showToast("Failed to connect to backend", "error");
        } finally {
            window.hideLoading();
        }
    }

    // Form Submit Handler
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        // Clear all validation errors
        clearErrors();

        const title = form.title.value.trim();
        const category = form.category.value;
        const capacityVal = parseInt(form.capacity.value, 10);
        const location = form.location.value.trim();
        const dateVal = form.date.value;
        const description = form.description.value.trim();

        // Client-side quick check
        let hasClientError = false;
        if (!title) {
            showFieldError("event-title", "error-title", "Title is required");
            hasClientError = true;
        }
        if (!category) {
            showFieldError("event-category", "error-category", "Category is required");
            hasClientError = true;
        }
        if (isNaN(capacityVal) || capacityVal < 1) {
            showFieldError("event-capacity", "error-capacity", "Capacity must be greater than 0");
            hasClientError = true;
        }
        if (!location) {
            showFieldError("event-location", "error-location", "Location is required");
            hasClientError = true;
        }
        if (!dateVal) {
            showFieldError("event-date", "error-date", "Date & Time is required");
            hasClientError = true;
        } else if (!isEdit && new Date(dateVal) < new Date()) {
            showFieldError("event-date", "error-date", "Event date must be in the future");
            hasClientError = true;
        }
        if (!description) {
            showFieldError("event-description", "error-description", "Description is required");
            hasClientError = true;
        }

        if (hasClientError) {
            window.showToast("Please correct the form errors.", "error");
            return;
        }

        const formData = {
            title,
            category,
            capacity: capacityVal,
            location,
            date: new Date(dateVal).toISOString(),
            description
        };

        try {
            window.showLoading();
            const endpoint = isEdit ? `${window.API}/api/events/${eventId}` : `${window.API}/api/events`;
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const json = await res.json();

            if (!json.success) {
                // Check if server validation errors are present
                if (Array.isArray(json.errors)) {
                    json.errors.forEach(err => {
                        const inputId = `event-${err.field}`;
                        const errorId = `error-${err.field}`;
                        showFieldError(inputId, errorId, err.message);
                    });
                    window.showToast("Validation failed.", "error");
                } else {
                    window.showToast(json.message || "Failed to save event", "error");
                }
                return;
            }

            window.showToast(isEdit ? "Event updated successfully!" : "Event published successfully!", "success");
            
            // Redirect
            if (isEdit) {
                window.location.hash = `#event/${eventId}`;
            } else {
                window.location.hash = "#events";
            }
        } catch (error) {
            window.showToast("Connection failure saving event", "error");
        } finally {
            window.hideLoading();
        }
    });

    function showFieldError(inputId, errorId, message) {
        const input = document.getElementById(inputId);
        const errorEl = document.getElementById(errorId);
        if (input) input.classList.add("is-invalid");
        if (errorEl) errorEl.textContent = message;
    }

    function clearErrors() {
        const fields = ["title", "category", "capacity", "location", "date", "description"];
        fields.forEach(field => {
            const input = document.getElementById(`event-${field}`);
            const errorEl = document.getElementById(`error-${field}`);
            if (input) input.classList.remove("is-invalid");
            if (errorEl) errorEl.textContent = "";
        });
    }
}

