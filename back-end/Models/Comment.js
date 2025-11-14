const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true 
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    complaint: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Complaint', 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.models.Comment || mongoose.model('Comment', commentSchema);