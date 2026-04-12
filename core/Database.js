import mongoose from 'mongoose';
import { log } from './Logger.js';

class Database {
    constructor() {
        this.uri = process.env.MONGO_URI;
        this.isConnected = false;
    }

    async connect() {
        if (!this.uri) {
            log('error', 'MONGO_URI not found in environment variables. Cloud storage disabled.');
            return false;
        }

        try {
            await mongoose.connect(this.uri, {
                // Modern Mongoose options are default, but you can add more if needed
            });
            this.isConnected = true;
            log('success', 'Connected to MongoDB Atlas successfully! ☁️');
            return true;
        } catch (err) {
            log('error', `Failed to connect to MongoDB: ${err.message}`);
            this.isConnected = false;
            return false;
        }
    }

    async disconnect() {
        try {
            await mongoose.disconnect();
            this.isConnected = false;
            log('info', 'Disconnected from MongoDB.');
        } catch (err) {
            log('error', `Error disconnecting from MongoDB: ${err.message}`);
        }
    }
}

export default new Database();
