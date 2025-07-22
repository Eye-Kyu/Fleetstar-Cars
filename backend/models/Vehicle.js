const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vehicle name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    type: {
        type: String,
        required: [true, 'Vehicle type is required'],
        enum: ['Sedan', 'SUV', 'Truck', 'Van', 'Luxury', 'Electric', 'Hatchback', 'Sports'],
        default: 'Sedan'
    },
    image: {
        type: String,
        validate: {
            validator: function (v) {
                // Basic URL validation or path validation
                return !v || /\.(jpg|jpeg|png|webp)$/i.test(v);
            },
            message: props => `${props.value} is not a valid image file!`
        }
    },
    dailyRate: {
        type: Number,
        required: [true, 'Daily rate is required'],
        min: [0, 'Daily rate must be positive']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    availabilityStatus: {
        type: Boolean,
        default: true
    },
    numberPlate: {
        type: String,
        unique: true,
        required: [true, 'License plate is required'],
        uppercase: true,
        trim: true,
        match: [/^[A-Z0-9- ]+$/, 'Please enter a valid license plate']
    },
    mileage: {
        type: Number,
        min: [0, 'Mileage must be positive']
    },
    fuelType: {
        type: String,
        enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', null],
        default: null
    },
    seats: {
        type: Number,
        min: [1, 'Vehicle must have at least 1 seat'],
        max: [20, 'Vehicle cannot have more than 20 seats']
    },
    features: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for image URL
vehicleSchema.virtual('imageUrl').get(function () {
    if (!this.image) return null;
    if (this.image.startsWith('http')) return this.image;
    return `${process.env.BASE_URL}/${this.image.replace(/\\/g, '/')}`;
});

// Indexes for better query performance
vehicleSchema.index({ name: 'text', type: 'text', numberPlate: 'text' });
vehicleSchema.index({ availabilityStatus: 1 });
vehicleSchema.index({ dailyRate: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);