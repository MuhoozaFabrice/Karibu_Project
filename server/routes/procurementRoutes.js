// Import express - the tool for creating routes/pages
import express from 'express';
// Import the procurement controller functions
import { createProcurement, getProcurements } from '../controllers/procurementController.js';
// Import the function that checks if someone is logged in
import authMiddleware from '../middleware/authMiddleware.js';
// Import the function that checks if someone has the right job role
import authorize from '../middleware/roleMiddleware.js';

// Create a router to handle procurement requests
const router = express.Router();

// When someone sends a POST request to create a procurement, check they're logged in and are a manager, then run createProcurement
router.post('/', authMiddleware, authorize('manager'), createProcurement);
// When someone sends a GET request to see all procurements, check they're logged in and are a manager, then run getProcurements
router.get('/', authMiddleware, authorize('manager'), getProcurements);

// Export this router so other files can use it
export default router;
