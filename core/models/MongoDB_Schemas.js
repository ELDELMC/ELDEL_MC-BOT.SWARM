/**
 * MongoDB Schemas
 * Define la estructura de datos para usuarios y grupos
 */

import mongoose from 'mongoose';

// ========== USER SCHEMA ==========
const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userName: {
        type: String,
        default: 'Unknown'
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    
    // Stats
    messageCount: {
        type: Number,
        default: 0
    },
    commandsUsed: {
        type: Number,
        default: 0
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    isBot: {
        type: Boolean,
        default: false
    },
    
    // Configuración personalizada
    customConfig: {
        language: { type: String, default: 'es' },
        timezone: { type: String, default: 'UTC' },
        aiEnabled: { type: Boolean, default: true },
        downloaderEnabled: { type: Boolean, default: true }
    },

    // Límites y restricciones (para evitar spam)
    downloadCount: {
        type: Number,
        default: 0
    },
    downloadLastReset: {
        type: Date,
        default: Date.now
    },
    
    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastModified: {
        type: Date,
        default: Date.now
    }
});

// ========== GROUP SCHEMA ==========
const groupSchema = new mongoose.Schema({
    groupJid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    groupName: {
        type: String,
        default: 'Unknown Group'
    },
    
    // Membresía
    members: [{
        userId: String,
        userName: String,
        joinedAt: { type: Date, default: Date.now }
    }],
    
    admins: {
        type: [String], // Array de userIds
        default: []
    },
    
    // Configuración de moderación
    settings: {
        antiSpam: { type: Boolean, default: false },
        antiLink: { type: Boolean, default: false },
        antiDelete: { type: Boolean, default: false },
        antiTag: { type: Boolean, default: false },
        welcomeEnabled: { type: Boolean, default: false },
        commandPrefix: { type: String, default: '.' },
        language: { type: String, default: 'es' }
    },
    
    // Estadísticas
    stats: {
        messagesPerDay: { type: Number, default: 0 },
        activeUsers: { type: Number, default: 0 },
        totalInteractions: { type: Number, default: 0 }
    },
    
    // Límites por grupo (para evitar baneos)
    rateLimits: {
        downloadsPerHour: { type: Number, default: 10 },
        aiResponsesPerHour: { type: Number, default: 50 },
        commandsPerHour: { type: Number, default: 100 }
    },

    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastModified: {
        type: Date,
        default: Date.now
    }
});

// ========== DOWNLOAD HISTORY SCHEMA ==========
const downloadHistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    groupJid: {
        type: String,
        required: true,
        index: true
    },
    url: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        enum: ['tiktok', 'instagram', 'facebook', 'youtube', 'twitter', 'spotify', 'soundcloud', 'twitch', 'pinterest', 'reddit', 'vimeo', 'dailymotion'],
        default: 'unknown'
    },
    fileSize: {
        type: Number,
        default: 0
    },
    success: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 2592000 // Auto-delete después de 30 días
    }
});

// ========== AI INTERACTION SCHEMA ==========
const aiInteractionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    groupJid: {
        type: String,
        default: 'dm'
    },
    messageContent: {
        type: String,
        required: true
    },
    responseContent: {
        type: String,
        required: true
    },
    aiModel: {
        type: String,
        enum: ['gpt-4', 'claude-3', 'gemini-pro'],
        default: 'gpt-4'
    },
    responseTime: {
        type: Number, // en ms
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 7776000 // Auto-delete después de 90 días
    }
});

// ========== CREAR MODELOS ==========
export const User = mongoose.model('User', userSchema);
export const Group = mongoose.model('Group', groupSchema);
export const DownloadHistory = mongoose.model('DownloadHistory', downloadHistorySchema);
export const AIInteraction = mongoose.model('AIInteraction', aiInteractionSchema);
