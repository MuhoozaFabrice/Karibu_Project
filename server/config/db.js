// Import mongoose - the tool that helps us connect to MongoDB
import mongoose from 'mongoose';
// Import dotenv so this file can read environment variables even if called directly.
import dotenv from 'dotenv';

// Load .env variables into process.env for local development.
dotenv.config();

// Create a function that connects to MongoDB
const connectDB = async () => {
    try {
        // Check if the database address (MONGO_URI) is set in the secret settings
        if (!process.env.MONGO_URI) {
            // If not set, print a clear message and stop startup immediately.
            console.error('MongoDB connection failed: MONGO_URI is not defined in environment variables.');
            process.exit(1);
        }

        // Tell us we are about to open a MongoDB connection.
        console.log('Connecting to MongoDB...');
        // Connect to the MongoDB database
        await mongoose.connect(process.env.MONGO_URI);
        // Tell us that the connection was successful
        console.log('MongoDB connected successfully.');
    } catch (error) {
        // If something goes wrong, print the error message
        console.error('MongoDB connection failed:', error.message);
        // Stop the program if we can't connect to the database
        process.exit(1);
    }
};

// Export the function so other files can use it
export default connectDB;
