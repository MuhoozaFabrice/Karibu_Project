// Import the CreditSale model - for sales where the buyer pays later
import CreditSale from '../models/CreditSale.js';
// Import the Produce model - for managing what's in stock
import Produce from '../models/Produce.js';
// Import the Sale model - for sales where the buyer pays right away (cash sales)
import Sale from '../models/Sale.js';
import {
    isAlphaNumericMin2,
    isAlphaOnlyMin2,
    isAtLeastFiveDigits,
    isValidNIN,
    isValidPhone,
    normalizeBranch,
    normalizeProduceName
} from '../utils/businessRules.js';

// This is a helper function that checks if a number is positive (greater than 0)
const validatePositiveNumber = (value) => Number(value) > 0;

// This function records a sale where the customer pays cash right away
export const createCashSale = async (req, res) => {
    try {
        // Get the sale information from the request
        const { produceName, tonnage, amountPaid, buyerName, dateTime } = req.body;
        const branch = req.user.branch;
        const agentName = req.user.name;

        // Check if all required information was provided
        if (!produceName || !tonnage || !amountPaid || !buyerName || !agentName || !branch) {
            return res.status(400).json({ message: 'All cash sale fields are required.' });
        }

        // Check if the tonnage and amount paid are positive numbers
        if (!validatePositiveNumber(tonnage) || !validatePositiveNumber(amountPaid)) {
            return res.status(400).json({ message: 'Tonnage and amountPaid must be positive numbers.' });
        }

        if (!isAtLeastFiveDigits(amountPaid)) {
            return res.status(400).json({ message: 'Amount paid must be at least 5 digits (>= 10,000 UGX).' });
        }

        if (!isAlphaNumericMin2(buyerName)) {
            return res.status(400).json({ message: 'Buyer name must be alphanumeric and at least 2 characters.' });
        }

        const normalizedProduceName = normalizeProduceName(produceName);
        if (!normalizedProduceName) {
            return res.status(400).json({ message: 'Invalid produce name for KGL business rules.' });
        }

        const normalizedBranch = normalizeBranch(branch);
        if (!normalizedBranch) {
            return res.status(400).json({ message: 'Invalid branch for this sale.' });
        }

        // Look for this product in our stock at this branch
        const produce = await Produce.findOne({ name: normalizedProduceName, branch: normalizedBranch });
        // If the product doesn't exist in stock, tell them
        if (!produce) {
            return res.status(404).json({ message: 'Produce not found in branch stock.' });
        }

        // Check if we have enough of this product to sell
        if (Number(tonnage) > produce.quantity) {
            return res.status(400).json({ message: 'Cannot sell unavailable stock.' });
        }

        // Reduce our stock by the amount sold
        produce.quantity -= Number(tonnage);
        // Save the updated stock
        await produce.save();

        // If we're out of stock, create a warning message
        const stockAlert = produce.quantity === 0 ? `${produce.name} is out of stock in ${normalizedBranch}.` : '';

        // Create a record of this sale
        const sale = await Sale.create({
            produceName: normalizedProduceName,
            tonnage: Number(tonnage),
            amountPaid: Number(amountPaid),
            buyerName: buyerName.trim(),
            agentName,
            branch: normalizedBranch,
            dateTime: dateTime ? new Date(dateTime) : new Date(),
            stockAlert
        });

        // Tell them the sale was recorded successfully
        return res.status(201).json({
            message: 'Cash sale recorded successfully.',
            stockAlert,
            sale
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to record cash sale.', error: error.message });
    }
};

// This function records a sale where the customer pays later (credit sale)
export const createCreditSale = async (req, res) => {
    try {
        // Get all the credit sale information from the request
        const {
            buyerName,
            NIN,
            location,
            contact,
            amountDue,
            dueDate,
            produceName,
            type,
            tonnage,
            dispatchDate
        } = req.body;
        const userBranch = req.user.branch;
        const userAgentName = req.user.name;

        // Create a list of all required information
        const requiredFields = [
            buyerName,
            NIN,
            location,
            contact,
            amountDue,
            dueDate,
            produceName,
            type,
            tonnage,
            dispatchDate
        ];

        // Check if any required information is missing
        if (requiredFields.some((field) => field === undefined || field === null || field === '')) {
            return res.status(400).json({ message: 'All credit sale fields are required.' });
        }

        // Check if the tonnage and amount due are positive numbers
        if (!validatePositiveNumber(tonnage) || !validatePositiveNumber(amountDue)) {
            return res.status(400).json({ message: 'Tonnage and amountDue must be positive numbers.' });
        }

        if (!isAtLeastFiveDigits(amountDue)) {
            return res.status(400).json({ message: 'Amount due must be at least 5 digits (>= 10,000 UGX).' });
        }

        if (!isAlphaNumericMin2(buyerName)) {
            return res.status(400).json({ message: 'Buyer name must be alphanumeric and at least 2 characters.' });
        }

        if (!isValidNIN(NIN)) {
            return res.status(400).json({ message: 'NIN format is invalid.' });
        }

        if (!isAlphaNumericMin2(location)) {
            return res.status(400).json({ message: 'Location must be alphanumeric and at least 2 characters.' });
        }

        if (!isValidPhone(contact)) {
            return res.status(400).json({ message: 'Contact phone format is invalid.' });
        }

        if (!isAlphaOnlyMin2(type)) {
            return res.status(400).json({ message: 'Produce type must contain alphabets only and be at least 2 characters.' });
        }

        const parsedDueDate = new Date(dueDate);
        const parsedDispatchDate = new Date(dispatchDate);
        if (Number.isNaN(parsedDueDate.getTime()) || Number.isNaN(parsedDispatchDate.getTime())) {
            return res.status(400).json({ message: 'Due date and dispatch date must be valid dates.' });
        }
        if (parsedDueDate < parsedDispatchDate) {
            return res.status(400).json({ message: 'Due date cannot be earlier than dispatch date.' });
        }

        const normalizedProduceName = normalizeProduceName(produceName);
        if (!normalizedProduceName) {
            return res.status(400).json({ message: 'Invalid produce name for KGL business rules.' });
        }

        const normalizedBranch = normalizeBranch(userBranch);
        if (!normalizedBranch) {
            return res.status(400).json({ message: 'Invalid branch for this credit sale.' });
        }

        // Look for this product in our stock at this branch
        const produce = await Produce.findOne({ name: normalizedProduceName, type: type.trim(), branch: normalizedBranch });
        // If the product doesn't exist in stock, tell them
        if (!produce) {
            return res.status(404).json({ message: 'Produce not found in branch stock.' });
        }

        // Check if we have enough of this product to sell
        if (Number(tonnage) > produce.quantity) {
            return res.status(400).json({ message: 'Cannot sell unavailable stock.' });
        }

        // Reduce our stock by the amount sold
        produce.quantity -= Number(tonnage);
        // Save the updated stock
        await produce.save();

        // If we're out of stock, create a warning message
        const stockAlert = produce.quantity === 0 ? `${produce.name} is out of stock in ${normalizedBranch}.` : '';

        // Create a record of this credit sale
        const creditSale = await CreditSale.create({
            buyerName,
            NIN,
            location,
            contact,
            amountDue: Number(amountDue),
            agentName: userAgentName || 'Sales Agent',
            dueDate: parsedDueDate,
            produceName: normalizedProduceName,
            type: type.trim(),
            tonnage: Number(tonnage),
            dispatchDate: parsedDispatchDate,
            status: 'UNPAID',
            branch: normalizedBranch
        });

        // Tell them the credit sale was recorded successfully
        return res.status(201).json({
            message: 'Credit sale recorded successfully.',
            stockAlert,
            creditSale
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to record credit sale.', error: error.message });
    }
};

// This function gets the list of products in stock at a specific branch
export const getBranchStock = async (req, res) => {
    try {
        // Use the logged-in user's branch only
        const userBranch = normalizeBranch(req.user.branch);
        if (!userBranch) {
            return res.status(400).json({ message: 'User branch is invalid.' });
        }

        // Find all products at this branch, sorted by name and type
        const stock = await Produce.find({ branch: userBranch }).sort({ name: 1, type: 1 });
        // Send them the list of products
        return res.status(200).json(stock);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch branch stock.', error: error.message });
    }
};
