require('dotenv').config();

const Stripe = require('stripe');

// ✅ Check if key is set
if (!process.env.STRIPE_SECRET_KEY) {
    console.error("❌ STRIPE_SECRET_KEY not set in .env");
    process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

exports.payForBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId).populate('vehicle');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.paymentStatus === 'paid') {
            return res.status(400).json({ message: 'Booking already paid' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Booking: ${booking.vehicle.name}`,
                            description: `Rental from ${booking.pickupDate.toDateString()} to ${booking.returnDate.toDateString()}`
                        },
                        unit_amount: Math.round(booking.totalCost * 100), // cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
        });

        res.json({ url: session.url });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.stripeWebhook = async (req, res) => {
    let event;

    try {
        event = req.body;
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        const bookingId = session.metadata?.bookingId;

        if (bookingId) {
            const booking = await Booking.findById(bookingId);
            if (booking) {
                booking.paymentStatus = 'paid';
                booking.status = 'booked';
                await booking.save();

                await Payment.create({
                    booking: booking._id,
                    amount: booking.totalCost,
                    paymentMethod: 'Stripe',
                    status: 'success',
                    transactionId: session.payment_intent
                });
            }
        }
    }

    res.json({ received: true });
};
