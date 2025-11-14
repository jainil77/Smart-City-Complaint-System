const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: {
         type: String, required: true 
    }, 
    coordinates: {
        lat: { type: Number },
        lng: { type: Number }
    }
}, { timestamps: true });

module.exports = mongoose.models.Location || mongoose.model('Location', locationSchema);