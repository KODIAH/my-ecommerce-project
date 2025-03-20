document.addEventListener("DOMContentLoaded", function () {
    const ordersTableBody = document.querySelector("#orders-table tbody");
    const searchInput = document.getElementById("search-order");
    const statusFilter = document.getElementById("filter-status");
    const bulkDeleteBtn = document.getElementById("bulk-delete");
    const modal = document.getElementById("order-modal");
    const modalContent = document.querySelector(".modal-content");
    const modalCloseBtn = document.querySelector(".close-btn");
    const paginationDiv = document.getElementById("pagination");

    let orders = []; // Store fetched orders
    let lastFocusedElement = null; // Track last focused element for accessibility
    let currentPage = 1; // Current page for pagination
    const ordersPerPage = 10; // Number of orders per page

    // Check for Auth Token
    const authToken = localStorage.getItem("authToken");

    // Toast notification function
    function showToast(message, type = "success") {
        const toast = document.createElement("div");
        toast.className = `toast-message ${type}`;
        toast.innerText = message;
        document.body.appendChild(toast);

        // Remove the toast after 5 seconds
        setTimeout(() => {
            toast.classList.add("fade-out");
            setTimeout(() => toast.remove(), 500); // Wait for fade-out animation to complete
        }, 5000); // 5000ms = 5 seconds
    }

    // Fetch orders from backend with retry logic and loading effect
    async function fetchOrders(page = 1, retryCount = 3) {
        if (!authToken) return; // Stop if authToken is missing

        ordersTableBody.innerHTML = `
            <tr>
                <td colspan='6' class='loading'>
                    <div class="loading-spinner"></div> Loading orders...
                </td>
            </tr>
        `;

        for (let attempt = 0; attempt < retryCount; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

                const response = await fetch(`http://localhost:5000/api/orders?page=${page}&limit=${ordersPerPage}`, {
                    signal: controller.signal,
                    headers: {
                        'Authorization': `Bearer ${authToken}` // Include authToken in the Authorization header
                    }
                });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                orders = data.orders; // Assuming the response includes { orders, totalPages }
                displayOrders(orders);
                updatePaginationControls(data.totalPages, page);
                return;
            } catch (error) {
                console.error(`Attempt ${attempt + 1}: Error fetching orders`, error);

                if (attempt === retryCount - 1) {
                    ordersTableBody.innerHTML = `
                        <tr>
                            <td colspan='6' class='error'>
                                ${error.name === "AbortError" ? "Request timed out. Please try again." : "Error loading orders."}
                            </td>
                        </tr>
                    `;
                    showToast("Error fetching orders!", "error");
                }

                await new Promise(res => setTimeout(res, 2000)); // Wait 2 sec before retry
            }
        }
    }

    // Display orders in table
    function displayOrders(orderList) {
        ordersTableBody.innerHTML = ""; // Clear previous data

        if (orderList.length === 0) {
            ordersTableBody.innerHTML = `
                <tr>
                    <td colspan='6' class='no-data'>No orders found</td>
                </tr>
            `;
            return;
        }

        orderList.forEach(order => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="checkbox" class="order-checkbox" data-id="${order._id}" aria-label="Select Order"></td>
                <td>${order.orderId}</td>
                <td>${order.customerName}</td>
                <td>$${order.totalAmount.toFixed(2)}</td>
                <td>${order.status}</td>
                <td>
                    <button class="view-btn" data-id="${order._id}" aria-label="View Order">View</button>
                    <button class="delete-btn" data-id="${order._id}" aria-label="Delete Order">Delete</button>
                </td>
            `;
            ordersTableBody.appendChild(row);
        });
    }

    // Update pagination controls
    function updatePaginationControls(totalPages, currentPage) {
        paginationDiv.innerHTML = `
            <button onclick="fetchOrders(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}>Previous</button>
            <span>Page ${currentPage} of ${totalPages}</span>
            <button onclick="fetchOrders(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""}>Next</button>
        `;
    }

    // Search orders
    searchInput.addEventListener("input", function () {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredOrders = orders.filter(order =>
            order.customerName.toLowerCase().includes(searchTerm) ||
            order.orderId.toLowerCase().includes(searchTerm)
        );
        displayOrders(filteredOrders);
    });

    // Filter orders by status
    statusFilter.addEventListener("change", function () {
        const selectedStatus = statusFilter.value;
        const filteredOrders = selectedStatus
            ? orders.filter(order => order.status === selectedStatus)
            : orders;
        displayOrders(filteredOrders);
    });

    // Handle click events (event delegation)
    ordersTableBody.addEventListener("click", async function (event) {
        const target = event.target;
        const orderId = target.getAttribute("data-id");

        if (target.classList.contains("view-btn")) {
            const order = orders.find(order => order._id === orderId);
            if (order) showOrderModal(order);
        }

        if (target.classList.contains("delete-btn")) {
            deleteOrder(orderId, target);
        }
    });

    // Show order details in modal
    function showOrderModal(order) {
        lastFocusedElement = document.activeElement; // Store last focused element
        modalContent.innerHTML = `
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Customer:</strong> ${order.customerName}</p>
            <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <button class="close-btn">Close</button>
        `;
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
        modal.querySelector(".close-btn").focus(); // Move focus inside modal
    }

    // Close modal
    function closeModal() {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
        if (lastFocusedElement) lastFocusedElement.focus(); // Restore focus
    }

    modal.addEventListener("click", function (event) {
        if (event.target === modal || event.target.classList.contains("close-btn")) {
            closeModal();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") closeModal();
    });

    // Delete single order
    async function deleteOrder(orderId, button) {
        if (!authToken) return; // Stop if authToken is missing

        if (!confirm("Are you sure you want to delete this order?")) return;

        button.innerHTML = "<span class='loading-spinner'></span> Deleting...";
        button.disabled = true;

        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${authToken}` // Include authToken in the Authorization header
                }
            });
            if (!response.ok) throw new Error("Failed to delete order");

            orders = orders.filter(order => order._id !== orderId);
            displayOrders(orders);
            showToast("Order deleted successfully.");
        } catch (error) {
            showToast("Error deleting order!", "error");
            console.error("Error deleting order:", error);
        } finally {
            button.innerHTML = "Delete";
            button.disabled = false;
        }
    }

    // Bulk delete selected orders
    bulkDeleteBtn.addEventListener("click", async function () {
        if (!authToken) return; // Stop if authToken is missing

        const selectedOrders = [...document.querySelectorAll(".order-checkbox:checked")]
            .map(checkbox => checkbox.getAttribute("data-id"));

        if (selectedOrders.length === 0) {
            showToast("No orders selected for deletion.", "error");
            return;
        }

        if (!confirm(`Are you sure you want to delete ${selectedOrders.length} orders?`)) return;

        bulkDeleteBtn.innerHTML = "<span class='loading-spinner'></span> Deleting...";
        bulkDeleteBtn.disabled = true;

        try {
            const response = await fetch("http://localhost:5000/api/orders/bulk-delete", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${authToken}`, // Include authToken in the Authorization header
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ orderIds: selectedOrders }),
            });

            if (!response.ok) throw new Error("Failed to delete orders");

            orders = orders.filter(order => !selectedOrders.includes(order._id));
            displayOrders(orders);
            showToast(`${selectedOrders.length} orders deleted.`);
        } catch (error) {
            showToast("Error deleting orders!", "error");
            console.error("Error deleting orders:", error);
        } finally {
            bulkDeleteBtn.innerHTML = "Delete Selected";
            bulkDeleteBtn.disabled = false;
        }
    });

    // Fetch orders when page loads
    if (authToken) {
        fetchOrders(currentPage);
    }
});