document.addEventListener("DOMContentLoaded", () => {
    const categoryList = document.getElementById("category-list");
    const newCategoryInput = document.getElementById("new-category");
    const categoryImageInput = document.getElementById("category-image");
    const addCategoryBtn = document.getElementById("add-category");
    const categorySearch = document.getElementById("category-search");
    const sortCategories = document.getElementById("sort-categories");
    const bulkDeleteBtn = document.getElementById("bulk-delete");
    const dragDropArea = document.getElementById("drag-drop-area");
    const imagePreview = document.getElementById("image-preview");

    // Backend API Base URL (Temporary)
    const API_BASE_URL = "http://localhost:5000/api/categories";

    // Loading Element
    const loadingElement = document.getElementById("loading");

    // Check for Auth Token
    const authToken = localStorage.getItem("authToken");

    /** 
     * ✅ Show Loading Animation
     */
    function showLoading() {
        loadingElement.style.display = "block";
    }

    /** 
     * ✅ Hide Loading Animation
     */
    function hideLoading() {
        loadingElement.style.display = "none";
    }

    /** 
     * ✅ Show Toast Notification
     */
    function showToast(message, isError = true) {
        const toast = document.createElement("div");
        toast.className = "toast1"; // Use the same class for all toasts
        toast.textContent = message;

        // Set background color based on error type
        if (isError) {
            toast.style.backgroundColor = "#ff4444"; // Red for errors
        } else {
            toast.style.backgroundColor = "#4CAF50"; // Green for success
        }

        document.body.appendChild(toast);

        // Add the 'show' class to display the toast
        setTimeout(() => {
            toast.classList.add("show");
        }, 100);

        // Remove the toast after a few seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    /** 
     * ✅ Fetch and Display Categories from Backend 
     */
    async function fetchCategories() {
        if (!authToken) return; // Stop if authToken is missing

        showLoading(); // Show loading animation
        try {
            const response = await fetch(API_BASE_URL, {
                headers: {
                    'Authorization': `Bearer ${authToken}` // Include authToken in the Authorization header
                }
            });
            if (!response.ok) {
                throw new Error("Failed to fetch categories");
            }
            const categories = await response.json();

            categoryList.innerHTML = ""; // Clear existing list

            categories.forEach(category => {
                const row = document.createElement("tr");
                row.dataset.id = category._id;

                row.innerHTML = `
                    <td><input type="checkbox" class="select-category" data-id="${category._id}"></td>
                    <td><img src="${category.image}" alt="Category Image" width="50"></td>
                    <td>${category.name}</td>
                    <td>
                        <button class="edit-category" data-id="${category._id}">✏️ Edit</button>
                        <button class="delete-category" data-id="${category._id}">🗑️ Delete</button>
                    </td>
                `;
                categoryList.appendChild(row);
            });
        } catch (error) {
            console.error("Error fetching categories:", error);
            showToast("Error fetching categories. Please try again later.", true); // Error toast
        } finally {
            hideLoading(); // Hide loading animation
        }
    }

    /**
     * ✅ Add New Category to Backend
     */
    addCategoryBtn.addEventListener("click", async () => {
        if (!authToken) return; // Stop if authToken is missing

        const name = newCategoryInput.value.trim();
        const imageFile = categoryImageInput.files[0];

        if (!name || !imageFile) {
            showToast("Please enter a category name and select an image.", true); // Error toast
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("image", imageFile);

        showLoading(); // Show loading animation
        try {
            const response = await fetch(API_BASE_URL, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${authToken}` // Include authToken in the Authorization header
                },
                body: formData
            });

            if (response.ok) {
                newCategoryInput.value = ""; // Clear input field
                categoryImageInput.value = ""; // Clear image input
                imagePreview.style.display = "none"; // Hide image preview
                fetchCategories(); // Refresh categories
                showToast("Category added successfully!", false); // Success toast
            } else {
                console.error("Error adding category.");
                showToast("Error adding category. Please try again.", true); // Error toast
            }
        } catch (error) {
            console.error("Error adding category:", error);
            showToast("Error adding category. Please try again.", true); // Error toast
        } finally {
            hideLoading(); // Hide loading animation
        }
    });

    /**
     * ✅ Delete Category from Backend
     */
    categoryList.addEventListener("click", async (event) => {
        if (!authToken) return; // Stop if authToken is missing

        if (event.target.classList.contains("delete-category")) {
            const categoryId = event.target.dataset.id;

            if (!confirm("Are you sure you want to delete this category?")) return;

            showLoading(); // Show loading animation
            try {
                const response = await fetch(`${API_BASE_URL}/${categoryId}`, {
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${authToken}` // Include authToken in the Authorization header
                    }
                });

                if (response.ok) {
                    fetchCategories(); // Refresh categories
                    showToast("Category deleted successfully!", false); // Success toast
                } else {
                    console.error("Error deleting category.");
                    showToast("Error deleting category. Please try again.", true); // Error toast
                }
            } catch (error) {
                console.error("Error deleting category:", error);
                showToast("Error deleting category. Please try again.", true); // Error toast
            } finally {
                hideLoading(); // Hide loading animation
            }
        }
    });

    /**
     * ✅ Edit Category (Prompt User for New Name)
     */
    categoryList.addEventListener("click", async (event) => {
        if (!authToken) return; // Stop if authToken is missing

        if (event.target.classList.contains("edit-category")) {
            const categoryId = event.target.dataset.id;
            const newName = prompt("Enter new category name:");

            if (!newName) return;

            showLoading(); // Show loading animation
            try {
                const response = await fetch(`${API_BASE_URL}/${categoryId}`, {
                    method: "PUT",
                    headers: {
                        'Authorization': `Bearer ${authToken}`, // Include authToken in the Authorization header
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: newName })
                });

                if (response.ok) {
                    fetchCategories(); // Refresh categories
                    showToast("Category updated successfully!", false); // Success toast
                } else {
                    console.error("Error updating category.");
                    showToast("Error updating category. Please try again.", true); // Error toast
                }
            } catch (error) {
                console.error("Error updating category:", error);
                showToast("Error updating category. Please try again.", true); // Error toast
            } finally {
                hideLoading(); // Hide loading animation
            }
        }
    });

    /**
     * ✅ Bulk Delete Selected Categories
     */
    bulkDeleteBtn.addEventListener("click", async () => {
        if (!authToken) return; // Stop if authToken is missing

        const selectedCategories = document.querySelectorAll(".select-category:checked");
        if (selectedCategories.length === 0) {
            showToast("No categories selected.", true); // Error toast
            return;
        }

        const ids = Array.from(selectedCategories).map(input => input.dataset.id);

        if (!confirm("Are you sure you want to delete selected categories?")) return;

        showLoading(); // Show loading animation
        try {
            const response = await fetch(`${API_BASE_URL}/bulk-delete`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${authToken}`, // Include authToken in the Authorization header
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids })
            });

            if (response.ok) {
                fetchCategories(); // Refresh categories
                showToast("Selected categories deleted successfully!", false); // Success toast
            } else {
                console.error("Error bulk deleting categories.");
                showToast("Error bulk deleting categories. Please try again.", true); // Error toast
            }
        } catch (error) {
            console.error("Error bulk deleting categories:", error);
            showToast("Error bulk deleting categories. Please try again.", true); // Error toast
        } finally {
            hideLoading(); // Hide loading animation
        }
    });

    /**
     * ✅ Search Categories
     */
    categorySearch.addEventListener("input", async () => {
        if (!authToken) return; // Stop if authToken is missing

        const searchText = categorySearch.value.toLowerCase();

        showLoading(); // Show loading animation
        try {
            const response = await fetch(`${API_BASE_URL}?search=${searchText}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}` // Include authToken in the Authorization header
                }
            });
            const filteredCategories = await response.json();

            categoryList.innerHTML = ""; // Clear list
            filteredCategories.forEach(category => {
                const row = document.createElement("tr");
                row.dataset.id = category._id;

                row.innerHTML = `
                    <td><input type="checkbox" class="select-category" data-id="${category._id}"></td>
                    <td><img src="${category.image}" alt="Category Image" width="50"></td>
                    <td>${category.name}</td>
                    <td>
                        <button class="edit-category" data-id="${category._id}">✏️ Edit</button>
                        <button class="delete-category" data-id="${category._id}">🗑️ Delete</button>
                    </td>
                `;
                categoryList.appendChild(row);
            });
        } catch (error) {
            console.error("Error searching categories:", error);
            showToast("Error searching categories. Please try again.", true); // Error toast
        } finally {
            hideLoading(); // Hide loading animation
        }
    });

    /**
     * ✅ Sort Categories
     */
    sortCategories.addEventListener("change", async () => {
        if (!authToken) return; // Stop if authToken is missing

        const sortValue = sortCategories.value;

        showLoading(); // Show loading animation
        try {
            const response = await fetch(`${API_BASE_URL}?sort=${sortValue}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}` // Include authToken in the Authorization header
                }
            });
            const sortedCategories = await response.json();

            categoryList.innerHTML = ""; // Clear list
            sortedCategories.forEach(category => {
                const row = document.createElement("tr");
                row.dataset.id = category._id;

                row.innerHTML = `
                    <td><input type="checkbox" class="select-category" data-id="${category._id}"></td>
                    <td><img src="${category.image}" alt="Category Image" width="50"></td>
                    <td>${category.name}</td>
                    <td>
                        <button class="edit-category" data-id="${category._id}">✏️ Edit</button>
                        <button class="delete-category" data-id="${category._id}">🗑️ Delete</button>
                    </td>
                `;
                categoryList.appendChild(row);
            });
        } catch (error) {
            console.error("Error sorting categories:", error);
            showToast("Error sorting categories. Please try again.", true); // Error toast
        } finally {
            hideLoading(); // Hide loading animation
        }
    });

    /**
     * ✅ Drag and Drop File Upload
     */
    dragDropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dragDropArea.classList.add("dragover");
    });

    dragDropArea.addEventListener("dragleave", () => {
        dragDropArea.classList.remove("dragover");
    });

    dragDropArea.addEventListener("drop", (e) => {
        e.preventDefault();
        dragDropArea.classList.remove("dragover");

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            categoryImageInput.files = e.dataTransfer.files;
            displayImagePreview(file);
        } else {
            showToast("Please upload a valid image file.", true); // Error toast
        }
    });

    /**
     * ✅ Browse Files Button
     */
    const browseBtn = document.getElementById("browse-btn");
    browseBtn.addEventListener("click", () => {
        categoryImageInput.click();
    });

    /**
     * ✅ Handle File Selection
     */
    categoryImageInput.addEventListener("change", () => {
        const file = categoryImageInput.files[0];
        if (file) {
            displayImagePreview(file);
        }
    });

    /**
     * ✅ Display Image Preview
     */
    function displayImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = "block";
        };
        reader.readAsDataURL(file);
    }

    /**
     * ✅ Fetch Categories on Page Load
     */
    if (authToken) {
        fetchCategories();
    }
});