require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fleetstar';

// Remove deprecated options and add new recommended settings
const mongoOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

// Connection event handlers
const setupMongoEvents = () => {
    mongoose.connection.on('connected', () => {
        console.log('✅ MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('⚠️  MongoDB disconnected');
    });
};

// Updated graceful shutdown
const shutdown = async (signal) => {
    try {
        await mongoose.disconnect();
        console.log(`\n🛑 Server shutdown by ${signal}`);
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
};

// Improved connection retry logic
const connectWithRetry = async (retries = 5, delay = 3000) => {
    try {
        await mongoose.connect(MONGO_URI, mongoOptions);
        setupMongoEvents();
    } catch (err) {
        console.error(`❌ MongoDB connection failed (attempt ${6 - retries}/5):`, err.message);

        if (retries > 1) {
            await new Promise(res => setTimeout(res, delay));
            return connectWithRetry(retries - 1, delay);
        }

        console.error('💥 Could not connect to MongoDB after multiple attempts');
        process.exit(1);
    }
};

// Start server
const startServer = async () => {
    try {
        await connectWithRetry();

        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🔗 MongoDB URI: ${MONGO_URI.replace(/:[^:]*@/, ':*****@')}`);
        });

        // Handle shutdown signals
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));

        return server;
    } catch (err) {
        console.error('💥 Failed to start server:', err);
        process.exit(1);
    }
};

startServer();