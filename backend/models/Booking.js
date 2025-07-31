const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    pickupDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value > Date.now();
            },
            message: 'Pickup date must be in the future'
        }
    },
    returnDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value > this.pickupDate;
            },
            message: 'Return date must be after pickup date'
        }
    },
    pickupLocation: {
        type: String,
        required: true,
        trim: true
    },
    totalCost: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    adminNotes: {
        type: String,
        trim: true,
        maxlength: 500
    },
    cancellationReason: {
        type: String,
        trim: true,
        maxlength: 500
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add duration virtual field
bookingSchema.virtual('durationDays').get(function () {
    return Math.ceil((this.returnDate - this.pickupDate) / (1000 * 60 * 60 * 24));
});

// Prevent approving bookings with failed payments
bookingSchema.pre('save', function (next) {
    if (this.status === 'approved' && this.paymentStatus !== 'paid') {
        throw new Error('Cannot approve booking with unpaid payment');
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);