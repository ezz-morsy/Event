const API = "https://convene-backend-6hzd.onrender.com";

// Make constants and helpers global so all dynamically loaded views can access them
window.API = API;
window.showToast = showToast;
window.showModal = showModal;
window.showLoading = showLoading;
window.hideLoading = hideLoading;

// Toast System
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const iconClass = type === "success"
        ? "fa-solid fa-circle-check"
        : "fa-solid fa-circle-exclamation";

    const icon = document.createElement("i");
    icon.className = iconClass;

    const textSpan = document.createElement("span");
    textSpan.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(textSpan);

    container.appendChild(toast);

    // Fade out and remove after 3 seconds
    setTimeout(() => {
        toast.classList.add("fade-out");
        toast.addEventListener("transitionend", () => {
            toast.remove();
        });
    }, 3000);
}

// Modal Confirmation System
let modalConfirmCallback = null;

function showModal(message, onConfirm) {
    const backdrop = document.getElementById("modal-backdrop");
    const messageEl = document.getElementById("modal-message");

    if (!backdrop || !messageEl) return;

    messageEl.textContent = message;
    modalConfirmCallback = typeof onConfirm === "function" ? onConfirm : null;
    backdrop.classList.remove("hidden");
}

function closeModal() {
    const backdrop = document.getElementById("modal-backdrop");
    if (backdrop) {
        backdrop.classList.add("hidden");
    }
    modalConfirmCallback = null;
}

// Global Loading Spinner
function showLoading() {
    const spinner = document.getElementById("global-loading");
    if (spinner) spinner.classList.remove("hidden");
}

// Global Loading Spinner Hide
function hideLoading() {
    const spinner = document.getElementById("global-loading");
    if (spinner) spinner.classList.add("hidden");
}

// Router configuration
const routes = {
    "dashboard": { view: "dashboard", nav: "nav-dashboard" },
    "events": { view: "events", nav: "nav-events" },
    "new-event": { view: "form", nav: "nav-new-event" },
    "event": { view: "detail" },
    "edit-event": { view: "form" }
};

// Router matching logic
async function handleRouting() {
    const hash = window.location.hash || "#dashboard";
    const parts = hash.substring(1).split("/");
    const routeKey = parts[0];
    const param = parts[1]; // e.g. ID parameter for event details/editing

    const route = routes[routeKey];
    const appContainer = document.getElementById("app");
    if (!appContainer) return;

    // Update Navigation UI
    document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
    if (route && route.nav) {
        const activeLink = document.getElementById(route.nav);
        if (activeLink) activeLink.classList.add("active");
    }

    if (route) {
        try {
            showLoading();
            // Dynamically import the specific view script
            const modulePath = `./views/${route.view}.js`;
            const viewModule = await import(modulePath);

            // Execute render function
            if (viewModule.default) {
                await viewModule.default(appContainer, param);
            } else if (viewModule.render) {
                await viewModule.render(appContainer, param);
            }
        } catch (error) {
            console.error("Routing error loading module:", error);
            appContainer.innerHTML = `
                <div class="error-view" style="padding: 2rem; text-align: center;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; color: var(--error); margin-bottom: 1rem;"></i>
                    <h2 style="font-family: var(--font-heading);">Failed to Load View</h2>
                    <p style="color: var(--text-secondary); margin-top: 0.5rem;">Could not load view template for '${route.view}'. Make sure the file exists.</p>
                </div>
            `;
        } finally {
            hideLoading();
        }
    } else {
        appContainer.innerHTML = `
            <div class="error-view" style="padding: 4rem 2rem; text-align: center;">
                <i class="fa-solid fa-ghost" style="font-size: 4rem; color: var(--text-muted); margin-bottom: 1.5rem;"></i>
                <h2 style="font-family: var(--font-heading); font-size: 2rem;">404 - Not Found</h2>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">The view you are looking for does not exist or has been moved.</p>
                <a href="#dashboard" class="btn btn-secondary" style="margin-top: 1.5rem;">Go to Dashboard</a>
            </div>
        `;
    }
}

// Initializations
document.addEventListener("DOMContentLoaded", () => {
    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById("theme-toggle");
    const themeToggleIcon = document.getElementById("theme-toggle-icon");
    
    const savedTheme = localStorage.getItem("theme") || "dark";
    if (savedTheme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
        if (themeToggleIcon) {
            themeToggleIcon.className = "fa-solid fa-sun";
        }
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
        if (themeToggleIcon) {
            themeToggleIcon.className = "fa-solid fa-moon";
        }
    }
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            if (currentTheme === "light") {
                document.documentElement.setAttribute("data-theme", "dark");
                localStorage.setItem("theme", "dark");
                if (themeToggleIcon) themeToggleIcon.className = "fa-solid fa-moon";
            } else {
                document.documentElement.setAttribute("data-theme", "light");
                localStorage.setItem("theme", "light");
                if (themeToggleIcon) themeToggleIcon.className = "fa-solid fa-sun";
            }
        });
    }

    // Bind Modal Confirm & Close Events
    const backdrop = document.getElementById("modal-backdrop");
    const closeBtn = document.getElementById("modal-close");
    const cancelBtn = document.getElementById("modal-cancel-btn");
    const confirmBtn = document.getElementById("modal-confirm-btn");

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
    if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
            if (modalConfirmCallback) modalConfirmCallback();
            closeModal();
        });
    }

    // Close modal if clicking outside the card
    if (backdrop) {
        backdrop.addEventListener("click", (e) => {
            if (e.target === backdrop) closeModal();
        });
    }

    // Set up routing listeners
    window.addEventListener("hashchange", handleRouting);

    // Kickstart initial route
    handleRouting();
});
