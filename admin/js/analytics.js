document.addEventListener("DOMContentLoaded", function () {
    // API endpoint for fetching analytics data (Linking to backend)
    const apiBaseUrl = "http://localhost:5000/api/admin/analytics";

    // Elements
    const totalOrdersEl = document.getElementById("total-orders");
    const totalRevenueEl = document.getElementById("total-revenue");
    const popularProductEl = document.getElementById("popular-product");
    const startDateEl = document.getElementById("start-date");
    const endDateEl = document.getElementById("end-date");
    const filterBtn = document.getElementById("filter-btn");
    const salesChartCanvas = document.getElementById("sales-chart").getContext("2d");
    const loadingSpinner = document.getElementById("loading-spinner");
    const toastEl = document.getElementById("toast");

    let salesChart; // Chart instance

    // Check for Auth Token
    const authToken = localStorage.getItem("authToken");

    // Show loading spinner
    function showLoading() {
        loadingSpinner.style.display = "block";
    }

    // Hide loading spinner
    function hideLoading() {
        loadingSpinner.style.display = "none";
    }

    // Show toast notification
    function showToast(message, isError = false) {
        toastEl.textContent = message;
        toastEl.className = "toast" + (isError ? " error" : "");
        toastEl.style.display = "block";
        setTimeout(() => {
            toastEl.style.display = "none";
        }, 3000);
    }

    // Validate date range
    function validateDateRange(startDate, endDate) {
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            showToast("Start date must be before end date.", true);
            return false;
        }
        return true;
    }

    // Fetch and display analytics data
    function fetchAnalytics(startDate = "", endDate = "") {
        if (!authToken) return; // Stop if authToken is missing

        if (!validateDateRange(startDate, endDate)) return;

        showLoading();
        let url = apiBaseUrl;
        if (startDate && endDate) {
            url += `?start=${startDate}&end=${endDate}`;
        }

        fetch(url, {
            headers: {
                'Authorization': `Bearer ${authToken}` // Include authToken in the Authorization header
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                return response.json();
            })
            .then(data => {
                // Update total orders, revenue, and popular product
                totalOrdersEl.textContent = data.totalOrders || 0;
                totalRevenueEl.textContent = `$${data.totalRevenue.toFixed(2) || "0.00"}`;
                popularProductEl.textContent = data.popularProduct || "N/A";

                // Update sales chart
                updateSalesChart(data.salesTrends);
            })
            .catch(error => {
                console.error("Error fetching analytics:", error);
                showToast("Failed to fetch analytics data. Please try again.", true);
            })
            .finally(() => {
                hideLoading();
            });
    }

    // Update the sales chart with new data
    function updateSalesChart(salesData) {
        const labels = salesData.map(item => item.date);
        const salesValues = salesData.map(item => item.sales);

        if (salesChart) {
            salesChart.destroy(); // Destroy previous chart instance before updating
        }

        salesChart = new Chart(salesChartCanvas, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Sales Over Time",
                    data: salesValues,
                    borderColor: "#101524",
                    backgroundColor: "rgba(16, 21, 36, 0.2)",
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: "#101524",
                    pointHoverRadius: 7,
                    tension: 0.4 // Smooth line
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        enabled: true,
                        mode: "index",
                        intersect: false
                    },
                    legend: {
                        display: true,
                        position: "bottom"
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: "Date" },
                        grid: { display: false }
                    },
                    y: {
                        title: { display: true, text: "Sales" },
                        beginAtZero: true,
                        grid: { color: "#e0e0e0" }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: "easeInOutQuart"
                }
            }
        });
    }

    // Handle date filter button click
    filterBtn.addEventListener("click", function () {
        const startDate = startDateEl.value;
        const endDate = endDateEl.value;
        fetchAnalytics(startDate, endDate);
    });

    // Fetch initial data when the page loads
    if (authToken) {
        fetchAnalytics();
    }
});