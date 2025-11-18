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
        // --- FIX: ADD 'Assigned' AND 'In Process' HERE ---
        enum: ['Pending', 'Admin Accepted', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
        default: 'Pending'
    },
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        default: null
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // If you are using a Location model, keep this. If not, you can remove it.
    location: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Location' 
    },
    // This is correct for the manual address feature
    address: {
        type: String,
        trim: true, 
    },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number }
    },
    category: {
        type: String,
        // Added 'Other' (capitalized) just in case NLP returns it that way
        enum: ['Hygiene', 'Roads', 'Electricity', 'Water', 'Other', 'Pending Classification'], 
        default: 'Pending Classification'
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    strikes: { type: Number, default: 0 },
    upvoteCount: { type: Number, default: 0 },
    
    // Partner Workflow Fields
    rejectionReason: { type: String }, 
    tentativeDate: { type: Date },     
    assignedWorkers: { type: String }, 
    resolutionImage: { type: String }, 
    partnerFeedback: { type: String }, 
    zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
    required: true, // Mandatory for routing
  },

}, { timestamps: true });

module.exports = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);