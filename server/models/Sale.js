// Import mongoose - the tool that helps us work with MongoDB
import mongoose from 'mongoose';
import { ALLOWED_PRODUCE, BRANCHES } from '../utils/businessRules.js';

// Create a template for how a sale should look like (what information a sale has)
const saleSchema = new mongoose.Schema(
    {
        // Name of the product that was sold
        produceName: {
            type: String,
            required: true,
            trim: true,
            enum: ALLOWED_PRODUCE
        },
        // How much of the product was sold (in tons)
        tonnage: {
            type: Number,
            required: true,
            min: 0
        },
        // How much money the buyer paid
        amountPaid: {
            type: Number,
            required: true,
            min: 0
        },
        // Name of the person who bought the product
        buyerName: {
            type: String,
            required: true,
            trim: true
        },
        // Name of the sales agent who made this sale
        agentName: {
            type: String,
            required: true,
            trim: true
        },
        // Which branch did this sale happen at
        branch: {
            type: String,
            required: true,
            trim: true,
            enum: BRANCHES
        },
        // The date and time when the sale happened
        dateTime: {
            type: Date,
            default: Date.now
        },
        // Any warning messages about low stock
        stockAlert: {
            type: String,
            default: ''
        }
    },
    // Automatically add when the sale was created and last updated
    { timestamps: true }
);

// Create the Sale model using the template
const Sale = mongoose.model('Sale', saleSchema);

// Export the Sale model so other files can use it
export default Sale;
