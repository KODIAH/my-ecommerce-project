// shared.js

const TIMER_DURATION = 45; // 45 seconds
const PROTECTED_PAGES = [
  "admin.html",
  "analytics.html",
  "categories.html",
  "items.html",
  "orders.html",
  "recommendations.html",
  "loyalty.html",
  "subcategories.html",
];
const EXEMPT_PAGES = [
  "login.html",
  "new-password.html",
  "reset-password.html",
  "signup.html",
  "verify-code.html",
];

// Check if the current page is protected
const currentPage = window.location.pathname.split("/").pop();
const isProtectedPage = PROTECTED_PAGES.includes(currentPage);
const isExemptPage = EXEMPT_PAGES.includes(currentPage);

// Token-based Authentication
const AUTH_TOKEN_KEY = "authToken";
const TIMER_END_TIME_KEY = "timerEndTime";

function checkAuth() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const notificationCard = document.getElementById("notification-card");

  if (isProtectedPage && !token) {
    const endTime = localStorage.getItem(TIMER_END_TIME_KEY);

    if (endTime && Date.now() < parseInt(endTime, 10)) {
      // Timer is still active
      displayLoginRequest(currentPage);
      startTimer(parseInt(endTime, 10));
    } else {
      // Timer expired or not set
      displayLoginRequest(currentPage);
      startTimer();
    }
  } else {
    // User is logged in, remove notification card if it exists
    if (notificationCard) {
      notificationCard.style.display = "none";
    }
  }
}

// Ensure the function runs on page load
document.addEventListener("DOMContentLoaded", checkAuth);

function displayLoginRequest(pageName) {
  // Remove the .html extension from the page name
  const formattedPageName = pageName.replace(".html", "");

  // Create or update the notification card
  let notificationCard = document.getElementById("notification-card");
  if (!notificationCard) {
    notificationCard = document.createElement("div");
    notificationCard.id = "notification-card";
    document.body.appendChild(notificationCard);
  }

  // Set the content of the notification card
  notificationCard.innerHTML = `
    <div class="notification-content">
      <p>Please log in to access <strong>${formattedPageName}</strong>.</p>
      <p>You will be redirected in <strong>${TIMER_DURATION}</strong> seconds.</p>
      <button id="login-button">Log In Now</button>
    </div>
  `;

  // Make the notification card visible immediately
  notificationCard.style.display = "block";

  // Add event listener to the button
  const loginButton = document.getElementById("login-button");
  if (loginButton) {
    loginButton.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }
}

function redirectToLogin() {
  // Clear the timer end time from localStorage
  localStorage.removeItem(TIMER_END_TIME_KEY);

  // Redirect to the login page
  window.location.href = "login.html";
}

// Timer Logic
function startTimer(endTime) {
  if (!endTime) {
    endTime = Date.now() + TIMER_DURATION * 1000; // Set the end time immediately
    localStorage.setItem(TIMER_END_TIME_KEY, endTime);
  }

  const timerInterval = setInterval(() => {
    const now = Date.now();
    const remainingTime = Math.max(0, Math.floor((endTime - now) / 1000));

    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      localStorage.removeItem(TIMER_END_TIME_KEY);
      if (isProtectedPage) {
        redirectToLogin();
      }
    } else {
      updateNotificationCard(remainingTime, currentPage);
    }
  }, 1000);
}

function updateNotificationCard(remainingTime, pageName) {
  const notificationCard = document.getElementById("notification-card");
  if (notificationCard) {
    // Remove the .html extension from the page name
    const formattedPageName = pageName.replace(".html", "");

    // Update the content of the notification card
    notificationCard.innerHTML = `
      <div class="notification-content">
        <p>Please log in to access <strong>${formattedPageName}</strong>.</p>
        <p>You will be redirected in <strong>${remainingTime}</strong> seconds.</p>
        <button id="login-button">Log In Now</button>
      </div>
    `;

    // Add event listener to the button
    const loginButton = document.getElementById("login-button");
    if (loginButton) {
      loginButton.addEventListener("click", () => {
        window.location.href = "login.html";
      });
    }
  }
}

// Initialize
if (!isExemptPage) {
  checkAuth();
}

// Logout Functionality
function logout() {
  // Clear the authToken from localStorage
  localStorage.removeItem(AUTH_TOKEN_KEY);

  // Display the notification card immediately
  displayLoginRequest(currentPage);

  // Start the timer immediately
  startTimer();
}

// Function to check if the user is logged in
function isLoggedIn() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token !== null && token !== undefined;
}

// Function to toggle logout button visibility
function toggleLogoutButton() {
  const logoutBtn = document.getElementById("logout-btn"); // Navbar Logout Button
  const sidebarLogoutBtn = document.getElementById("sidebar-logout-btn"); // Sidebar Logout Button

  if (isLoggedIn()) {
    if (window.innerWidth > 768) {
      // Show logout button in navbar, hide in sidebar
      if (logoutBtn) logoutBtn.style.display = "flex";
      if (sidebarLogoutBtn) sidebarLogoutBtn.style.display = "none";
    } else {
      // Show logout button in sidebar, hide in navbar
      if (logoutBtn) logoutBtn.style.display = "none";
      if (sidebarLogoutBtn) sidebarLogoutBtn.style.display = "block";
    }
  } else {
    // Hide both buttons if not logged in
    if (logoutBtn) logoutBtn.style.display = "none";
    if (sidebarLogoutBtn) sidebarLogoutBtn.style.display = "none";
  }
}

// Call function on page load
document.addEventListener("DOMContentLoaded", toggleLogoutButton);

// Update visibility when resizing window
window.addEventListener("resize", toggleLogoutButton);

// Add event listeners to logout buttons
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  const sidebarLogoutBtn = document.getElementById("sidebar-logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  if (sidebarLogoutBtn) {
    sidebarLogoutBtn.addEventListener("click", logout);
  }

  // Toggle logout button visibility based on login status
  toggleLogoutButton();
});

// Prevent going back to the previous page after being redirected to the login page
window.addEventListener("pageshow", (event) => {
  if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
    // If the page is loaded from the cache or via the back button, redirect to login
    if (localStorage.getItem(TIMER_END_TIME_KEY) ){
      window.location.href = "login.html";
    }
  }
});