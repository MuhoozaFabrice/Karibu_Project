import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import User from './server/models/User.js';
import { BRANCHES, DIRECTOR_BRANCH } from './server/utils/businessRules.js';

dotenv.config();

// Dev-only seeding password. Set SEED_PASSWORD in .env to override.
const seedPassword = process.env.SEED_PASSWORD || 'ChangeMe123!';

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

        await User.deleteMany({});
        console.log('Cleared existing users');

        const testUsers = [
            { name: 'Maganjo Manager', email: 'manager.maganjo@kgl.com', password: seedPassword, role: 'manager', branch: BRANCHES[0] },
            { name: 'Maganjo Agent 1', email: 'sales1.maganjo@kgl.com', password: seedPassword, role: 'sales', branch: BRANCHES[0] },
            { name: 'Maganjo Agent 2', email: 'sales2.maganjo@kgl.com', password: seedPassword, role: 'sales', branch: BRANCHES[0] },
            { name: 'Matugga Manager', email: 'manager.matugga@kgl.com', password: seedPassword, role: 'manager', branch: BRANCHES[1] },
            { name: 'Matugga Agent 1', email: 'sales1.matugga@kgl.com', password: seedPassword, role: 'sales', branch: BRANCHES[1] },
            { name: 'Matugga Agent 2', email: 'sales2.matugga@kgl.com', password: seedPassword, role: 'sales', branch: BRANCHES[1] },
            { name: 'Mr. Orban', email: 'director@kgl.com', password: seedPassword, role: 'director', branch: DIRECTOR_BRANCH }
        ];

        for (const userData of testUsers) {
            const hashedPassword = await bcryptjs.hash(userData.password, 10);
            await User.create({ ...userData, password: hashedPassword });
            console.log(`Created ${userData.role}: ${userData.email}`);
        }

        console.log(`\nSeed complete. Use password: ${seedPassword} for all test accounts.`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding users:', error.message);
        process.exit(1);
    }
};

seedUsers();
