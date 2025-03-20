document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebar = document.getElementById('close-sidebar');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Toggle Sidebar
    menuToggle.addEventListener('click', function () {
        sidebar.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', sidebar.classList.contains('open'));
    });

    // Close Sidebar with Close Button
    closeSidebar.addEventListener('click', function () {
        sidebar.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', false);
    });

    // Close Sidebar When Clicking Outside
    document.addEventListener('click', function (event) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnMenuToggle = menuToggle.contains(event.target);

        if (!isClickInsideSidebar && !isClickOnMenuToggle && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', false);
        }
    });

    // Theme Toggle
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', function () {
        body.classList.toggle('dark-mode');
        const isDarkMode = body.classList.contains('dark-mode');
        themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });

    // Check for Auth Token before fetching data
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        fetchDashboardData(authToken);
    } else {
        // Redirect to login if no authToken is found
    }
});

// Fetch Dashboard Data from the Backend
async function fetchDashboardData(authToken) {
    try {
        const response = await fetch('http://localhost:5000/api/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();

        // Update the DOM with fetched data
        document.getElementById('total-orders').textContent = data.totalOrders || '0';
        document.getElementById('total-revenue').textContent = data.totalRevenue || '0';
        document.getElementById('popular-product').textContent = data.popularProduct || 'N/A';
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        document.getElementById('total-orders').textContent = '0';
        document.getElementById('total-revenue').textContent = '0';
        document.getElementById('popular-product').textContent = 'N/A';

        if (localStorage.getItem('authToken')) {
            showDashboardToast('Failed to fetch dashboard data. Please try again.', true);
        } else {
            // Redirect to login if the token is invalid or missing
        }
    }
}

// Function to show a dashboard-specific toast notification
function showDashboardToast(message, isError = true) {
    const toast = document.createElement('div');
    toast.className = 'dashboard-toast';
    toast.textContent = message;

    toast.style.backgroundColor = isError ? "#ff4444" : "#4CAF50";

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");
    }, 100);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}