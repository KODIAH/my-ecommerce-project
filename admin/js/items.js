document.addEventListener("DOMContentLoaded", function () {
    const categorySelect = document.getElementById("category-select");
    const subcategorySelect = document.getElementById("subcategory-select");
    const addItemBtn = document.getElementById("add-item");
    const sortItemsBtn = document.getElementById("sort-items");
    const searchInput = document.getElementById("search-item");
    const priceRange = document.getElementById("price-range");
    const itemsList = document.getElementById("items-list");
    const bulkDeleteBtn = document.getElementById("bulk-delete-items");
    const bulkEditBtn = document.getElementById("bulk-edit-items");
    const selectAllCheckbox = document.getElementById("select-all");
    const loadMoreBtn = document.getElementById("load-more");
    const sortByDropdown = document.getElementById("sort-by"); // Sorting dropdown
    let currentPage = 1; // Pagination tracker
    let sortOrder = "asc"; // Default sorting order

    // Check for Auth Token
    const authToken = localStorage.getItem("authToken");

    // ✅ Fetch categories from backend
    function fetchCategories() {
        if (!authToken) return; // Stop if authToken is missing

        showLoading(categorySelect); // Show loading effect
        fetch("http://localhost:5000/api/categories", {
            headers: {
                'Authorization': `Bearer ${authToken}` // Include authToken in the Authorization header
            }
        })
            .then(response => response.json())
            .then(data => {
                categorySelect.innerHTML = '<option value="">-- Choose Category --</option>';
                data.forEach(category => {
                    let option = document.createElement("option");
                    option.value = category._id;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
                showToast("Categories fetched successfully!", "success");
            })
            .catch(error => {
                console.error("Error fetching categories:", error);
                showToast("Error fetching categories!", "error");
            })
            .finally(() => hideLoading(categorySelect)); // Hide loading effect
    }

    // ✅ Fetch subcategories based on selected category
    categorySelect.addEventListener("change", function () {
        if (!authToken) return; // Stop if authToken is missing

        let categoryId = categorySelect.value;
        if (!categoryId) return;

        showLoading(subcategorySelect); // Show loading effect
        fetch(`http://localhost:5000/api/subcategories?category=${categoryId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}` // Include authToken in the Authorization header
            }
        })
            .then(response => response.json())
            .then(data => {
                subcategorySelect.innerHTML = '<option value="">-- Choose Subcategory --</option>';
                data.forEach(sub => {
                    let option = document.createElement("option");
                    option.value = sub._id;
                    option.textContent = sub.name;
                    subcategorySelect.appendChild(option);
                });
                showToast("Subcategories fetched successfully!", "success");
            })
            .catch(error => {
                console.error("Error fetching subcategories:", error);
                showToast("Error fetching subcategories!", "error");
            })
            .finally(() => hideLoading(subcategorySelect)); // Hide loading effect
    });

    // ✅ Fetch items (with pagination)
    function fetchItems(categoryId = "", subcategoryId = "", price = 0, search = "") {
        if (!authToken) return; // Stop if authToken is missing

        showLoading(itemsList); // Show loading effect
        let url = `http://localhost:5000/api/items?page=${currentPage}`;
        if (categoryId) url += `&category=${categoryId}`;
        if (subcategoryId) url += `&subcategory=${subcategoryId}`;
        if (price) url += `&price=${price}`;
        if (search) url += `&search=${search}`;

        fetch(url, {
            headers: {
                'Authorization': `Bearer ${authToken}` // Include authToken in the Authorization header
            }
        })
            .then(response => response.json())
            .then(data => {
                if (currentPage === 1) itemsList.innerHTML = ""; // Reset on new filter
                displayItems(data);
                loadMoreBtn.style.display = data.length < 10 ? "none" : "block"; // Hide Load More if fewer items
                showToast("Items fetched successfully!", "success");
            })
            .catch(error => {
                console.error("Error fetching items:", error);
                showToast("Error fetching items!", "error");
            })
            .finally(() => hideLoading(itemsList)); // Hide loading effect
    }

    // ✅ Load more items on button click
    loadMoreBtn.addEventListener("click", function () {
        if (!authToken) return; // Stop if authToken is missing

        currentPage++;
        fetchItems(categorySelect.value, subcategorySelect.value, priceRange.value, searchInput.value);
    });

    // ✅ Display items in table
    function displayItems(items) {
        items.forEach(item => {
            let row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="checkbox" class="item-checkbox" data-id="${item._id}"></td>
                <td><img src="${item.image}" alt="${item.name}" class="item-image"></td>
                <td>${item.name}</td>
                <td>$${item.price}</td>
                <td>${item.category.name}</td>
                <td>${item.subcategory.name}</td>
                <td>
                    <button class="edit-btn" data-id="${item._id}">Edit</button>
                    <button class="delete-btn" data-id="${item._id}">Delete</button>
                </td>
            `;
            itemsList.appendChild(row);
        });

        attachEditListeners();
        attachDeleteListeners();
    }

    // ✅ Attach edit button listeners
    function attachEditListeners() {
        document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", function () {
                if (!authToken) return; // Stop if authToken is missing

                let itemId = this.dataset.id;
                openEditModal(itemId);
            });
        });
    }

    // ✅ Attach delete button listeners
    function attachDeleteListeners() {
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", function () {
                if (!authToken) return; // Stop if authToken is missing

                let itemId = this.dataset.id;
                deleteItem(itemId);
            });
        });
    }

    // ✅ Open edit modal with image preview
    function openEditModal(itemId) {
        if (!authToken) return; // Stop if authToken is missing

        showLoading(document.getElementById("edit-item-modal")); // Show loading effect
        fetch(`http://localhost:5000/api/items/${itemId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}` // Include authToken in the Authorization header
            }
        })
            .then(response => response.json())
            .then(item => {
                document.getElementById("edit-item-name").value = item.name;
                document.getElementById("edit-item-price").value = item.price;
                document.getElementById("edit-item-image-preview").src = item.image;
                document.getElementById("edit-item-modal").style.display = "block";

                document.getElementById("edit-item-save").onclick = function () {
                    saveItemChanges(itemId);
                };
            })
            .catch(error => {
                console.error("Error fetching item details:", error);
                showToast("Error fetching item details!", "error");
            })
            .finally(() => hideLoading(document.getElementById("edit-item-modal"))); // Hide loading effect
    }

    // ✅ Save edited item (with image preview)
    function saveItemChanges(itemId) {
        if (!authToken) return; // Stop if authToken is missing

        showLoading(document.getElementById("edit-item-modal")); // Show loading effect
        let itemName = document.getElementById("edit-item-name").value;
        let itemPrice = document.getElementById("edit-item-price").value;
        let newImage = document.getElementById("edit-item-image").files[0];

        let formData = new FormData();
        formData.append("name", itemName);
        formData.append("price", itemPrice);
        if (newImage) formData.append("image", newImage);

        fetch(`http://localhost:5000/api/items/${itemId}`, {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${authToken}` // Include authToken in the Authorization header
            },
            body: formData
        }).then(() => {
            showToast("Item updated successfully!", "success");
            fetchItems();
            document.getElementById("edit-item-modal").style.display = "none";
        }).catch(error => {
            console.error("Error updating item:", error);
            showToast("Error updating item!", "error");
        })
        .finally(() => hideLoading(document.getElementById("edit-item-modal"))); // Hide loading effect
    }

    // ✅ Add Item Functionality
    addItemBtn.addEventListener("click", function () {
        if (!authToken) return; // Stop if authToken is missing

        const itemName = document.getElementById("item-name").value;
        const itemPrice = document.getElementById("item-price").value;
        const itemImage = document.getElementById("item-image").files[0];
        const categoryId = categorySelect.value;
        const subcategoryId = subcategorySelect.value;

        if (!itemName || !itemPrice || !itemImage || !categoryId || !subcategoryId) {
            showToast("Please fill out all fields.", "error");
            return;
        }

        showLoading(addItemBtn); // Show loading effect
        const formData = new FormData();
        formData.append("name", itemName);
        formData.append("price", itemPrice);
        formData.append("image", itemImage);
        formData.append("category", categoryId);
        formData.append("subcategory", subcategoryId);

        fetch("http://localhost:5000/api/items/", {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${authToken}` // Include authToken in the Authorization header
            },
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                showToast("Item added successfully!", "success");
                // Clear the form
                document.getElementById("item-name").value = "";
                document.getElementById("item-price").value = "";
                document.getElementById("item-image").value = "";
                document.getElementById("image-preview").style.display = "none";
                // Refresh the items list
                fetchItems();
            })
            .catch(error => {
                console.error("Error adding item:", error);
                showToast("Error adding item!", "error");
            })
            .finally(() => hideLoading(addItemBtn)); // Hide loading effect
    });

    // ✅ Delete Item with Undo
    function deleteItem(itemId) {
        if (!authToken) return; // Stop if authToken is missing

        showLoading(document.querySelector(`.delete-btn[data-id="${itemId}"]`)); // Show loading effect
        fetch(`http://localhost:5000/api/items/${itemId}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${authToken}` // Include authToken in the Authorization header
            }
        }).then(() => {
            showToast("Item deleted!", "error", () => {
                // Undo Action: Restore the item
                fetch(`http://localhost:5000/api/items/${itemId}`, {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${authToken}`, // Include authToken in the Authorization header
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ /* item data */ })
                }).then(() => {
                    showToast("Item restored!", "success");
                    fetchItems();
                });
            });
            fetchItems();
        }).catch(error => {
            console.error("Error deleting item:", error);
            showToast("Error deleting item!", "error");
        })
        .finally(() => hideLoading(document.querySelector(`.delete-btn[data-id="${itemId}"]`))); // Hide loading effect
    }

    // ✅ Bulk Delete with Undo
    bulkDeleteBtn.addEventListener("click", () => {
        if (!authToken) return; // Stop if authToken is missing

        let selectedItems = Array.from(document.querySelectorAll(".item-checkbox:checked")).map(checkbox => checkbox.dataset.id);
        if (selectedItems.length === 0) {
            showToast("No items selected!", "warning");
            return;
        }

        showLoading(bulkDeleteBtn); // Show loading effect
        fetch("http://localhost:5000/api/items/bulk-delete", {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${authToken}`, // Include authToken in the Authorization header
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ids: selectedItems })
        }).then(() => {
            showToast("Selected items deleted!", "warning", () => {
                // Undo Action: Restore all deleted items
                fetch("/api/items/bulk-restore", {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${authToken}`, // Include authToken in the Authorization header
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ ids: selectedItems })
                }).then(() => {
                    showToast("Deleted items restored!", "success");
                    fetchItems();
                });
            });
            fetchItems();
        }).catch(error => {
            console.error("Error deleting items:", error);
            showToast("Error deleting items!", "error");
        })
        .finally(() => hideLoading(bulkDeleteBtn)); // Hide loading effect
    });

    // ✅ Sort Items Functionality
    sortItemsBtn.addEventListener("click", function () {
        const items = Array.from(document.querySelectorAll("#items-list tr"));
        const sortBy = sortByDropdown.value; // Get sorting criteria from dropdown

        // Toggle sorting order
        sortOrder = sortOrder === "asc" ? "desc" : "asc";

        // Sort items
        items.sort((a, b) => {
            const aValue = getSortValue(a, sortBy);
            const bValue = getSortValue(b, sortBy);

            if (sortOrder === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        // Clear the table and re-append sorted items
        itemsList.innerHTML = "";
        items.forEach(item => itemsList.appendChild(item));

        showToast(`Items sorted by ${sortBy} in ${sortOrder} order.`, "success");
    });

    // Helper function to get the value to sort by
    function getSortValue(item, sortBy) {
        switch (sortBy) {
            case "name":
                return item.querySelector("td:nth-child(3)").textContent.toLowerCase();
            case "price":
                return parseFloat(item.querySelector("td:nth-child(4)").textContent.replace("$", ""));
            case "category":
                return item.querySelector("td:nth-child(5)").textContent.toLowerCase();
            default:
                return 0;
        }
    }

    // ✅ Initial load
    if (authToken) {
        fetchCategories();
        fetchItems();
    }
});

// Function to Show Toast Notification with Optional Undo
function showToast(message, type = "success", undoCallback = null) {
    const toastContainer = document.getElementById("toast-container");

    // Create Toast
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;

    // Add Undo Button if there's a callback
    if (undoCallback) {
        const undoButton = document.createElement("button");
        undoButton.textContent = "Undo";
        undoButton.style.background = "rgba(255, 255, 255, 0.3)";
        undoButton.style.border = "none";
        undoButton.style.marginLeft = "10px";
        undoButton.style.cursor = "pointer";
        undoButton.style.color = "white";
        undoButton.style.padding = "5px 10px";
        undoButton.style.borderRadius = "3px";

        // Undo Button Click Event
        undoButton.addEventListener("click", () => {
            undoCallback();  // Call the undo function
            toast.remove();  // Remove the toast
        });

        toast.appendChild(undoButton);
    }

    // Append to Toast Container
    toastContainer.appendChild(toast);

    // Trigger Animation
    setTimeout(() => toast.classList.add("show"), 100);

    // Auto Remove After 3 Seconds (if not undone)
    const timeout = setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 500);
    }, 3000);

    // Prevent auto-remove if undo is clicked
    if (undoCallback) {
        undoButton.addEventListener("click", () => clearTimeout(timeout));
    }
}

// Function to show loading effect
function showLoading(element) {
    const loadingSpinner = document.createElement("div");
    loadingSpinner.className = "loading-spinner";
    loadingSpinner.innerHTML = "Loading...";
    element.appendChild(loadingSpinner);
    element.style.position = "relative";
}

// Function to hide loading effect
function hideLoading(element) {
    const loadingSpinner = element.querySelector(".loading-spinner");
    if (loadingSpinner) {
        loadingSpinner.remove();
    }
}