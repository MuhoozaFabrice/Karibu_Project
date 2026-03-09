// This function checks if a user has the right job role to do something
const authorize = (...allowedRoles) => (req, res, next) => {
    // Check if we have user information (they should be logged in first)
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized request.' });
    }

    // Check if their job role is in the list of allowed roles
    if (!allowedRoles.includes(req.user.role)) {
        // If not, tell them they don't have permission
        return res.status(403).json({
            message: `Access denied. Allowed roles: ${allowedRoles.join(', ')}`
        });
    }

    // If they have the right role, let them proceed to the next step
    return next();
};

// Export this function so other files can use it
export default authorize;
