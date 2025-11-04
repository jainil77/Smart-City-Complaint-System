const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    image: { 
        type: String 
    },
    status: {
        type: String,
        enum: ['Pending','Admin Accepted', 'In Progress', 'Resolved', 'Rejected'],
        default: 'Pending'
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    location: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Location' 
    },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number }
    },
    category: {
        type: String,
        // Optional: Define specific allowed categories using enum
        enum: ['Hygiene', 'Roads', 'Electricity', 'Water', 'Other', 'Pending Classification'], 
        default: 'Pending Classification'
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    strikes: { type: Number, default: 0 },
    upvoteCount: { type: Number, default: 0 },
}, { timestamps: true });

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;