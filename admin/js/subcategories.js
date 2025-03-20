document.addEventListener("DOMContentLoaded", () => {
    const subcategoryList = document.getElementById("subcategory-list");
    const categoryDropdown = document.getElementById("category-dropdown");
    const newSubcategoryInput = document.getElementById("new-subcategory");
    const addSubcategoryBtn = document.getElementById("add-subcategory");
    const subcategorySearch = document.getElementById("subcategory-search");
    const filterCategory = document.getElementById("filter-category");
    const sortSubcategories = document.getElementById("sort-subcategories");
    const bulkDeleteBtn = document.getElementById("bulk-delete");
    const printPdfBtn = document.getElementById("print-pdf");
    const loader = document.getElementById("loader");
    const toast = document.getElementById("toast");
    const paginationContainer = document.getElementById("pagination");
    const imageUpload = document.getElementById("subcategory-image");
    const imagePreview = document.getElementById("image-preview");
    const dragDropArea = document.getElementById("drag-drop-area");
    const browseBtn = document.getElementById("browse-btn");

    const API_BASE_URL = "http://localhost:5000/api/subcategories";
    const CATEGORIES_API_URL = "http://localhost:5000/api/categories";

    let categories = [];
    let subcategories = [];
    let currentPage = 1;
    const itemsPerPage = 10;
    let uploadedImage = null;

    // Check for Auth Token
    const authToken = localStorage.getItem("authToken");

    // Fetch and Display Subcategories
    async function fetchSubcategories() {
        if (!authToken) return; // Stop if authToken is missing

        showLoader();
        try {
            const response = await fetch(API_BASE_URL, {
                headers: {
                    'Authorization': `Bearer ${authToken}` // Include authToken in the Authorization header
                }
            });
            if (!response.ok) throw new Error("Failed to fetch subcategories");
            subcategories = await response.json();
            renderSubcategories();
            renderPagination();
            showToast("Subcategories fetched successfully", "success");
        } catch (error) {
            showToast(`Error: ${error.message}`, "error");
        } finally {
            hideLoader();
        }
    }

    // Fetch and Populate Categories
    async function fetchCategories() {
        if (!authToken) return; // Stop if authToken is missing

        showLoader();
        try {
            const response = await fetch(CATEGORIES_API_URL, {
                headers: {
                    'Authorization': `Bearer ${authToken}` // Include authToken in the Authorization header
                }
            });
            if (!response.ok) throw new Error("Failed to fetch categories");
            categories = await response.json();
            populateCategoryDropdowns();
            showToast("Categories fetched successfully", "success");
        } catch (error) {
            showToast(`Error: ${error.message}`, "error");
        } finally {
            hideLoader();
        }
    }

    // Populate Category Dropdowns
    function populateCategoryDropdowns() {
        categoryDropdown.innerHTML = '<option value="">Select Category</option>';
        filterCategory.innerHTML = '<option value="">Filter by Category</option>';
        categories.forEach(category => {
            const option = `<option value="${category._id}">${category.name}</option>`;
            categoryDropdown.innerHTML += option;
            filterCategory.innerHTML += option;
        });
        showToast("Category dropdowns populated", "info");
    }

    // Render Subcategories with Pagination
    function renderSubcategories(filteredData = subcategories) {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        subcategoryList.innerHTML = "";
        paginatedData.forEach(subcategory => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="checkbox" class="select-subcategory" data-id="${subcategory._id}" aria-label="Select ${subcategory.name}"></td>
                <td contenteditable="true" onblur="updateSubcategory('${subcategory._id}', this.textContent)" aria-label="Edit ${subcategory.name}">${subcategory.name}</td>
                <td>${categories.find(cat => cat._id === subcategory.categoryId)?.name || "N/A"}</td>
                <td><img src="${subcategory.image || 'https://via.placeholder.com/50'}" alt="${subcategory.name}" width="50" height="50"></td>
                <td>
                    <button class="delete-subcategory" data-id="${subcategory._id}" aria-label="Delete ${subcategory.name}">🗑️ Delete</button>
                </td>
            `;
            subcategoryList.appendChild(row);
        });
        showToast("Subcategories rendered", "info");
    }

    // Update Subcategory
    async function updateSubcategory(id, newName) {
        if (!authToken) return; // Stop if authToken is missing

        if (!newName.trim()) {
            showToast("Subcategory name cannot be empty", "error");
            return;
        }

        showLoader();
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${authToken}`, // Include authToken in the Authorization header
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newName })
            });

            if (!response.ok) throw new Error("Failed to update subcategory");
            fetchSubcategories();
            showToast("Subcategory updated successfully", "success");
        } catch (error) {
            showToast(`Error: ${error.message}`, "error");
        } finally {
            hideLoader();
        }
    }

    // Add Subcategory with Image
    addSubcategoryBtn.addEventListener("click", async () => {
        if (!authToken) return; // Stop if authToken is missing

        const categoryId = categoryDropdown.value;
        const name = newSubcategoryInput.value.trim();

        if (!categoryId || !name) {
            showToast("Please select a category and enter a name", "error");
            return;
        }

        if (!uploadedImage) {
            showToast("Please upload an image for the subcategory", "error");
            return;
        }

        showLoader();
        try {
            const response = await fetch(API_BASE_URL, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${authToken}`, // Include authToken in the Authorization header
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, categoryId, image: uploadedImage })
            });

            if (!response.ok) throw new Error("Failed to add subcategory");
            newSubcategoryInput.value = "";
            imagePreview.innerHTML = `<span>Drag & Drop or Click to Upload Image</span>`;
            uploadedImage = null;
            fetchSubcategories();
            showToast("Subcategory added successfully", "success");
        } catch (error) {
            showToast(`Error: ${error.message}`, "error");
        } finally {
            hideLoader();
        }
    });

    // Delete Subcategory
    subcategoryList.addEventListener("click", async (event) => {
        if (!authToken) return; // Stop if authToken is missing

        if (event.target.classList.contains("delete-subcategory")) {
            const subcategoryId = event.target.dataset.id;

            if (!confirm("Are you sure you want to delete this subcategory?")) return;

            showLoader();
            try {
                const response = await fetch(`${API_BASE_URL}/${subcategoryId}`, {
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${authToken}` // Include authToken in the Authorization header
                    }
                });

            if (!response.ok) throw new Error("Failed to delete subcategory");
            fetchSubcategories();
            showToast("Subcategory deleted successfully", "success");
        } catch (error) {
            showToast(`Error: ${error.message}`, "error");
        } finally {
            hideLoader();
        }
    }});

    // Bulk Delete Subcategories
    bulkDeleteBtn.addEventListener("click", async () => {
        if (!authToken) return; // Stop if authToken is missing

        const selectedSubcategories = document.querySelectorAll(".select-subcategory:checked");
        if (selectedSubcategories.length === 0) return showToast("No subcategories selected", "error");

        const ids = Array.from(selectedSubcategories).map(input => input.dataset.id);

        if (!confirm("Are you sure you want to delete selected subcategories?")) return;

        showLoader();
        try {
            const response = await fetch(`${API_BASE_URL}/bulk-delete`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${authToken}`, // Include authToken in the Authorization header
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids })
            });

            if (!response.ok) throw new Error("Failed to delete subcategories");
            fetchSubcategories();
            showToast("Subcategories deleted successfully", "success");
        } catch (error) {
            showToast(`Error: ${error.message}`, "error");
        } finally {
            hideLoader();
        }
    });

    // Filter Subcategories by Category
    filterCategory.addEventListener("change", () => {
        const categoryId = filterCategory.value;
        const filteredData = categoryId ? subcategories.filter(sub => sub.categoryId === categoryId) : subcategories;
        currentPage = 1; // Reset to first page
        renderSubcategories(filteredData);
        renderPagination(filteredData);
        showToast(`Filtered by category: ${categoryId ? categories.find(cat => cat._id === categoryId)?.name : "All"}`, "info");
    });

    // Search Subcategories with Debounce
    let searchTimeout;
    subcategorySearch.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchText = subcategorySearch.value.toLowerCase();
            const filteredData = subcategories.filter(sub => sub.name.toLowerCase().includes(searchText));
            currentPage = 1; // Reset to first page
            renderSubcategories(filteredData);
            renderPagination(filteredData);
            showToast(`Search results for: ${searchText}`, "info");
        }, 300);
    });

    // Sort Subcategories
    sortSubcategories.addEventListener("change", () => {
        const sortValue = sortSubcategories.value;
        let sortedData = [...subcategories];

        if (sortValue === "name-asc") {
            sortedData.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortValue === "name-desc") {
            sortedData.sort((a, b) => b.name.localeCompare(a.name));
        }

        currentPage = 1; // Reset to first page
        renderSubcategories(sortedData);
        renderPagination(sortedData);
        showToast(`Sorted by: ${sortValue}`, "info");
    });

    // Render Pagination
    function renderPagination(data = subcategories) {
        const totalPages = Math.ceil(data.length / itemsPerPage);
        paginationContainer.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.textContent = i;
            button.className = i === currentPage ? "active" : "";
            button.addEventListener("click", () => {
                currentPage = i;
                renderSubcategories(data);
                showToast(`Page ${i} loaded`, "info");
            });
            paginationContainer.appendChild(button);
        }
    }

    // Print PDF with Subcategories Grouped by Categories
    printPdfBtn.addEventListener("click", async () => {
        if (!authToken) return; // Stop if authToken is missing

        showLoader();
        try {
            // Fetch all subcategories
            const response = await fetch(API_BASE_URL, {
                headers: {
                    'Authorization': `Bearer ${authToken}` // Include authToken in the Authorization header
                }
            });
            if (!response.ok) throw new Error("Failed to fetch subcategories");
            const subcategories = await response.json();

            // Fetch all categories
            const categoriesResponse = await fetch(CATEGORIES_API_URL, {
                headers: {
                    'Authorization': `Bearer ${authToken}` // Include authToken in the Authorization header
                }
            });
            if (!categoriesResponse.ok) throw new Error("Failed to fetch categories");
            const categories = await categoriesResponse.json();

            // Group subcategories by category
            const groupedData = categories.map(category => ({
                category: category.name,
                subcategories: subcategories.filter(sub => sub.categoryId === category._id).map(sub => sub.name)
            }));

            // Generate PDF
            generatePdf(groupedData);
            showToast("PDF generated successfully", "success");
        } catch (error) {
            showToast(`Error: ${error.message}`, "error");
        } finally {
            hideLoader();
        }
    });

    // Generate PDF Function
    function generatePdf(groupedData) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let yOffset = 20; // Vertical offset for content

        // Add title
        doc.setFontSize(18);
        doc.text("Subcategories by Category", 10, yOffset);
        yOffset += 10;

        // Add grouped data
        doc.setFontSize(12);
        groupedData.forEach(group => {
            // Add category name
            doc.setFont("helvetica", "bold");
            doc.text(`Category: ${group.category}`, 10, yOffset);
            yOffset += 10;

            // Add subcategories
            doc.setFont("helvetica", "normal");
            group.subcategories.forEach((subcategory, index) => {
                doc.text(`- ${subcategory}`, 15, yOffset);
                yOffset += 10;

                // Add a new page if content exceeds page height
                if (yOffset > 280) {
                    doc.addPage();
                    yOffset = 20; // Reset offset for new page
                }
            });

            yOffset += 10; // Add spacing between categories
        });

        // Save the PDF
        doc.save("subcategories_by_category.pdf");
    }

    // Image Upload and Preview
    imageUpload.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImage = e.target.result;
                imagePreview.innerHTML = `<img src="${uploadedImage}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle drag-and-drop
    dragDropArea.addEventListener("dragover", (event) => {
        event.preventDefault();
        dragDropArea.classList.add("dragover");
    });

    dragDropArea.addEventListener("dragleave", () => {
        dragDropArea.classList.remove("dragover");
    });

    dragDropArea.addEventListener("drop", (event) => {
        event.preventDefault();
        dragDropArea.classList.remove("dragover");
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImage = e.target.result;
                imagePreview.innerHTML = `<img src="${uploadedImage}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Browse Files Button
    browseBtn.addEventListener("click", () => {
        imageUpload.click();
    });

    // Show/Hide Loader
    function showLoader() {
        loader.style.display = "block";
    }

    function hideLoader() {
        loader.style.display = "none";
    }

    // Show Toast Notification
    function showToast(message, type = "info") {
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.display = "block";
        setTimeout(() => {
            toast.style.display = "none";
        }, 3000);
    }

    // Initial Fetch
    if (authToken) {
        fetchCategories();
        fetchSubcategories();
    }
});