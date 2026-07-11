export default async function renderForm(appContainer, eventId) {
    const isEdit = Boolean(eventId);

    appContainer.innerHTML = `
        <section class="card-view">
            <h1 style="font-family: var(--font-heading); margin-bottom: 0.5rem;">${isEdit ? "Edit Event" : "Create Event"}</h1>
            <p style="color: var(--text-secondary); margin-bottom: 1.25rem;">${isEdit ? "Update event information." : "Publish a new event quickly."}</p>
            <form id="event-form" style="display: grid; gap: 0.75rem; max-width: 640px;">
                <input name="title" placeholder="Event title" required style="padding:0.7rem 0.8rem; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-surface-solid); color:var(--text-primary);" />
                <input name="location" placeholder="Location" required style="padding:0.7rem 0.8rem; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-surface-solid); color:var(--text-primary);" />
                <input name="date" type="date" required style="padding:0.7rem 0.8rem; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-surface-solid); color:var(--text-primary);" />
                <button class="btn btn-secondary" type="submit">${isEdit ? "Save Changes" : "Create Event"}</button>
            </form>
        </section>
    `;

    const form = document.getElementById("event-form");
    if (!form) return;

    if (isEdit) {
        try {
            const res = await fetch(`${window.API}/api/events/${eventId}`);
            const json = await res.json();
            if (json.success && json.data) {
                form.title.value = json.data.title || "";
                form.location.value = json.data.location || "";
                form.date.value = json.data.date ? new Date(json.data.date).toISOString().slice(0, 10) : "";
            }
        } catch (error) {
            window.showToast("Could not prefill event data", "error");
        }
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        window.showToast(isEdit ? "Edit flow setup complete" : "Create flow setup complete", "success");
    });
}
