// Import mongoose - the tool that helps us work with MongoDB
import mongoose from 'mongoose';
import { ALLOWED_PRODUCE, BRANCHES } from '../utils/businessRules.js';

// Create a template for how a product in stock should look like (what we have available to sell)
const produceSchema = new mongoose.Schema(
    {
        // Name of the product
        name: {
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
        // Which branch has this product
        branch: {
            type: String,
            required: true,
            trim: true,
            enum: BRANCHES
        },
        // How much of this product we have available to sell (in tons)
        quantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        // The price we sell this product for
        sellingPrice: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        }
    },
    // Automatically add when the produce was created and last updated
    { timestamps: true }
);

// Create a unique index - no two products with the same name, type, and branch can exist
produceSchema.index({ name: 1, type: 1, branch: 1 }, { unique: true });

// Create the Produce model using the template
const Produce = mongoose.model('Produce', produceSchema);

// Export the Produce model so other files can use it
export default Produce;
