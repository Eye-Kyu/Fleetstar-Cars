import { useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState("");
    const { user } = useContext(AuthContext);

    const fetchBookings = async () => {
        try {
            const url =
                user.role === "admin" || user.role === "staff"
                    ? "/bookings"
                    : "/bookings/my";

            const res = await axios.get(url);
            setBookings(res.data);
        } catch (err) {
            setError("Failed to fetch bookings");
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const cancelBooking = async (id) => {
        try {
            await axios.put(`/bookings/${id}/cancel`);
            fetchBookings();
        } catch (err) {
            setError("Failed to cancel booking");
        }
    };

    const completeBooking = async (id) => {
        try {
            await axios.put(`/bookings/${id}/complete`);
            fetchBookings();
        } catch (err) {
            setError("Failed to complete booking");
        }
    };

    return (
        <div className="p-4 w-screen">
            <h1 className="text-2xl mb-4">Bookings</h1>

            {error && <p className="text-red-500">{error}</p>}

            {bookings.length === 0 && <p>No bookings found.</p>}

            <div className="space-y-4">
                {bookings.map((b) => (
                    <div
                        key={b._id}
                        className="border p-4 rounded shadow-md flex flex-col md:flex-row justify-between"
                    >
                        <div>
                            <p>
                                <strong>Vehicle:</strong> {b.vehicle?.name || "N/A"} (
                                {b.vehicle?.numberPlate})
                            </p>
                            <p>
                                <strong>Pickup:</strong>{" "}
                                {new Date(b.pickupDate).toLocaleDateString()}
                            </p>
                            <p>
                                <strong>Return:</strong>{" "}
                                {new Date(b.returnDate).toLocaleDateString()}
                            </p>
                            <p>
                                <strong>Location:</strong> {b.pickupLocation}
                            </p>
                            <p>
                                <strong>Total:</strong> ${b.totalCost}
                            </p>
                            <p>
                                <strong>Status:</strong> {b.status}
                            </p>
                            <p>
                                <strong>Payment:</strong> {b.paymentStatus}
                            </p>
                            {user.role !== "customer" && (
                                <p>
                                    <strong>Customer:</strong>{" "}
                                    {b.customer?.name} ({b.customer?.email})
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 mt-4 md:mt-0">
                            {b.status !== "cancelled" && (
                                <button
                                    onClick={() => cancelBooking(b._id)}
                                    className="bg-red-500 text-white px-2 py-1"
                                >
                                    Cancel
                                </button>
                            )}
                            {user.role !== "customer" && b.status !== "completed" && (
                                <button
                                    onClick={() => completeBooking(b._id)}
                                    className="bg-green-500 text-white px-2 py-1"
                                >
                                    Mark Completed
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
