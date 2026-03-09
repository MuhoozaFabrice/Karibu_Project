// Import mongoose - the tool that helps us connect to MongoDB
import mongoose from 'mongoose';

// Create a function that connects to MongoDB
const connectDB = async () => {
    try {
        // Check if the database address (MONGO_URI) is set in the secret settings
        if (!process.env.MONGO_URI) {
            // If not set, throw an error
            throw new Error('MONGO_URI is not defined in environment variables.');
        }

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
