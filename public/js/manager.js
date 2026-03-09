// ===============================
// UTILITY: Get Auth Headers
// ===============================

// This function gets the login token needed to make requests to the server
function getAuthHeaders() {
    // Get the login token from the browser's memory
    const token = localStorage.getItem("token");
    // If there's no token, the person isn't logged in, so send them back to login
    if (!token) {
        window.location.href = "./sign-in.html";
        return null;
    }
    // Create headers with the token and say we're sending JSON data
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}
// ===============================
// SECTION SWITCHING
// ===============================

// This function switches between different sections/pages of the dashboard
function switchSection(sectionId, element) {
    // Hide all sections by removing the "active" class
    document.querySelectorAll(".section").forEach((section) => {
        section.classList.remove("active");
    });

    // Show the selected section by adding the "active" class
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add("active");
    }

    // Remove the "active" class from all menu items
    document.querySelectorAll(".sidebar li").forEach((li) => {
        li.classList.remove("active");
    });
    // Add the "active" class to the clicked menu item
    if (element) {
        element.classList.add("active");
    }
}

// Get the user information from the browser's memory
const user = JSON.parse(localStorage.getItem("user") || "{}");
// Find out which branch this person works at
const userBranch = user.branch;
const managerHeader = document.getElementById("managerHeader");
const noticeBox = document.getElementById("managerNotice");
let branchStockCache = [];

function showNotice(message, type = "error") {
    if (!noticeBox) return;
    noticeBox.textContent = message;
    noticeBox.className = `dashboard-notice show ${type}`;
}

if (!userBranch) {
    showNotice("Your account has no assigned branch. Please contact the administrator.", "error");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "./index.html";
}

if (managerHeader) {
    const managerName = user.name || "Branch Manager";
    managerHeader.textContent = `${managerName} - ${userBranch}`;
}

// ===============================
// LOAD INVENTORY TABLE
// ===============================

// Find the table that shows inventory
const table = document.getElementById("inventoryTable");

// This function gets the list of products in stock and shows them in the table
async function loadInventory() {
    try {
        // Get the login headers
        const headers = getAuthHeaders();
        if (!headers) return;

        // Ask the server for the products in this branch
        const response = await fetch("/api/sales/branch", {
            method: "GET",
            headers
        });

        // If the request failed, show an error
        if (!response.ok) {
            console.error("Failed to fetch inventory");
            table.innerHTML = "<tr><td colspan='4'>Error loading inventory</td></tr>";
            return;
        }

        // Get the product list from the server
        const inventory = await response.json();
        branchStockCache = inventory;

        // Clear the old table rows
        table.innerHTML = "";

        // For each product, add a row to the table
        inventory.forEach((item) => {
            // If we have less than 1000 tons, mark it as LOW STOCK
            let status = item.quantity < 1000 ? "LOW STOCK" : "OK";
            const row = `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.type}</td>
                    <td>${item.quantity}</td>
                    <td>${status}</td>
                </tr>
            `;
            table.innerHTML += row;
        });

        // Check for any stock alerts
        checkAlerts();
        // Update the total stock number
        updateTotals();
        // Update the chart showing stock distribution
        updateChart();
    } catch (error) {
        console.error("Error loading inventory:", error);
        table.innerHTML = "<tr><td colspan='4'>Error loading inventory</td></tr>";
    }
}

// Load the inventory when the page opens
loadInventory();

function updateExpectedSaleAmount() {
    const produceName = document.getElementById("saleProduce")?.value;
    const tonnage = Number(document.getElementById("saleTonnage")?.value || 0);
    const amountInput = document.getElementById("amountPaid");
    if (!amountInput || !produceName || tonnage <= 0) return;

    const produce = branchStockCache.find((item) => item.name === produceName);
    if (!produce) return;
    amountInput.value = Math.round(tonnage * Number(produce.sellingPrice || 0));
}

document.getElementById("saleProduce")?.addEventListener("change", updateExpectedSaleAmount);
document.getElementById("saleTonnage")?.addEventListener("input", updateExpectedSaleAmount);

// ===============================
// PROCUREMENT
// ===============================

