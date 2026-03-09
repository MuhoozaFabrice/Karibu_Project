// Import the CreditSale model - for sales where the buyer pays later
import CreditSale from '../models/CreditSale.js';
// Import the Produce model - for managing what's in stock
import Produce from '../models/Produce.js';
// Import the Sale model - for sales where the buyer pays right away
import Sale from '../models/Sale.js';
import { BRANCHES, isCompanyDirector } from '../utils/businessRules.js';

// This function gets a summary of all business analytics and reports
export const getSummaryAnalytics = async (req, res) => {
    try {
        if (!isCompanyDirector(req.user)) {
            return res.status(403).json({ message: 'Only director Mr. Orban can view company-wide analytics.' });
        }

        // Run 4 different queries at the same time to get all the report data
        const [salesByBranch, revenueResult, outstandingCreditByBranch, stockTotalsByBranch, monthlyRevenue] =
            await Promise.all([
                // Query 1: Count sales and revenue for each branch
                Sale.aggregate([
                    {
                        // Group sales by branch
                        $group: {
                            _id: '$branch',
                            // Count how many sales happened
                            totalSales: { $sum: 1 },
                            // Add up all the money from sales
                            totalRevenue: { $sum: '$amountPaid' },
                            // Add up all the product sold
                            totalTonnageSold: { $sum: '$tonnage' }
                        }
                    },
                    { $project: { _id: 0, branch: '$_id', totalSales: 1, totalRevenue: 1, totalTonnageSold: 1 } },
                    { $sort: { branch: 1 } }
                ]),
                // Query 2: Get the total revenue from all sales
                Sale.aggregate([
                    {
                        $group: {
                            _id: null,
                            // Add up all money from all sales
                            totalRevenue: { $sum: '$amountPaid' }
                        }
                    }
                ]),
                // Query 3: Get unpaid credit sales for each branch
                CreditSale.aggregate([
                    // Only look at sales that haven't been paid yet
                    { $match: { status: 'UNPAID' } },
                    {
                        // Group by branch
                        $group: {
                            _id: '$branch',
                            // Add up all the money customers owe us
                            outstandingBalance: { $sum: '$amountDue' },
                            // Count how many unpaid invoices there are
                            unpaidInvoices: { $sum: 1 }
                        }
                    },
                    { $project: {
                        _id: 0,
                        branch: '$_id',
                        outstandingBalance: 1,
                        unpaidInvoices: 1
                    } },
                    { $sort: { branch: 1 } }
                ]),
                // Query 4: Get total stock and inventory value for each branch
                Produce.aggregate([
                    {
                        // Group by branch
                        $group: {
                            _id: '$branch',
                            // Add up all the product in stock
                            totalStockKg: { $sum: '$quantity' },
                            // Calculate the value of all the stock (quantity × selling price)
                            inventoryValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } }
                        }
                    },
                    { $project: { _id: 0, branch: '$_id', totalStockKg: 1, inventoryValue: 1 } },
                    { $sort: { branch: 1 } }
                ]),
                Sale.aggregate([
                    {
                        $group: {
                            _id: { $month: '$dateTime' },
                            totalRevenue: { $sum: '$amountPaid' }
                        }
                    },
                    { $sort: { _id: 1 } }
                ])
            ]);

        const salesByBranchMap = new Map(salesByBranch.map((item) => [item.branch, item]));
        const normalizedSalesByBranch = BRANCHES.map((branch) => ({
            branch,
            totalSales: salesByBranchMap.get(branch)?.totalSales ?? 0,
            totalRevenue: salesByBranchMap.get(branch)?.totalRevenue ?? 0,
            totalTonnageSold: salesByBranchMap.get(branch)?.totalTonnageSold ?? 0
        }));

        const monthlyRevenueMap = new Map(monthlyRevenue.map((item) => [item._id, item.totalRevenue]));
        const monthlyRevenueTrend = Array.from({ length: 12 }, (_, i) => monthlyRevenueMap.get(i + 1) ?? 0);

        // Add up all the money customers owe us across all branches
        const totalOutstandingCredit = outstandingCreditByBranch.reduce(
            (sum, entry) => sum + entry.outstandingBalance,
            0
        );

        // Send back all the report data
        return res.status(200).json({
            // Sales data for each branch
            salesPerBranch: normalizedSalesByBranch,
            // Total revenue from all sales everywhere
            totalRevenue: revenueResult[0]?.totalRevenue ?? 0,
            monthlyRevenueTrend,
            // Information about money customers owe us
            outstandingCreditBalances: {
                totalOutstandingCredit,
                byBranch: outstandingCreditByBranch
            },
            // Stock information for each branch
            stockTotals: stockTotalsByBranch
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch analytics summary.', error: error.message });
    }
};
