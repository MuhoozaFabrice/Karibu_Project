// Import path and URL utilities - helps us find file locations on the computer
import path from 'path';
import { fileURLToPath } from 'url';
// Import CORS - allows different websites to talk to our server safely
import cors from 'cors';
// Import dotenv - helps us read secret settings from a .env file
import dotenv from 'dotenv';
// Import Express - the main tool that lets us build a web server
import express from 'express';
// Import the database connection function - connects us to MongoDB
import connectDB from './config/db.js';
// Import the analytics routes - pages that show business reports
import analyticsRoutes from './routes/analyticsRoutes.js';
// Import the auth routes - pages for login and sign up
import authRoutes from './routes/authRoutes.js';
// Import the procurement routes - pages for buying products
import procurementRoutes from './routes/procurementRoutes.js';
// Import the sales routes - pages for selling products
import salesRoutes from './routes/salesRoutes.js';

// Load secret settings from the .env file
// Load secret settings from the .env file
dotenv.config();

// Create the Express web server
const app = express();
// Get the name of the current file
const __filename = fileURLToPath(import.meta.url);
// Get the name of the folder where this file is located
const __dirname = path.dirname(__filename);

// Connect to the MongoDB database
// Connect to the MongoDB database
connectDB();

// Allow requests from different websites (CORS setup)
app.use(cors());
// Allow the server to read JSON data from requests
app.use(express.json());

// Health check - when someone goes to /api/health, tell them the server is working
app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', message: 'KGL API is running.' });
});

// Use the auth routes for login and sign up
app.use('/api/auth', authRoutes);
// Use the procurement routes for buying products
app.use('/api/procurement', procurementRoutes);
// Use the sales routes for selling products
app.use('/api/sales', salesRoutes);
// Use the analytics routes for showing reports
app.use('/api/analytics', analyticsRoutes);

// Serve all the HTML, CSS, and JavaScript files for the website
// Serve all the HTML, CSS, and JavaScript files for the website
app.use(express.static(path.join(__dirname, '..', 'public')));

// If someone asks for a page that doesn't exist, show a "not found" message
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found.' });
});

// If something goes wrong, show an error message
app.use((error, _req, res, _next) => {
    console.error('Unhandled server error:', error);
    res.status(500).json({ message: 'Internal server error.' });
});

// Get the port number from the settings, or use 5000 if not set
const PORT = Number(process.env.PORT) || 5000;
// Start the server and listen for requests
app.listen(PORT, () => {
    console.log(`KGL backend running on port ${PORT}`);
});
