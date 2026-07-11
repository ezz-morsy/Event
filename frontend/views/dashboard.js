export default async function renderDashboard(appContainer) {
    appContainer.innerHTML = `
        <div class="view-header">
            <h1 class="view-title">Dashboard</h1>
        </div>
        <div id="dashboard-content">
            <div style="text-align: center; padding: 3rem;">
                <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
                <p style="color: var(--text-secondary);">Loading platform stats...</p>
            </div>
        </div>
    `;

    const contentContainer = document.getElementById("dashboard-content");
    if (!contentContainer) return;

    try {
        window.showLoading();
        const res = await fetch(`${window.API}/api/dashboard`);
        const json = await res.json();
        
        if (!json.success) {
            window.showToast(json.message || "Failed to load dashboard statistics", "error");
            contentContainer.innerHTML = `
                <div class="card-view" style="text-align: center;">
                    <i class="fa-solid fa-circle-exclamation" style="font-size: 3rem; color: var(--error); margin-bottom: 1rem;"></i>
                    <h3>Failed to Load Dashboard</h3>
                    <p style="color: var(--text-secondary); margin-top: 0.5rem;">${json.message || "Could not retrieve statistics from the server."}</p>
                </div>
            `;
            return;
        }

        const stats = json.data || {};
        const popular = stats.mostPopularEvent;

        let popularEventHTML = "";
        if (popular && popular._id) {
            const popularDate = popular.date 
                ? new Date(popular.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : "No date";
                
            popularEventHTML = `
                <div class="card-view popular-card" style="margin-top: 2rem; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                            <span class="badge" style="background: rgba(99, 102, 241, 0.25); color: #fff; margin-bottom: 0;">
                                <i class="fa-solid fa-star" style="color: #fbbf24; margin-right: 0.35rem;"></i> Most Popular Event
                            </span>
                            <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">
                                <i class="fa-solid fa-fire" style="color: var(--error); margin-right: 0.25rem;"></i> High Engagement
                            </span>
                        </div>
                        <h3 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-primary);">${popular.title || "Untitled"}</h3>
                        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1rem;">
                            <i class="fa-solid fa-location-dot" style="margin-right: 0.4rem; color: var(--primary);"></i> ${popular.location || "Online"} &nbsp;·&nbsp;
                            <i class="fa-solid fa-calendar" style="margin-right: 0.4rem; color: var(--primary);"></i> ${popularDate}
                        </p>
                        <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; margin-bottom: 1.5rem;">
                            ${popular.description || "No description provided."}
                        </p>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                        <span style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 500;">
                            Category: <strong style="color: var(--text-primary);">${popular.category || "General"}</strong>
                        </span>
                        <a href="#event/${popular._id}" class="btn btn-secondary">
                            View Event <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            `;
        } else {
            popularEventHTML = `
                <div class="card-view" style="margin-top: 2rem; text-align: center; border: 1px dashed var(--border-color); background: transparent;">
                    <i class="fa-solid fa-face-meh" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 0.75rem;"></i>
                    <h4 style="color: var(--text-secondary);">No Popular Event Yet</h4>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.25rem;">Once attendees register for events, the most popular one will be spotlighted here.</p>
                </div>
            `;
        }

        contentContainer.innerHTML = `
            <!-- Stat Cards Grid -->
            <div class="stats-grid">
                <div class="stat-card total-events">
                    <div class="stat-icon">
                        <i class="fa-solid fa-calendar-days"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-value">${stats.totalEvents ?? 0}</span>
                        <span class="stat-label">Total Events</span>
                    </div>
                </div>

                <div class="stat-card upcoming-events">
                    <div class="stat-icon">
                        <i class="fa-solid fa-hourglass-half"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-value">${stats.upcomingEvents ?? 0}</span>
                        <span class="stat-label">Upcoming Events</span>
                    </div>
                </div>

                <div class="stat-card total-registrations">
                    <div class="stat-icon">
                        <i class="fa-solid fa-id-card-clip"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-value">${stats.totalRegistrations ?? 0}</span>
                        <span class="stat-label">Registrations</span>
                    </div>
                </div>
            </div>

            <!-- Spotlight: Most Popular Event -->
            ${popularEventHTML}
        `;
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
