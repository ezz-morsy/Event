export default async function renderDashboard(appContainer) {
    appContainer.innerHTML = `
        <section class="card-view">
            <h1 style="font-family: var(--font-heading); margin-bottom: 0.5rem;">Dashboard</h1>
            <p style="color: var(--text-secondary); margin-bottom: 1.25rem;">Live platform summary from the backend.</p>
            <div id="dashboard-content" style="color: var(--text-secondary);">Loading dashboard stats...</div>
        </section>
    `;

    const content = document.getElementById("dashboard-content");
    if (!content) return;

    try {
        const res = await fetch(`${window.API}/api/dashboard`);
        const json = await res.json();
        if (!json.success) {
            window.showToast(json.message || "Failed to load dashboard", "error");
            content.textContent = "Could not load dashboard stats.";
            return;
        }

        const data = json.data || {};
        content.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit,minmax(200px,1fr)); gap: 0.75rem;">
                <div class="btn btn-secondary" style="justify-content: flex-start;">Total Events: ${data.totalEvents ?? 0}</div>
                <div class="btn btn-secondary" style="justify-content: flex-start;">Total Registrations: ${data.totalRegistrations ?? 0}</div>
                <div class="btn btn-secondary" style="justify-content: flex-start;">Upcoming Events: ${data.upcomingEvents ?? 0}</div>
            </div>
        `;
    } catch (error) {
        window.showToast("Failed to connect to server", "error");
        content.textContent = "Backend is unreachable right now.";
    }
}
