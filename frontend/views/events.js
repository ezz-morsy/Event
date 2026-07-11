export default async function renderEvents(appContainer) {
    appContainer.innerHTML = `
        <section class="card-view">
            <h1 style="font-family: var(--font-heading); margin-bottom: 0.5rem;">Events</h1>
            <p style="color: var(--text-secondary); margin-bottom: 1.25rem;">Browse all available events.</p>
            <div id="events-content" style="color: var(--text-secondary);">Loading events...</div>
        </section>
    `;

    const content = document.getElementById("events-content");
    if (!content) return;

    try {
        const res = await fetch(`${window.API}/api/events`);
        const json = await res.json();
        if (!json.success) {
            window.showToast(json.message || "Failed to load events", "error");
            content.textContent = "Could not load events.";
            return;
        }

        const events = Array.isArray(json.data) ? json.data : [];
        if (events.length === 0) {
            content.textContent = "No events found yet.";
            return;
        }

        content.innerHTML = events.map((event) => `
            <article style="background: var(--bg-surface-solid); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem; margin-bottom: 0.75rem;">
                <h3 style="font-family: var(--font-heading); margin-bottom: 0.4rem;">${event.title || "Untitled Event"}</h3>
                <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">${event.location || "Unknown location"} · ${event.date ? new Date(event.date).toLocaleDateString() : "No date"}</p>
                <a class="btn btn-secondary" href="#event/${event._id}">View Details</a>
            </article>
        `).join("");
    } catch (error) {
        window.showToast("Failed to connect to server", "error");
        content.textContent = "Backend is unreachable right now.";
    }
}
