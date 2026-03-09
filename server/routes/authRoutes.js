// Import express - the tool for creating routes/pages
import express from 'express';
// Import the login and register functions from the auth controller
import { login, register } from '../controllers/authController.js';

// Create a router to handle authentication requests
const router = express.Router();

// When someone sends a POST request to /register, run the register function
router.post('/register', register);
// When someone sends a POST request to /login, run the login function
router.post('/login', login);

// Export this router so other files can use it
export default router;
