// Import jwt - for creating login tokens
import jwt from 'jsonwebtoken';
// Import bcrypt - for protecting passwords
import bcrypt from 'bcryptjs';
// Import the User model - to store and look up user accounts
import User from '../models/User.js';
import { BRANCHES, DIRECTOR_BRANCH } from '../utils/businessRules.js';

// This function creates a login token (a secret pass) for a user
const generateToken = (user) =>
    jwt.sign(
        // Put the user's ID, job role, and branch in the token
        { id: user._id, role: user.role, branch: user.branch },
        // Use the secret code to create the token
        process.env.JWT_SECRET,
        // The token will expire after 1 day
        { expiresIn: '1d' }
    );

// This function lets a new person create an account
export const register = async (req, res) => {
    try {
        // Get the information they sent us (name, email, password, role, branch)
        const { name, email, password, role, branch } = req.body;

        // Check if all the required information was provided
        if (!name || !email || !password || !role || !branch) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        if (!['director', 'manager', 'sales'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role provided.' });
        }

        if (role === 'director' && branch !== DIRECTOR_BRANCH) {
            return res.status(400).json({ message: `Director branch must be "${DIRECTOR_BRANCH}".` });
        }

        if ((role === 'manager' || role === 'sales') && !BRANCHES.includes(branch)) {
            return res.status(400).json({ message: `Branch must be one of: ${BRANCHES.join(', ')}` });
        }

        // Check if someone with this email already has an account
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered.' });
        }

        // Protect their password by turning it into a secret code that can't be read
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create a new user in the database
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            branch
        });

        // Tell them the account was created successfully and give them their info
        return res.status(201).json({
            message: 'User registered successfully.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                branch: user.branch
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Registration failed.', error: error.message });
    }
};

// This function lets someone log in to their account
export const login = async (req, res) => {
    try {
        // Get their email and password from the login form
        const { email, password } = req.body;

        // Check if they provided both email and password
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Look for a user with this email address in our database
        const user = await User.findOne({ email: email.toLowerCase() });
        // If we can't find them, tell them the credentials are wrong
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Check if their password is correct by comparing it to the secret code
        const isMatch = await bcrypt.compare(password, user.password);
        // If the password doesn't match, tell them the credentials are wrong
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Create a login token (a secret pass) for them
        const token = generateToken(user);
        // Tell them they logged in successfully and give them the token
        return res.status(200).json({
            message: 'Login successful.',
            token,
            role: user.role,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                branch: user.branch
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Login failed.', error: error.message });
    }
};
