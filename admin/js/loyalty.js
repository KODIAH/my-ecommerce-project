document.addEventListener("DOMContentLoaded", () => {
    const authToken = localStorage.getItem("authToken"); // Retrieve authToken from localStorage

    if (authToken) {
        loadLoyaltyData();
    }

    document.getElementById("update-loyalty").addEventListener("click", updateLoyaltySettings);
    document.getElementById("search-member").addEventListener("input", filterMembers);
});

// Load Loyalty Members
async function loadLoyaltyData() {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) return; // Stop if authToken is missing

    try {
        const tableBody = document.getElementById("loyalty-table");
        tableBody.innerHTML = "<tr><td colspan='4'>Loading members...</td></tr>"; // Show loading message

        const response = await fetch("http://localhost:5000/api/loyalty/members", {
            headers: {
                "Authorization": `Bearer ${authToken}` // Include authToken in the Authorization header
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const members = await response.json();
        tableBody.innerHTML = ""; // Clear loading message

        if (members.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='4'>No members found.</td></tr>"; // Show message if no members
        } else {
            members.forEach(member => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${member.name}</td>
                    <td>${member.email}</td>
                    <td>${member.points}</td>
                    <td><button class="redeem-btn" onclick="redeemPoints('${member.email}')">Redeem</button></td>
                `;
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Error loading loyalty data:", error);
        const tableBody = document.getElementById("loyalty-table");
        tableBody.innerHTML = `<tr><td colspan='4'>Error loading data. Please try again later.</td></tr>`;
    }
}

// Update Loyalty Settings
async function updateLoyaltySettings() {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) return; // Stop if authToken is missing

    const pointsPerDollar = document.getElementById("points-per-dollar").value;
    const redeemRate = document.getElementById("redeem-rate").value;

    // Input validation
    if (!pointsPerDollar || !redeemRate || isNaN(pointsPerDollar) || isNaN(redeemRate)) {
        alert("Please enter valid numbers for Points Per Dollar and Redeem Rate.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/loyalty/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}` // Include authToken in the Authorization header
            },
            body: JSON.stringify({ pointsPerDollar, redeemRate })
        });

        if (response.ok) {
            alert("Loyalty settings updated successfully!");
        } else {
            const errorData = await response.json();
            alert(`Failed to update settings: ${errorData.message || "Unknown error"}`);
        }
    } catch (error) {
        console.error("Error updating settings:", error);
        alert("An error occurred while updating settings. Please try again.");
    }
}

// Redeem Points
async function redeemPoints(email) {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) return; // Stop if authToken is missing

    if (!confirm(`Are you sure you want to redeem points for ${email}?`)) {
        return; // Cancel if user doesn't confirm
    }

    try {
        const response = await fetch(`http://localhost:5000/api/loyalty/redeem/${email}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}` // Include authToken in the Authorization header
            }
        });

        if (response.ok) {
            alert("Points redeemed successfully!");
            loadLoyaltyData(); // Refresh the table
        } else {
            const errorData = await response.json();
            alert(`Failed to redeem points: ${errorData.message || "Unknown error"}`);
        }
    } catch (error) {
        console.error("Error redeeming points:", error);
        alert("An error occurred while redeeming points. Please try again.");
    }
}

// Search Members
function filterMembers() {
    const searchValue = document.getElementById("search-member").value.toLowerCase();
    const rows = document.querySelectorAll("#loyalty-table tr");

    rows.forEach(row => {
        if (row.cells.length === 0) return; // Skip rows without cells (e.g., headers or loading messages)

        const name = row.cells[0].textContent.toLowerCase();
        const email = row.cells[1].textContent.toLowerCase();
        
        row.style.display = (name.includes(searchValue) || email.includes(searchValue)) ? "" : "none";
    });
}