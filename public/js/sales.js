// =======================
// UTILITY: Get Auth Headers
// =======================

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

// Get the user information from the browser's memory
const user = JSON.parse(localStorage.getItem("user") || "{}");
// Find out which branch this person works at
const userBranch = user.branch;
const agentNameValue = user.name || "Sales Agent";
const noticeBox = document.getElementById("salesNotice");
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

const branchLabel = document.getElementById("currentBranch");
const agentLabel = document.getElementById("currentAgent");
const agentNameInput = document.getElementById("agentName");

if (branchLabel) branchLabel.textContent = userBranch;
if (agentLabel) agentLabel.textContent = agentNameValue;
if (agentNameInput) agentNameInput.value = agentNameValue;

// =======================
// SECTION SWITCHING
// =======================

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

// =======================
// LOAD STOCK
// =======================

// This function gets the list of products in stock
async function loadStock() {
    // Get the login headers
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
        // Ask the server for the products in this branch
        const response = await fetch("/api/sales/branch", {
            method: "GET",
            headers
        });

        // If the request failed, print an error
        if (!response.ok) {
            console.error("Failed to fetch stock");
            return;
        }

        // Get the product list from the server
        const stockData = await response.json();
        branchStockCache = stockData;
        // Find the table that shows the stock
        const table = document.querySelector("#stockTable tbody");
        // Clear the old table rows
        table.innerHTML = "";

        // For each product, add a row to the table
        stockData.forEach((item) => {
            table.innerHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.type}</td>
                    <td>${item.quantity}</td>
                    <td>${item.sellingPrice.toLocaleString()}</td>
                </tr>`;
        });
    } catch (error) {
        console.error("Error loading stock:", error);
    }
}

// Load the stock when the page opens
loadStock();

function updateExpectedCashAmount() {
    const produceName = document.getElementById("produceName")?.value;
    const tonnage = Number(document.getElementById("tonnage")?.value || 0);
    const amountInput = document.getElementById("amountPaid");
    if (!amountInput || !produceName || tonnage <= 0) return;

    const produce = branchStockCache.find((item) => item.name === produceName);
    if (!produce) return;
    amountInput.value = Math.round(tonnage * Number(produce.sellingPrice || 0));
}

document.getElementById("produceName")?.addEventListener("change", updateExpectedCashAmount);
document.getElementById("tonnage")?.addEventListener("input", updateExpectedCashAmount);

// =======================
// CASH SALES
// =======================

// When someone submits the cash sale form, do this function
document.getElementById("cashSaleForm").addEventListener("submit", async function (e) {
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
                produceName: document.getElementById("produceName").value,
                // Get the amount of product sold from the form
                tonnage: Number(document.getElementById("tonnage").value),
                // Get the amount of money paid from the form
                amountPaid: Number(document.getElementById("amountPaid").value),
                // Get the buyer's name from the form
                buyerName: document.getElementById("buyerName").value,
                // Always use the logged-in sales agent name
                agentName: agentNameValue
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
        // Reload the stock list
        loadStock();
        // Clear the form
        this.reset();
        // Restore read-only sales agent after reset
        if (agentNameInput) agentNameInput.value = agentNameValue;
    } catch (error) {
        showNotice("Error: " + error.message, "error");
    }
});

// =======================
// CREDIT SALES
// =======================

// When someone submits the credit sale form, do this function
document.getElementById("creditForm").addEventListener("submit", async function (e) {
    // Stop the form from reloading the page
    e.preventDefault();

    // Get the login headers
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
        // Send the credit sale information to the server
        const response = await fetch("/api/sales/credit", {
            method: "POST",
            headers,
            body: JSON.stringify({
                // Get the buyer's name from the form
                buyerName: document.getElementById("cBuyer").value,
                // Get the buyer's ID number from the form
                NIN: document.getElementById("nin").value,
                // Get the buyer's location from the form
                location: document.getElementById("location").value,
                // Get the buyer's phone number from the form
                contact: document.getElementById("contact").value,
                // Get the amount the buyer owes from the form
                amountDue: Number(document.getElementById("amountDue").value),
                // Use the logged-in user's name as the sales agent
                agentName: agentNameValue,
                // Get the date when the buyer must pay from the form
                dueDate: new Date(document.getElementById("dueDate").value),
                // Get the product name from the form
                produceName: document.getElementById("produceCredit").value,
                // Get the product type from the form
                type: document.getElementById("produceType").value,
                // Get the amount of product sold from the form
                tonnage: Number(document.getElementById("creditTonnage").value),
                // Get the delivery date from the form
                dispatchDate: new Date(document.getElementById("dispatchDate").value)
            })
        });

        // Get the response from the server
        const data = await response.json();

        // If the request failed, show an error
        if (!response.ok) {
            showNotice("Error: " + (data.message || "Failed to save credit sale"), "error");
            return;
        }

        // If there's a stock warning, show it
        if (data.stockAlert) {
            showNotice("Stock Alert: " + data.stockAlert, "warning");
        }

        // Tell them the credit sale was recorded
        if (!data.stockAlert) {
            showNotice("Credit sale saved.", "success");
        }
        // Reload the stock list
        loadStock();
        // Clear the form
        this.reset();
    } catch (error) {
        showNotice("Error: " + error.message, "error");
    }
});

// =======================
// LOGOUT
// =======================

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
