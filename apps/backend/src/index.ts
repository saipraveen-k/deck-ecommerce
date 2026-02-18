import dotenv from 'dotenv';
dotenv.config();

import { httpServer } from './app';
import prisma from './lib/prisma';

const PORT = process.env.PORT || 4000;

async function main() {
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Database connection failed', error);
        process.exit(1);
    }
}

main();
