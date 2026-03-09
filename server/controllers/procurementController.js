// Import the Procurement model - for storing purchase records
import Procurement from '../models/Procurement.js';
// Import the Produce model - for managing what's in stock
import Produce from '../models/Produce.js';
import {
    isAlphaNumericMin2,
    isAlphaOnlyMin2,
    isAtLeastFiveDigits,
    isValidPhone,
    normalizeBranch,
    normalizeProduceName
} from '../utils/businessRules.js';

// This function records a new purchase of products
export const createProcurement = async (req, res) => {
    try {
        // Get all the information about this purchase from the request
        const {
            produceName,
            type,
            date,
            time,
            tonnage,
            cost,
            dealerName,
            contact,
            sellingPrice
        } = req.body;
        const branch = req.user.branch;

        // Create a list of all required information
        const requiredFields = [
            produceName,
            type,
            date,
            time,
            tonnage,
            cost,
            dealerName,
            branch,
            contact,
            sellingPrice
        ];

        // Check if any required information is missing
        if (requiredFields.some((field) => field === undefined || field === null || field === '')) {
            return res.status(400).json({ message: 'All procurement fields are required.' });
        }

        // Convert the number fields from text to actual numbers
        const parsedTonnage = Number(tonnage);
        const parsedCost = Number(cost);
        const parsedSellingPrice = Number(sellingPrice);

        // Check if the numbers make sense (amount must be positive)
        if (parsedTonnage < 1000 || parsedCost < 0 || parsedSellingPrice < 0) {
            return res.status(400).json({ message: 'Tonnage and pricing values are invalid.' });
        }

        if (!isAtLeastFiveDigits(parsedCost)) {
            return res.status(400).json({ message: 'Cost must be at least 5 digits (>= 10,000 UGX).' });
        }

        if (!isAtLeastFiveDigits(parsedSellingPrice)) {
            return res.status(400).json({ message: 'Selling price must be at least 5 digits (>= 10,000 UGX).' });
        }

        if (!isAlphaOnlyMin2(type)) {
            return res.status(400).json({ message: 'Produce type must contain alphabets only and be at least 2 characters.' });
        }

        if (!isAlphaNumericMin2(dealerName)) {
            return res.status(400).json({ message: 'Dealer name must be alphanumeric and at least 2 characters.' });
        }

        if (!isValidPhone(contact)) {
            return res.status(400).json({ message: 'Dealer contact phone format is invalid.' });
        }

        if (Number.isNaN(new Date(date).getTime())) {
            return res.status(400).json({ message: 'Procurement date is invalid.' });
        }

        if (!String(time).trim()) {
            return res.status(400).json({ message: 'Procurement time is required.' });
        }

        const normalizedProduceName = normalizeProduceName(produceName);
        if (!normalizedProduceName) {
            return res.status(400).json({ message: 'Invalid produce name for KGL business rules.' });
        }

        const normalizedBranch = normalizeBranch(branch);
        if (!normalizedBranch) {
            return res.status(400).json({ message: 'Invalid branch for this procurement.' });
        }

        // Create a new procurement record in the database
        const procurement = await Procurement.create({
            produceName: normalizedProduceName,
            type: type.trim(),
            date,
            time,
            tonnage: parsedTonnage,
            cost: parsedCost,
            dealerName: dealerName.trim(),
            branch: normalizedBranch,
            contact,
            sellingPrice: parsedSellingPrice,
            createdBy: req.user._id
        });

        // Check if this product already exists in our stock
        const existingProduce = await Produce.findOne({ name: normalizedProduceName, type: type.trim(), branch: normalizedBranch });

        // If it doesn't exist, create a new stock entry
        if (!existingProduce) {
            await Produce.create({
                name: normalizedProduceName,
                type: type.trim(),
                branch: normalizedBranch,
                quantity: parsedTonnage,
                sellingPrice: parsedSellingPrice
            });
        } else {
            // If it already exists, add the new tonnage to what we already have
            existingProduce.quantity += parsedTonnage;
            // Update the selling price to the latest price
            existingProduce.sellingPrice = parsedSellingPrice;
            // Save the updated stock
            await existingProduce.save();
        }

        // Tell them the purchase was recorded successfully
        return res.status(201).json({
            message: 'Procurement recorded and stock updated successfully.',
            procurement
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to create procurement.', error: error.message });
    }
};

// This function gets a list of all past purchases
export const getProcurements = async (req, res) => {
    try {
        const branch = normalizeBranch(req.user.branch);
        if (!branch) {
            return res.status(400).json({ message: 'User branch is invalid.' });
        }
        // Get all procurement records, sorted by newest first
        const procurements = await Procurement.find({ branch }).sort({ createdAt: -1 });
        // Send them the list
        return res.status(200).json(procurements);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch procurements.', error: error.message });
    }
};
