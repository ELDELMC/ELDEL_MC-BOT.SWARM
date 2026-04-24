import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true, // This automatically handles de-duplication at DB level
        index: true
    },
    pushName: {
        type: String,
        default: 'Unknown'
    },
    groupName: {
        type: String,
        default: 'External/Direct'
    },
    groupJid: {
        type: String,
        default: ''
    },
    extractedAt: {
        type: Date,
        default: Date.now
    },
    sourceSession: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'banned'],
        default: 'active'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Create the model
const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
