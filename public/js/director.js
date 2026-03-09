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

const user = JSON.parse(localStorage.getItem("user") || "{}");
const directorHeader = document.getElementById("directorHeader");
if (directorHeader) {
    directorHeader.textContent = `${user.name || "Director"} (${user.branch || "Headquarters"})`;
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

// ===============================
// LOAD ANALYTICS DATA
// ===============================

// This function loads all the business reports and analytics
async function loadAnalytics() {
    // Get the login headers
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
        // Ask the server for the analytics summary
        const response = await fetch("/api/analytics/summary", {
            method: "GET",
            headers
        });

        // If the request failed, print an error
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            alert(errorBody.message || "Failed to fetch analytics");
            return;
        }

        // Get the analytics data from the server
        const analytics = await response.json();

        // Show the total revenue as money
        const totalRevenue = analytics.totalRevenue || 0;
        document.getElementById("totalRevenue").textContent =
            "UGX " + totalRevenue.toLocaleString();

        // Count the total number of sales
        let totalSales = 0;
        let branchSalesData = [];

        // Add up all the sales from all branches
        if (analytics.salesPerBranch && analytics.salesPerBranch.length > 0) {
            analytics.salesPerBranch.forEach((branch) => {
                totalSales += branch.totalSales;
                branchSalesData.push(branch);
            });
        }

        // Show the total number of sales (transactions)
        document.getElementById("totalSales").textContent =
            totalSales + " Transactions";

        const branchRevenueByName = (analytics.salesPerBranch || []).reduce((acc, item) => {
            acc[(item.branch || "").trim().toLowerCase()] = Number(item.totalRevenue) || 0;
            return acc;
        }, {});

        document.getElementById("maganjoSales").textContent =
            "UGX " + (branchRevenueByName.maganjo || 0).toLocaleString();
        document.getElementById("matuggaSales").textContent =
            "UGX " + (branchRevenueByName.matugga || 0).toLocaleString();

        // Fill the report table with sales data for each branch
        const table = document.getElementById("reportTable");
        table.innerHTML = "";

        // Add a row for each branch showing its sales
        if (analytics.salesPerBranch && analytics.salesPerBranch.length > 0) {
            analytics.salesPerBranch.forEach((branch) => {
                const row = `
                    <tr>
                        <td>${branch.branch}</td>
                        <td>${branch.totalSales}</td>
                        <td>UGX ${branch.totalRevenue.toLocaleString()}</td>
                    </tr>
                `;
                table.innerHTML += row;
            });
        } else {
            table.innerHTML = `
                <tr>
                    <td colspan="3">No branch sales recorded yet.</td>
                </tr>
            `;
        }

        // Update the charts with the new data
        updateCharts(
            analytics.salesPerBranch || [],
            analytics.monthlyRevenueTrend?.length ? analytics.monthlyRevenueTrend : Array(12).fill(0)
        );
        renderPerformanceTable(analytics.salesPerBranch || []);
        renderCreditData(analytics.outstandingCreditBalances);
        renderInventoryTable(analytics.stockTotals || []);
    } catch (error) {
        console.error("Error loading analytics:", error);
    }
}

// Load the analytics when the page opens
loadAnalytics();

// ===============================
// CHARTS
// ===============================

// These variables store the chart objects
let branchChart, monthlyChart;

// This function creates or updates the charts showing analytics
function updateCharts(branchData, monthlyRevenueTrend) {
    // ===== First Chart: Revenue by Branch =====
    const branchCtx = document.getElementById("branchChart");
    // If there's already a chart, destroy it first
    if (branchChart) branchChart.destroy();

    // Create a bar chart showing revenue for each branch
    branchChart = new Chart(branchCtx, {
        type: "bar",
        data: {
            // The branch names go on the horizontal axis
            labels: branchData.map((b) => b.branch),
            datasets: [
                {
                    // Show the revenue for each branch
                    label: "Revenue UGX",
                    data: branchData.map((b) => b.totalRevenue),
                    // Use a blue-green color for the bars
                    backgroundColor: "rgba(75, 192, 192, 0.8)"
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // ===== Second Chart: Monthly Revenue Pattern =====
    const monthlyCtx = document.getElementById("monthlyChart");
    // If there's already a chart, destroy it first
    if (monthlyChart) monthlyChart.destroy();

    // Create a line chart showing monthly revenue trend
    monthlyChart = new Chart(monthlyCtx, {
        type: "line",
        data: {
            // The months go on the horizontal axis
            labels: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec"
            ],
            datasets: [
                {
                    // Show the revenue trend across months
                    label: "Monthly Revenue (UGX)",
                    data: monthlyRevenueTrend,
                    // Use a purple line
                    borderColor: "rgba(153, 102, 255, 1)",
                    borderWidth: 2,
                    // Don't fill the area under the line
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderPerformanceTable(branchData) {
    const table = document.getElementById("performanceTable");
    if (!table) return;
    table.innerHTML = "";

    if (!branchData.length) {
        table.innerHTML = `<tr><td colspan="4">No performance data available.</td></tr>`;
        return;
    }

    branchData.forEach((branch) => {
        const totalSales = Number(branch.totalSales) || 0;
        const totalRevenue = Number(branch.totalRevenue) || 0;
        const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

        table.innerHTML += `
            <tr>
                <td>${branch.branch}</td>
                <td>${totalSales}</td>
                <td>${(Number(branch.totalTonnageSold) || 0).toLocaleString()}</td>
                <td>UGX ${Math.round(averageSale).toLocaleString()}</td>
            </tr>
        `;
    });
}

function renderCreditData(creditData) {
    const totalCreditEl = document.getElementById("totalCredit");
    const totalInvoicesEl = document.getElementById("totalInvoices");
    const creditTable = document.getElementById("creditTable");
    if (!creditTable || !totalCreditEl || !totalInvoicesEl) return;

    const byBranch = creditData?.byBranch || [];
    totalCreditEl.textContent = `UGX ${(Number(creditData?.totalOutstandingCredit) || 0).toLocaleString()}`;
    totalInvoicesEl.textContent = byBranch.reduce((sum, item) => sum + (Number(item.unpaidInvoices) || 0), 0);

    creditTable.innerHTML = "";
    if (!byBranch.length) {
        creditTable.innerHTML = `<tr><td colspan="3">No outstanding credit data available.</td></tr>`;
        return;
    }

    byBranch.forEach((item) => {
        creditTable.innerHTML += `
            <tr>
                <td>${item.branch}</td>
                <td>${Number(item.unpaidInvoices || 0)}</td>
                <td>UGX ${Number(item.outstandingBalance || 0).toLocaleString()}</td>
            </tr>
        `;
    });
}

function renderInventoryTable(stockTotals) {
    const inventoryTable = document.getElementById("inventoryTable");
    if (!inventoryTable) return;
    inventoryTable.innerHTML = "";

    if (!stockTotals.length) {
        inventoryTable.innerHTML = `<tr><td colspan="3">No inventory totals available.</td></tr>`;
        return;
    }

    stockTotals.forEach((item) => {
        inventoryTable.innerHTML += `
            <tr>
                <td>${item.branch}</td>
                <td>${Number(item.totalStockKg || 0).toLocaleString()}</td>
                <td>UGX ${Number(item.inventoryValue || 0).toLocaleString()}</td>
            </tr>
        `;
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
