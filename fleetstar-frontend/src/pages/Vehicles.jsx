import { useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext.jsx";
import VehicleForm from "../components/VehicleForm.jsx";
import EditVehicleForm from "../components/EditVehicleForm.jsx";
import BookVehicleForm from "../components/BookVehicleForm.jsx"; // 👈 import booking form

export default function Vehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [error, setError] = useState("");
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [bookingVehicle, setBookingVehicle] = useState(null); // 👈 new: track booking vehicle
    const { user } = useContext(AuthContext);

    const fetchVehicles = async () => {
        try {
            const res = await axios.get("/vehicles");
            setVehicles(res.data);
        } catch (err) {
            setError("Failed to fetch vehicles");
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/vehicles/${id}`);
            fetchVehicles();
        } catch (err) {
            setError("Failed to delete vehicle");
        }
    };

    const handleEditClick = (vehicle) => {
        setEditingVehicle(vehicle);
    };

    const handleEditClose = () => {
        setEditingVehicle(null);
    };

    const handleBookClick = (vehicle) => {
        setBookingVehicle(vehicle);
    };

    const handleBookClose = () => {
        setBookingVehicle(null);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Vehicles</h1>

            {error && <p className="text-red-500">{error}</p>}

            {user && (user.role === "admin" || user.role === "staff") && (
                <>
                    <VehicleForm onSuccess={fetchVehicles} />
                    {editingVehicle && (
                        <EditVehicleForm
                            vehicle={editingVehicle}
                            onClose={handleEditClose}
                            onSuccess={fetchVehicles}
                        />
                    )}
                </>
            )}

            {bookingVehicle && (
                <BookVehicleForm
                    vehicle={bookingVehicle}
                    onClose={handleBookClose}
                    onSuccess={() => {
                        handleBookClose();
                        alert("Booking successful!");
                    }}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map((v) => (
                    <div
                        key={v._id}
                        className="border rounded shadow-md p-4 flex flex-col"
                    >
                        {v.image && (
                            <img
                                src={`http://localhost:5000/${v.image}`}
                                alt={v.name}
                                className="h-40 w-full object-cover mb-2"
                            />
                        )}
                        <h2 className="text-xl">{v.name}</h2>
                        <p>Type: {v.type}</p>
                        <p>Rate: ${v.dailyRate}/day</p>
                        <p>
                            Status:{" "}
                            {v.availabilityStatus ? "Available" : "Not Available"}
                        </p>
                        <p>Plate: {v.numberPlate}</p>

                        <div className="mt-2">
                            {/* Customer: Book */}
                            {user?.role === "customer" && v.availabilityStatus && (
                                <button
                                    onClick={() => handleBookClick(v)}
                                    className="bg-green-500 text-white px-2 py-1 mt-2"
                                >
                                    Book
                                </button>
                            )}

                            {/* Admin/Staff: Edit & Delete */}
                            {(user?.role === "admin" || user?.role === "staff") && (
                                <>
                                    <button
                                        onClick={() => handleEditClick(v)}
                                        className="bg-yellow-400 text-black px-2 py-1 mr-2 mt-2"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(v._id)}
                                        className="bg-red-500 text-white px-2 py-1 mt-2"
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
