export default async function renderDetail(appContainer, eventId) {
    if (!eventId) {
        appContainer.innerHTML = `
            <section class="card-view">
                <h1 style="font-family: var(--font-heading); margin-bottom: 0.5rem;">Event Details</h1>
                <p style="color: var(--error);">Missing event ID in URL.</p>
            </section>
        `;
        return;
    }

    appContainer.innerHTML = `
        <section class="card-view">
            <h1 style="font-family: var(--font-heading); margin-bottom: 0.5rem;">Event Details</h1>
            <div id="event-detail-content" style="color: var(--text-secondary);">Loading event...</div>
        </section>
    `;

    const content = document.getElementById("event-detail-content");
    if (!content) return;

    try {
        const res = await fetch(`${window.API}/api/events/${eventId}`);
        const json = await res.json();
        if (!json.success) {
            window.showToast(json.message || "Failed to load event", "error");
            content.textContent = "Could not load event.";
            return;
        }

        const event = json.data || {};
        content.innerHTML = `
            <article style="background: var(--bg-surface-solid); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem;">
                <h3 style="font-family: var(--font-heading); margin-bottom: 0.4rem;">${event.title || "Untitled Event"}</h3>
                <p style="color: var(--text-secondary); margin-bottom: 0.4rem;">${event.location || "Unknown location"} · ${event.date ? new Date(event.date).toLocaleString() : "No date"}</p>
                <p style="margin-bottom: 1rem;">${event.description || "No description."}</p>
                <a class="btn btn-secondary" href="#edit-event/${event._id}"><i class="fa-solid fa-pen"></i>Edit Event</a>
            </article>
        `;
    } catch (error) {
        window.showToast("Failed to connect to server", "error");
        content.textContent = "Backend is unreachable right now.";
    }
}
