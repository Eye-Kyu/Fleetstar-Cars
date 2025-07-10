const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true }, // e.g., Stripe, M-Pesa
    paymentDate: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'pending'
    },
    transactionId: { type: String } // from payment gateway
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
