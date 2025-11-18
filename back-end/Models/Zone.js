const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // e.g., "North Zone", "Ward 12"
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Zone', zoneSchema);