const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
         type: String, required: true 
    },
     anonymousName: { 
        type: String 
    }, 
    email: {
         type: String, required: true, unique: true 
    },
    password: {
         type: String, required: true 
    },
    isBlocked: {
        type: Boolean,
        default: false // Users are not blocked by default
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin', 'partner'],
        default: 'user'
    },
    category: {
        type: String,
        enum: ['Hygiene', 'Roads', 'Electricity', 'Water', 'Other', null], 
        default: null // Will be null for users, admins, and superadmins
    },
    zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
    default: null, // Superadmins might not have a zone, ordinary users might select one later
    },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);