// Import express - the tool for creating routes/pages
import express from 'express';
// Import the sales controller functions
import { createCashSale, createCreditSale, getBranchStock } from '../controllers/salesController.js';
// Import the function that checks if someone is logged in
import authMiddleware from '../middleware/authMiddleware.js';
// Import the function that checks if someone has the right job role
import authorize from '../middleware/roleMiddleware.js';

// Create a router to handle sales requests
const router = express.Router();

// When someone sends a POST request to create a cash sale, check they're logged in and are a manager or sales person, then run createCashSale
router.post('/', authMiddleware, authorize('manager', 'sales'), createCashSale);
// When someone sends a POST request to create a credit sale, check they're logged in and are a sales person, then run createCreditSale
router.post('/credit', authMiddleware, authorize('sales'), createCreditSale);
// When someone sends a GET request to see stock at their branch, check they're logged in and are a manager or sales person, then run getBranchStock
router.get('/branch', authMiddleware, authorize('manager', 'sales'), getBranchStock);

// Export this router so other files can use it
export default router;
