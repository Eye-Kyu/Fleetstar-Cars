const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    image: { type: String },  // URL of uploaded image
    dailyRate: { type: Number, required: true },
    description: { type: String },
    availabilityStatus: { type: Boolean, default: true },
    numberPlate: { type: String, unique: true, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
