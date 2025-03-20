document.addEventListener("DOMContentLoaded", function () {
    const apiBaseUrl = "http://localhost:5000/api/recommendations"; // Backend link
    const authToken = localStorage.getItem("authToken"); // Retrieve authToken from localStorage

    const productSelect = document.getElementById("product-select");
    const recommendationList = document.getElementById("recommendation-list");
    const addRecommendationBtn = document.getElementById("add-recommendation");
    const loadingIndicator = document.getElementById("loading-indicator");
    const errorMessage = document.getElementById("error-message");
    const paginationContainer = document.getElementById("pagination-container");

    let currentPage = 1;
    const itemsPerPage = 5; // Adjust as needed

    // Fetch all products for selection dropdown
    function fetchProducts() {
        if (!authToken) return; // Stop if authToken is missing

        showLoading();
        fetch(`${apiBaseUrl}/products`, {
            headers: {
                "Authorization": `Bearer ${authToken}` // Include authToken in the Authorization header
            }
        })
            .then(response => {
                if (!response.ok) throw new Error("Failed to fetch products");
                return response.json();
            })
            .then(products => {
                productSelect.innerHTML = `<option value="">Select a Product</option>`;
                products.forEach(product => {
                    const option = document.createElement("option");
                    option.value = product.id;
                    option.textContent = product.name;
                    productSelect.appendChild(option);
                });
            })
            .catch(error => {
                showError("Error fetching products. Please try again.");
                console.error("Error fetching products:", error);
            })
            .finally(() => hideLoading());
    }

    // Fetch recommended products with pagination
    function fetchRecommendations(page = 1) {
        if (!authToken) return; // Stop if authToken is missing

        showLoading();
        fetch(`${apiBaseUrl}?page=${page}&limit=${itemsPerPage}`, {
            headers: {
                "Authorization": `Bearer ${authToken}` // Include authToken in the Authorization header
            }
        })
            .then(response => {
                if (!response.ok) throw new Error("Failed to fetch recommendations");
                return response.json();
            })
            .then(data => {
                recommendationList.innerHTML = ""; // Clear previous list
                data.recommendations.forEach(recommendation => {
                    const li = document.createElement("li");
                    li.innerHTML = `
                        ${recommendation.name}
                        <button class="remove-btn" data-id="${recommendation.id}" aria-label="Remove ${recommendation.name}">Remove</button>
                    `;
                    recommendationList.appendChild(li);
                });

                // Render pagination
                renderPagination(data.total, page);
            })
            .catch(error => {
                showError("Error fetching recommendations. Please try again.");
                console.error("Error fetching recommendations:", error);
            })
            .finally(() => hideLoading());
    }

    // Add new recommendation
    addRecommendationBtn.addEventListener("click", function () {
        if (!authToken) return; // Stop if authToken is missing

        const selectedProductId = productSelect.value;
        if (!selectedProductId) {
            showError("Please select a product!");
            return;
        }

        // Check if the product is already in the recommendations list
        const existingRecommendation = Array.from(recommendationList.children).find(li => {
            return li.querySelector(".remove-btn").getAttribute("data-id") === selectedProductId;
        });

        if (existingRecommendation) {
            showError("This product is already in the recommendations list.");
            return;
        }

        showLoading();
        fetch(`${apiBaseUrl}/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}` // Include authToken in the Authorization header
            },
            body: JSON.stringify({ productId: selectedProductId })
        })
            .then(response => {
                if (!response.ok) throw new Error("Failed to add recommendation");
                return response.json();
            })
            .then(() => {
                fetchRecommendations(currentPage); // Refresh list
                showSuccess("Product added to recommendations!");
            })
            .catch(error => {
                showError("Error adding recommendation. Please try again.");
                console.error("Error adding recommendation:", error);
            })
            .finally(() => hideLoading());
    });

    // Remove recommendation
    recommendationList.addEventListener("click", function (event) {
        if (!authToken) return; // Stop if authToken is missing

        if (event.target.classList.contains("remove-btn")) {
            const productId = event.target.getAttribute("data-id");

            showLoading();
            fetch(`${apiBaseUrl}/remove/${productId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${authToken}` // Include authToken in the Authorization header
                }
            })
                .then(response => {
                    if (!response.ok) throw new Error("Failed to remove recommendation");
                    return response.json();
                })
                .then(() => {
                    fetchRecommendations(currentPage); // Refresh list
                    showSuccess("Product removed from recommendations!");
                })
                .catch(error => {
                    showError("Error removing recommendation. Please try again.");
                    console.error("Error removing recommendation:", error);
                })
                .finally(() => hideLoading());
        }
    });

    // Render pagination
    function renderPagination(totalItems, currentPage) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        paginationContainer.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.textContent = i;
            button.disabled = i === currentPage;
            button.addEventListener("click", () => {
                currentPage = i;
                fetchRecommendations(currentPage);
            });
            paginationContainer.appendChild(button);
        }
    }

    // Show loading indicator
    function showLoading() {
        loadingIndicator.style.display = "block";
    }

    // Hide loading indicator
    function hideLoading() {
        loadingIndicator.style.display = "none";
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
        setTimeout(() => {
            errorMessage.style.display = "none";
        }, 5000);
    }

    // Show success message
    function showSuccess(message) {
        alert(message); // Replace with a more user-friendly success message display
    }

    // Initial fetches
    if (authToken) {
        fetchProducts();
        fetchRecommendations(currentPage);
    }
});