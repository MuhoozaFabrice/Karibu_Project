// Import mongoose - the tool that helps us work with MongoDB
import mongoose from 'mongoose';
import { BRANCHES, DIRECTOR_BRANCH } from '../utils/businessRules.js';

// Create a template for how a user should look like (their information)
const userSchema = new mongoose.Schema(
    {
        // Person's full name
        name: {
            type: String,
            required: true,
            trim: true
        },
        // Person's email address (used to log in)
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        // Person's secret password
        password: {
            type: String,
            required: true
        },
        // Person's job role (director, manager, or sales)
        role: {
            type: String,
            enum: ['director', 'manager', 'sales'],
            required: true
        },
        // Which branch the person works at
        branch: {
            type: String,
            required: true,
            trim: true,
            enum: [...BRANCHES, DIRECTOR_BRANCH]
        }
    },
    // Automatically add when the user was created and last updated
    { timestamps: true }
);

// Create the User model using the template
const User = mongoose.model('User', userSchema);

// Export the User model so other files can use it
export default User;
