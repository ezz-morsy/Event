// categories.js — Manage Categories View (Freshman Portfolio Tier)

let editingCategoryId = null;

export async function render(container) {
    editingCategoryId = null; // Reset edit state on load
    container.innerHTML = `
        <div class="view-header">
            <h1 class="view-title">Manage Categories</h1>
        </div>

        <div class="detail-grid">
            <!-- Left Side: Category List -->
            <div class="card-view">
                <h3 style="font-family: var(--font-heading); margin-bottom: 1.5rem;">Existing Categories</h3>
                <div id="categories-list" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">Loading categories...</div>
                </div>
            </div>

            <!-- Right Side: Create/Edit Category Form -->
            <div class="card-view" style="height: fit-content;">
                <h3 id="form-title" style="font-family: var(--font-heading); margin-bottom: 1.5rem;">Create New Category</h3>
                <form id="category-form">
                    <div class="form-group">
                        <label for="category-name">Category Name *</label>
                        <input type="text" id="category-name" name="name" class="form-control" placeholder="e.g. Workshop, Networking" required>
                        <div class="invalid-feedback" id="error-name"></div>
                    </div>
                    <div class="form-group">
                        <label for="category-description">Description</label>
                        <textarea id="category-description" name="description" class="form-control" rows="3" placeholder="Brief description of this category..."></textarea>
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                        <button type="submit" id="submit-btn" class="btn btn-primary" style="flex: 1; justify-content: center;">
                            <i class="fa-solid fa-plus"></i> Create Category
                        </button>
                        <button type="button" id="cancel-btn" class="btn btn-secondary" style="display: none;">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Fetch and render the categories list
    await fetchAndRenderCategories();

    // Bind form events
    const form = document.getElementById("category-form");
    if (form) {
        form.addEventListener("submit", handleFormSubmit);
    }

    const cancelBtn = document.getElementById("cancel-btn");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", resetFormState);
    }
}

// Fetch categories from backend and render inside the list container
async function fetchAndRenderCategories() {
    const listContainer = document.getElementById("categories-list");
    if (!listContainer) return;

    try {
        const response = await fetch(`${window.API}/categories`);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Failed to fetch categories");
        }

        const categories = result.data;
        if (categories.length === 0) {
            listContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No categories found.</div>`;
            return;
        }

        listContainer.innerHTML = categories.map(cat => `
            <div class="attendee-item" style="padding: 1rem; border-radius: 8px;">
                <div class="attendee-info" style="flex: 1;">
                    <h4 style="font-size: 1rem; font-weight: 600; color: var(--text-primary);">${cat.name}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${cat.description || "No description provided."}</p>
                </div>
                <div style="display: flex; gap: 0.25rem;">
                    <button class="btn-icon-danger edit-cat-btn" data-id="${cat._id}" data-name="${cat.name}" data-description="${cat.description || ""}" title="Edit Category" style="color: var(--primary); background: none;">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn-icon-danger delete-cat-btn" data-id="${cat._id}" data-name="${cat.name}" title="Delete Category">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `).join("");

        // Bind Edit buttons
        document.querySelectorAll(".edit-cat-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const target = e.currentTarget;
                const id = target.dataset.id;
                const name = target.dataset.name;
                const description = target.dataset.description;
                enterEditMode(id, name, description);
            });
        });

        // Bind Delete buttons
        document.querySelectorAll(".delete-cat-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const target = e.currentTarget;
                const id = target.dataset.id;
                const name = target.dataset.name;
                confirmDeleteCategory(id, name);
            });
        });

    } catch (error) {
        console.error("Error loading categories:", error);
        listContainer.innerHTML = `<div style="text-align: center; color: var(--error); padding: 2rem;">Failed to load categories.</div>`;
    }
}

// Switch form state to Edit Mode
function enterEditMode(id, name, description) {
    editingCategoryId = id;
    
    document.getElementById("form-title").innerText = "Edit Category";
    document.getElementById("category-name").value = name;
    document.getElementById("category-description").value = description;

    const submitBtn = document.getElementById("submit-btn");
    submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> Update Category`;
    
    const cancelBtn = document.getElementById("cancel-btn");
    cancelBtn.style.display = "block";
}

// Reset form back to Create Mode
function resetFormState() {
    editingCategoryId = null;
    
    document.getElementById("form-title").innerText = "Create New Category";
    document.getElementById("category-form").reset();

    const submitBtn = document.getElementById("submit-btn");
    submitBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Create Category`;
    
    const cancelBtn = document.getElementById("cancel-btn");
    cancelBtn.style.display = "none";

    // Clear validation highlights
    document.getElementById("category-name").classList.remove("is-invalid");
    document.getElementById("error-name").innerText = "";
}

// Handle Form Submission (Create or Update)
async function handleFormSubmit(e) {
    e.preventDefault();

    const nameInput = document.getElementById("category-name");
    const descInput = document.getElementById("category-description");
    const name = nameInput.value.trim();
    const description = descInput.value.trim();

    // Basic validation
    if (!name) {
        nameInput.classList.add("is-invalid");
        document.getElementById("error-name").innerText = "Category name is required";
        return;
    } else {
        nameInput.classList.remove("is-invalid");
        document.getElementById("error-name").innerText = "";
    }

    try {
        const url = editingCategoryId 
            ? `${window.API}/categories/${editingCategoryId}` 
            : `${window.API}/categories`;
        
        const method = editingCategoryId ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to save category");
        }

        window.showToast(
            editingCategoryId ? "Category updated successfully!" : "Category created successfully!", 
            "success"
        );

        resetFormState();
        await fetchAndRenderCategories();

    } catch (error) {
        console.error("Error saving category:", error);
        window.showToast(error.message, "error");
    }
}

// Show validation confirmation and delete category
function confirmDeleteCategory(id, name) {
    window.showModal(
        "Confirm Deletion",
        `Are you sure you want to delete the category "${name}"? This action cannot be undone.`,
        async () => {
            try {
                const response = await fetch(`${window.API}/categories/${id}`, {
                    method: "DELETE"
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "Failed to delete category");
                }

                window.showToast("Category deleted successfully!", "success");
                await fetchAndRenderCategories();

            } catch (error) {
                console.error("Error deleting category:", error);
                window.showToast(error.message, "error");
            }
        }
    );
}

export default render;
