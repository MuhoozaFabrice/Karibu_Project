// Import jwt - the tool for checking if someone is logged in
import jwt from 'jsonwebtoken';
// Import the User model - so we can look up user information
import User from '../models/User.js';

// This function checks if a user is logged in before allowing them to do something
const authMiddleware = async (req, res, next) => {
    try {
        // Get the authorization token from the request header (or empty string if not there)
        const authHeader = req.headers.authorization || '';
        // Check if the token starts with "Bearer "
        if (!authHeader.startsWith('Bearer ')) {
            // If not, tell them we can't let them in
            return res.status(401).json({ message: 'Authorization token is required.' });
        }

        // Get just the token part (remove the "Bearer " part)
        const token = authHeader.split(' ')[1];
        // Decode and verify the token to see who is logged in
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Find the user in the database using their ID from the token
        const user = await User.findById(decoded.id).select('-password');

        // If the user doesn't exist in our database, tell them the token is invalid
        if (!user) {
            return res.status(401).json({ message: 'Invalid token user.' });
        }

        // Attach the user information to the request so we can use it later
        req.user = user;
        // Let them proceed to the next step
        return next();
    } catch (error) {
        // If something goes wrong (bad token, expired token, etc), tell them
        return res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
    }
};

// Export this function so other files can use it
export default authMiddleware;
