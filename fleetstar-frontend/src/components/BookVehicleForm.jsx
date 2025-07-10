import { useState } from "react";
import axios from "../api/axios";

export default function BookVehicleForm({ vehicle, onClose, onSuccess }) {
    const [pickupDate, setPickupDate] = useState("");
    const [returnDate, setReturnDate] = useState("");
    const [pickupLocation, setPickupLocation] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await axios.post("/bookings", {
                vehicleId: vehicle._id,
                pickupDate,
                returnDate,
                pickupLocation,
            });
            onSuccess?.(); // optional callback
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Booking failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded mb-4">
            <h2 className="text-lg mb-2">Book {vehicle.name}</h2>
            {error && <p className="text-red-500">{error}</p>}

            <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                required
                className="block w-full p-1 mb-2"
            />
            <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                required
                className="block w-full p-1 mb-2"
            />
            <input
                placeholder="Pickup Location"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                required
                className="block w-full p-1 mb-2"
            />

            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-1"
                disabled={loading}
            >
                {loading ? "Booking..." : "Confirm Booking"}
            </button>
            <button
                type="button"
                onClick={onClose}
                className="bg-gray-400 text-white px-4 py-1 ml-2"
            >
                Cancel
            </button>
        </form>
    );
}
