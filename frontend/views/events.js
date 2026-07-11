export default async function renderEvents(appContainer) {
    // Fetch categories dynamically
    let categoriesHTML = '<option value="">All Categories</option>';
    try {
        const catRes = await fetch(`${window.API}/categories`);
        const catJson = await catRes.json();
        if (catJson.success && catJson.data) {
            categoriesHTML += catJson.data.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join("");
        }
    } catch (err) {
        console.error("Failed to load categories for filter:", err);
        categoriesHTML += '<option value="Other">Other</option>';
    }

    appContainer.innerHTML = `
        <div class="view-header">
            <h1 class="view-title">Browse Events</h1>
            <a href="#new-event" class="btn btn-primary">
                <i class="fa-solid fa-calendar-plus"></i> Create Event
            </a>
        </div>

        <!-- Filter Form -->
        <div class="filter-form-card">
            <form id="filter-form" class="filter-grid">
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="filter-search">Search</label>
                    <input type="text" id="filter-search" name="search" class="form-control" placeholder="Search by title...">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="filter-category">Category</label>
                    <select id="filter-category" name="category" class="form-control">
                        ${categoriesHTML}
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="filter-location">Location</label>
                    <input type="text" id="filter-location" name="location" class="form-control" placeholder="City or online...">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="filter-date">Date</label>
                    <input type="date" id="filter-date" name="date" class="form-control">
                </div>
                <div class="filter-btn-group" style="display: flex; gap: 0.5rem;">
                    <button type="submit" class="btn btn-primary" aria-label="Apply filters" style="padding: 0.75rem 1rem;">
                        <i class="fa-solid fa-filter"></i> Filter
                    </button>
                    <button type="button" id="reset-filters-btn" class="btn btn-secondary" aria-label="Reset filters" style="padding: 0.75rem 1rem;">
                        <i class="fa-solid fa-arrow-rotate-left"></i>
                    </button>
                </div>
            </form>
        </div>

        <!-- Event Grid Area -->
        <div id="events-grid-container">
            <div style="text-align: center; padding: 3rem;">
                <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
                <p style="color: var(--text-secondary);">Loading events...</p>
            </div>
        </div>
    `;

    const gridContainer = document.getElementById("events-grid-container");
    const filterForm = document.getElementById("filter-form");
    const resetBtn = document.getElementById("reset-filters-btn");
    
    if (!gridContainer || !filterForm) return;

    // Load events from backend with optional filters
    async function loadEvents(filters = {}) {
        try {
            window.showLoading();
            
            // Build Query Params
            const params = new URLSearchParams();
            if (filters.search) params.append("search", filters.search);
            if (filters.category) params.append("category", filters.category);
            if (filters.location) params.append("location", filters.location);
            if (filters.date) params.append("date", filters.date);

            const queryStr = params.toString() ? `?${params.toString()}` : "";
            
            const res = await fetch(`${window.API}/api/events${queryStr}`);
            const json = await res.json();
            
            if (!json.success) {
                window.showToast(json.message || "Failed to load events", "error");
                gridContainer.innerHTML = `
                    <div class="card-view" style="text-align: center;">
                        <i class="fa-solid fa-circle-exclamation" style="font-size: 3rem; color: var(--error); margin-bottom: 1rem;"></i>
                        <h3>Failed to Load Events</h3>
                        <p style="color: var(--text-secondary); margin-top: 0.5rem;">${json.message || "Could not retrieve the event list."}</p>
                    </div>
                `;
                return;
            }

            const events = Array.isArray(json.data) ? json.data : [];
            renderEventCards(events);

        } catch (error) {
            window.showToast("Failed to connect to server", "error");
            gridContainer.innerHTML = `
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

    // Render cards to UI
    function renderEventCards(events) {
        if (events.length === 0) {
            gridContainer.innerHTML = `
                <div class="card-view" style="text-align: center; padding: 4rem 2rem; border: 1px dashed var(--border-color); background: transparent;">
                    <i class="fa-solid fa-calendar-xmark" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h3>No Events Found</h3>
                    <p style="color: var(--text-secondary); margin-top: 0.25rem;">Try adjusting your filter search criteria or publish a new event.</p>
                </div>
            `;
            return;
        }

        gridContainer.innerHTML = `
            <div class="events-list-grid">
                ${events.map(event => {
                    const dateObj = event.date ? new Date(event.date) : null;
                    const dateStr = dateObj 
                        ? dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : "No date specified";
                        
                    return `
                        <div class="event-card">
                            <div class="event-card-header">
                                <span class="badge">${event.category || "General"}</span>
                            </div>
                            <a href="#event/${event._id}" class="event-card-title">${event.title || "Untitled Event"}</a>
                            
                            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.5rem;">
                                <i class="fa-solid fa-location-dot" style="margin-right: 0.4rem; color: var(--primary);"></i> ${event.location || "Unknown"}
                            </p>
                            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.25rem;">
                                <i class="fa-solid fa-clock" style="margin-right: 0.4rem; color: var(--primary);"></i> ${dateStr}
                            </p>

                            <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.5; margin-top: 1rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
                                ${event.description || "No description provided."}
                            </p>

                            <div class="event-card-footer">
                                <a href="#event/${event._id}" class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                    View Details <i class="fa-solid fa-angle-right"></i>
                                </a>
                                <button class="btn-icon-danger delete-event-btn" data-id="${event._id}" data-title="${event.title}" aria-label="Delete event">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;

        // Bind delete action
        document.querySelectorAll(".delete-event-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const title = btn.getAttribute("data-title");

                window.showModal(`Are you sure you want to delete the event "${title}"? This will permanently delete all attendee registrations associated with it.`, async () => {
                    try {
                        window.showLoading();
                        const delRes = await fetch(`${window.API}/api/events/${id}`, {
                            method: "DELETE"
                        });
                        const delJson = await delRes.json();

                        if (!delJson.success) {
                            window.showToast(delJson.message || "Failed to delete event", "error");
                            return;
                        }

                        window.showToast("Event and registrations successfully deleted", "success");
                        
                        // Reload filter list
                        getAndLoadFilters();
                    } catch (err) {
                        window.showToast("Connection error while deleting event", "error");
                    } finally {
                        window.hideLoading();
                    }
                });
            });
        });
    }

    // Read values from filter inputs and reload list
    function getAndLoadFilters() {
        const filters = {
            search: filterForm.search.value.trim(),
            category: filterForm.category.value,
            location: filterForm.location.value.trim(),
            date: filterForm.date.value
        };
        loadEvents(filters);
    }

    // Bind Filter Form Submit
    filterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        getAndLoadFilters();
    });

    // Bind Reset Button
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            filterForm.reset();
            loadEvents({});
        });
    }

    // Initial load
    loadEvents({});
}