// When someone submits the procurement form, do this function
document.getElementById("procurementForm").addEventListener("submit", async function (e) {
    // Stop the form from reloading the page
    e.preventDefault();

    // Get the login headers
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
        // Send the procurement information to the server
        const response = await fetch("/api/procurement", {
            method: "POST",
            headers,
            body: JSON.stringify({
                // Get the product name from the form
                produceName: document.getElementById("produceName").value,
                // Get the product type from the form
                type: document.getElementById("produceType").value,
                // Get the amount bought from the form
                tonnage: Number(document.getElementById("tonnage").value),
                // Get the cost from the form
                cost: Number(document.getElementById("cost").value),
                // Get the dealer's name from the form
                dealerName: document.getElementById("dealer").value,
                // Get the dealer's contact from the form
                contact: document.getElementById("contact").value,
                // Get the selling price from the form
                sellingPrice: Number(document.getElementById("sellingPrice").value),
                // Use today's date
                date: new Date().toISOString().split('T')[0],
                // Use the current time
                time: new Date().toLocaleTimeString()
            })
        });

        // Get the response from the server
        const data = await response.json();

        // If the request failed, show an error
        if (!response.ok) {
            showNotice("Error: " + (data.message || "Failed to save procurement"), "error");
            return;
        }

        // Tell them the procurement was recorded
        showNotice("Procurement recorded successfully.", "success");
        // Reload the inventory to show the new product
        loadInventory();
        // Clear the form
        this.reset();
    } catch (error) {
        showNotice("Error: " + error.message, "error");
    }
});

// ===============================
// SALES
// ===============================

// When someone submits the sales form, do this function
document.getElementById("salesForm").addEventListener("submit", async function (e) {
    // Stop the form from reloading the page
    e.preventDefault();

    // Get the login headers
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
        // Send the sale information to the server
        const response = await fetch("/api/sales", {
            method: "POST",
            headers,
            body: JSON.stringify({
                // Get the product name from the form
                produceName: document.getElementById("saleProduce").value,
                // Get the amount sold from the form
                tonnage: Number(document.getElementById("saleTonnage").value),
                // Get the buyer's name from the form
                buyerName: document.getElementById("buyerName").value,
                // Get the amount paid from the form
                amountPaid: Number(document.getElementById("amountPaid").value),
                // Use the logged-in manager's name as the agent
                agentName: user.name || "Manager"
            })
        });

        // Get the response from the server
        const data = await response.json();

        // If the request failed, show an error
        if (!response.ok) {
            showNotice("Error: " + (data.message || "Failed to record sale"), "error");
            return;
        }

        // If there's a stock warning, show it
        if (data.stockAlert) {
            showNotice("Stock Alert: " + data.stockAlert, "warning");
        }

        // Tell them the sale was recorded
        if (!data.stockAlert) {
            showNotice("Sale recorded successfully.", "success");
        }
        // Reload the inventory to show the updated stock
        loadInventory();
        // Clear the form
        this.reset();
    } catch (error) {
        showNotice("Error: " + error.message, "error");
    }
});

// ===============================
// ALERT SYSTEM
// ===============================

// This function checks if any products are running low on stock
function checkAlerts() {
    // Get the alert box where we show warnings
    const alertBox = document.getElementById("stockAlert");

    // Look through all products and find ones with "LOW STOCK" status
    const lowStockItems = Array.from(table.querySelectorAll("tr")).filter((row) => {
        const status = row.cells[3]?.textContent || "";
        return status === "LOW STOCK";
    });

    // Show the number of low stock items, or "No alerts" if all is good
    alertBox.textContent =
        lowStockItems.length > 0
            ? `${lowStockItems.length} product(s) low in stock`
            : "No alerts";
}

// ===============================
// KPI UPDATE
// ===============================

// This function calculates and shows the total stock
function updateTotals() {
    // Get all the rows from the inventory table
    const rows = Array.from(table.querySelectorAll("tr"));
    // Add up all the quantities in the table
    const total = rows.reduce((sum, row) => {
        // Get the quantity from the third column (index 2)
        const qty = parseInt(row.cells[2]?.textContent || 0);
        return sum + qty;
    }, 0);

    // Show the total with commas and " KG" label
    document.getElementById("totalStock").textContent = total.toLocaleString() + " KG";
}

// ===============================
// CHART
// ===============================

// This variable stores the chart object
let chart;

// This function creates or updates the stock distribution chart
function updateChart() {
    // Get all the rows from the inventory table
    const rows = Array.from(table.querySelectorAll("tr"));
    // Get all the product names for the chart labels
    const labels = rows.map((row) => row.cells[0]?.textContent || "");
    // Get all the quantities for the chart data
    const data = rows.map((row) => parseInt(row.cells[2]?.textContent || 0));

    // Get the element where the chart will be displayed
    const ctx = document.getElementById("stockChart");

    // If there's already a chart, destroy it first
    if (chart) chart.destroy();

    // Create a new doughnut chart showing the stock distribution
    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels,
            datasets: [
                {
                    data,
                    // Use different colors for each product
                    backgroundColor: [
                        "#09ad09",
                        "#d43684",
                        "#0a3718",
                        "#696d62",
                        "#1e90ff"
                    ],
                    borderColor: "#ffffff",
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// ===============================
// LOGOUT
// ===============================

// Get the logout button from the page
const logoutBtn = document.querySelector(".logout");
// If the logout button exists, add a click handler
if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        // Remove the login token from memory
        localStorage.removeItem("token");
        // Remove the user information from memory
        localStorage.removeItem("user");
        // Send them back to the home page
        window.location.href = "./index.html";
    });
}
