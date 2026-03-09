// Import mongoose - the tool that helps us work with MongoDB
import mongoose from 'mongoose';
import { ALLOWED_PRODUCE, BRANCHES } from '../utils/businessRules.js';

// Create a template for how a procurement (buying) should look like
const procurementSchema = new mongoose.Schema(
    {
        // Name of the product we bought
        produceName: {
            type: String,
            required: true,
            trim: true,
            enum: ALLOWED_PRODUCE
        },
        // Type or category of the product
        type: {
            type: String,
            required: true,
            trim: true
        },
        // The date when we bought it
        date: {
            type: String,
            required: true
        },
        // The time when we bought it
        time: {
            type: String,
            required: true
        },
        // How much of the product we bought (in tons)
        tonnage: {
            type: Number,
            required: true,
            min: 0
        },
        // How much money we paid for it
        cost: {
            type: Number,
            required: true,
            min: 0
        },
        // Name of the person who sold it to us
        dealerName: {
            type: String,
            required: true,
            trim: true
        },
        // Which branch we bought it for
        branch: {
            type: String,
            required: true,
            trim: true,
            enum: BRANCHES
        },
        // The dealer's phone number or contact info
        contact: {
            type: String,
            required: true,
            trim: true
        },
        // The price we will sell it for
        sellingPrice: {
            type: Number,
            required: true,
            min: 0
        },
        // Who created this purchase record (the manager's ID)
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    // Automatically add when the procurement was created and last updated
    { timestamps: true }
);

// Create the Procurement model using the template
const Procurement = mongoose.model('Procurement', procurementSchema);

// Export the Procurement model so other files can use it
export default Procurement;
