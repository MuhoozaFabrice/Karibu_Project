// Import express - the tool for creating routes/pages
import express from 'express';
// Import the analytics controller function
import { getSummaryAnalytics } from '../controllers/analyticsController.js';
// Import the function that checks if someone is logged in
import authMiddleware from '../middleware/authMiddleware.js';
// Import the function that checks if someone has the right job role
import authorize from '../middleware/roleMiddleware.js';

// Create a router to handle analytics requests
const router = express.Router();

// When someone sends a GET request to get analytics summary, check they're logged in and are a director, then run getSummaryAnalytics
router.get('/summary', authMiddleware, authorize('director'), getSummaryAnalytics);

// Export this router so other files can use it
export default router;
