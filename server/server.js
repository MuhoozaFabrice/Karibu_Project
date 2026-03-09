// Import Node's path utilities so we can build absolute file paths safely.
import path from 'path';
// Import a helper to convert this module URL into a normal file path.
import { fileURLToPath } from 'url';
// Import CORS middleware so browser apps from other origins can call this API.
import cors from 'cors';
// Import dotenv so environment variables from .env are available in process.env.
import dotenv from 'dotenv';
// Import Express so we can create and run the web server.
import express from 'express';
// Import database connection function for MongoDB startup.
import connectDB from './config/db.js';
// Import analytics routes (director summary endpoints).
import analyticsRoutes from './routes/analyticsRoutes.js';
// Import authentication routes (register/login endpoints).
import authRoutes from './routes/authRoutes.js';
// Import procurement routes (manager stock purchase endpoints).
import procurementRoutes from './routes/procurementRoutes.js';
// Import sales routes (cash/credit sale and stock endpoints).
import salesRoutes from './routes/salesRoutes.js';

// Load variables from .env into process.env before anything else uses them.
dotenv.config();

// Create one Express application instance.
const app = express();
// Resolve this file's absolute path.
const __filename = fileURLToPath(import.meta.url);
// Resolve this file's folder path.
const __dirname = path.dirname(__filename);
// Build an absolute path to the frontend public folder.
const publicDir = path.join(__dirname, '..', 'public');

// Stop startup early if MONGO_URI is missing, with a clear deployment message.
if (!process.env.MONGO_URI) {
    // Log an explicit error so Render logs show the exact missing variable.
    console.error('Startup failed: MONGO_URI is not defined in environment variables.');
    // Exit with failure code so deployment is marked unhealthy instead of hanging.
    process.exit(1);
}

// Connect to MongoDB when the server boots up.
connectDB();

// Enable CORS for development and production frontend access.
app.use(cors());
// Parse incoming JSON request bodies automatically.
app.use(express.json());

// Health-check endpoint used by developers/hosting to verify server status.
app.get('/api/health', (_req, res) => {
    // Return a structured success JSON response.
    res.status(200).json({ success: true, message: 'KGL API is running.' });
});

// Mount auth endpoints under /api/auth (for example: /api/auth/login).
app.use('/api/auth', authRoutes);
// Also expose auth endpoints under /api for simpler frontend patterns (for example: /api/login).
app.use('/api', authRoutes);
// Mount procurement endpoints under /api/procurement.
app.use('/api/procurement', procurementRoutes);
// Mount sales endpoints under /api/sales.
app.use('/api/sales', salesRoutes);
// Mount analytics endpoints under /api/analytics.
app.use('/api/analytics', analyticsRoutes);

// Serve static frontend assets (HTML, CSS, JS, images) from the public folder.
app.use(express.static(publicDir));

// When a user opens "/", send the frontend entry page (index.html).
app.get('/', (_req, res) => {
    // Send the file using its absolute path.
    res.sendFile(path.join(publicDir, 'index.html'));
});

// Handle unknown API routes with a structured JSON error response.
app.use('/api/*splat', (_req, res) => {
    // Return 404 for any API path that does not exist.
    res.status(404).json({ success: false, message: 'API route not found.' });
});

// Handle unknown non-API routes with a simple frontend fallback.
app.use((_req, res) => {
    // Send users to index.html so the web app can load.
    res.sendFile(path.join(publicDir, 'index.html'));
});

// Centralized error handler to keep server stable on unexpected errors.
app.use((error, _req, res, _next) => {
    // Log full server error for debugging on the backend.
    console.error('Unhandled server error:', error);
    // Return a safe structured JSON response to the client.
    res.status(500).json({ success: false, message: 'Internal server error.' });
});

// Use Render's assigned PORT in production, otherwise use local port 5000.
const PORT = Number(process.env.PORT) || 5000;
// Start listening for incoming HTTP requests on the selected port.
app.listen(PORT, () => {
    // Log startup message so we know server booted correctly.
    console.log(`KGL backend running on port ${PORT}`);
});
