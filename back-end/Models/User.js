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
        enum: ['user', 'admin', 'superadmin'],
        default: 'user'
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;