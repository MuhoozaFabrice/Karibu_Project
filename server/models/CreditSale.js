// Import mongoose - the tool that helps us work with MongoDB
import mongoose from 'mongoose';
import { ALLOWED_PRODUCE, BRANCHES } from '../utils/businessRules.js';

// Create a template for how a credit sale should look like (what information is stored for credit sales)
const creditSaleSchema = new mongoose.Schema(
    {
        // Name of the person who bought on credit
        buyerName: {
            type: String,
            required: true,
            trim: true
        },
        // Their ID number
        NIN: {
            type: String,
            required: true,
            trim: true
        },
        // Where they live
        location: {
            type: String,
            required: true,
            trim: true
        },
        // Their phone number or way to contact them
        contact: {
            type: String,
            required: true,
            trim: true
        },
        // How much money they still owe us
        amountDue: {
            type: Number,
            required: true,
            min: 0
        },
        // Name of the sales agent who made this credit sale
        agentName: {
            type: String,
            required: true,
            trim: true
        },
        // The date when they must pay us back
        dueDate: {
            type: Date,
            required: true
        },
        // Name of the product they bought
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
        // How much of the product they bought (in tons)
        tonnage: {
            type: Number,
            required: true,
            min: 0
        },
        // The date when we delivered the product to them
        dispatchDate: {
            type: Date,
            required: true
        },
        // Whether they have paid us back yet (UNPAID or PAID)
        status: {
            type: String,
            enum: ['UNPAID', 'PAID'],
            default: 'UNPAID'
        },
        // Which branch did this credit sale happen at
        branch: {
            type: String,
            required: true,
            trim: true,
            enum: BRANCHES
        }
    },
    // Automatically add when the credit sale was created and last updated
    { timestamps: true }
);

// Create the CreditSale model using the template
const CreditSale = mongoose.model('CreditSale', creditSaleSchema);

// Export the CreditSale model so other files can use it
export default CreditSale;
