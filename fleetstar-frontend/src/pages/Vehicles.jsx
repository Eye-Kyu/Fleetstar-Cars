import { useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext.jsx";
import VehicleForm from "../components/VehicleForm.jsx";
import EditVehicleForm from "../components/EditVehicleForm.jsx";
import BookVehicleForm from "../components/BookVehicleForm.jsx";

export default function Vehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [bookingVehicle, setBookingVehicle] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [availabilityFilter, setAvailabilityFilter] = useState("all");
    const { user } = useContext(AuthContext);

    const fetchVehicles = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get("/vehicles");
            setVehicles(res.data);
        } catch (err) {
            setError("Failed to fetch vehicles");
        } finally {
            setIsLoading(false);
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

    // Filter and search logic
    const filteredVehicles = vehicles.filter((v) => {
        const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.numberPlate.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === "all" || v.type === typeFilter;

        const matchesAvailability = availabilityFilter === "all" ||
            (availabilityFilter === "available" && v.availabilityStatus) ||
            (availabilityFilter === "unavailable" && !v.availabilityStatus);

        return matchesSearch && matchesType && matchesAvailability;
    });

    // Get unique vehicle types for filter
    const vehicleTypes = [...new Set(vehicles.map(v => v.type))];

    return (
        <div className="p-6 w-screen mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Our Fleet</h1>
                {user && (user.role === "admin" || user.role === "staff") && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Admin View
                    </span>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Filter Section */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                id="search"
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                placeholder="Search by name or plate..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Type Filter */}
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                        <select
                            id="type"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                        >
                            <option value="all">All Types</option>
                            {vehicleTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Availability Filter */}
                    <div>
                        <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                        <select
                            id="availability"
                            value={availabilityFilter}
                            onChange={(e) => setAvailabilityFilter(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                        >
                            <option value="all">All</option>
                            <option value="available">Available Only</option>
                            <option value="unavailable">Unavailable Only</option>
                        </select>
                    </div>
                </div>
            </div>

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
                        fetchVehicles(); // Refresh availability status
                        alert("Booking successful!");
                    }}
                />
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                            <div className="h-40 bg-gray-200 rounded mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-full"></div>
                        </div>
                    ))}
                </div>
            ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No vehicles found</h3>
                    <p className="mt-1 text-gray-500">
                        {searchTerm || typeFilter !== 'all' || availabilityFilter !== 'all'
                            ? "Try adjusting your search or filter criteria"
                            : "There are currently no vehicles in our fleet."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.map((v) => (
                        <div key={v._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                            {v.image && (
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={`http://localhost:5000/${v.image}`}
                                        alt={v.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${v.availabilityStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {v.availabilityStatus ? 'Available' : 'Unavailable'}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-800">{v.name}</h3>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                        {v.type}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-4">{v.numberPlate}</p>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Daily Rate</p>
                                        <p className="font-medium">Ksh{v.dailyRate.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Mileage</p>
                                        <p className="font-medium">{v.mileage || 'N/A'} miles</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Fuel Type</p>
                                        <p className="font-medium">{v.fuelType || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Seats</p>
                                        <p className="font-medium">{v.seats || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex space-x-3">
                                    {/* Customer: Book */}
                                    {user?.role === "customer" && v.availabilityStatus && (
                                        <button
                                            onClick={() => handleBookClick(v)}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                                        >
                                            Book Now
                                        </button>
                                    )}

                                    {/* Admin/Staff: Edit & Delete */}
                                    {(user?.role === "admin" || user?.role === "staff") && (
                                        <>
                                            <button
                                                onClick={() => handleEditClick(v)}
                                                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-md transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(v._id)}
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}