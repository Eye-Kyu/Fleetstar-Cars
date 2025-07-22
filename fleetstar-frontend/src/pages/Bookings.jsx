import { useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useContext(AuthContext);

    // Filter and sort states
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('pickupDate');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const url =
                user.role === "admin" || user.role === "staff"
                    ? "/bookings"
                    : "/bookings/my";

            const res = await axios.get(url);
            setBookings(res.data);
        } catch (err) {
            setError("Failed to fetch bookings");
        } finally {
            setIsLoading(false);
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

    // Filter bookings based on status
    const filteredBookings = statusFilter === 'all'
        ? bookings
        : bookings.filter(b => b.status === statusFilter);

    // Sort bookings
    const sortedBookings = [...filteredBookings].sort((a, b) => {
        if (sortBy === 'pickupDate') {
            return new Date(a.pickupDate) - new Date(b.pickupDate);
        } else if (sortBy === 'returnDate') {
            return new Date(a.returnDate) - new Date(b.returnDate);
        } else if (sortBy === 'price') {
            return a.totalCost - b.totalCost;
        }
        return 0;
    });

    // Filter by search term
    const searchedBookings = sortedBookings.filter(b =>
        b.vehicle?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.vehicle?.numberPlate.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-full mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
                {user.role === "admin" || user.role === "staff" ? (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Admin View
                    </span>
                ) : null}
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
                                placeholder="Car name or plate..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1 rounded-md text-sm ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setStatusFilter('confirmed')}
                                className={`px-3 py-1 rounded-md text-sm ${statusFilter === 'confirmed' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            >
                                Confirmed
                            </button>
                            <button
                                onClick={() => setStatusFilter('in-progress')}
                                className={`px-3 py-1 rounded-md text-sm ${statusFilter === 'in-progress' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setStatusFilter('completed')}
                                className={`px-3 py-1 rounded-md text-sm ${statusFilter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            >
                                Completed
                            </button>
                        </div>
                    </div>

                    {/* Sort */}
                    <div>
                        <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                        <select
                            id="sort"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                        >
                            <option value="pickupDate">Pickup Date</option>
                            <option value="returnDate">Return Date</option>
                            <option value="price">Price</option>
                        </select>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="border p-6 rounded-lg shadow-sm animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                                <div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : searchedBookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No bookings found</h3>
                    <p className="mt-1 text-gray-500">
                        {searchTerm || statusFilter !== 'all'
                            ? "Try adjusting your search or filter criteria"
                            : "You don't have any bookings yet."}
                    </p>
                    <div className="mt-6">
                        <a
                            href="/Vehicles"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Browse Available Cars
                        </a>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchedBookings.map((b) => (
                        <div key={b._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-800">{b.vehicle?.name || "N/A"}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${b.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        b.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                        {b.status.toUpperCase()}
                                    </span>
                                </div>

                                {b.vehicle?.image && (
                                    <div className="mb-4">
                                        <img
                                            src={b.vehicle.image}
                                            alt={b.vehicle.name}
                                            className="w-full h-40 object-cover rounded"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Pickup Date</p>
                                        <p className="font-medium">{new Date(b.pickupDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Return Date</p>
                                        <p className="font-medium">{new Date(b.returnDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p className="font-medium">{b.pickupLocation}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Cost</p>
                                        <p className="font-medium">${b.totalCost.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Booking Progress</h4>
                                    <div className="flex items-center">
                                        {['confirmed', 'in-progress', 'completed'].map((stage, index) => (
                                            <div key={stage} className="flex items-center">
                                                <div className={`rounded-full h-6 w-6 flex items-center justify-center ${(b.status === 'completed' && index <= 2) ||
                                                    (b.status === 'in-progress' && index <= 1) ||
                                                    (b.status === 'confirmed' && index === 0)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                                {index < 2 && (
                                                    <div className={`h-1 w-12 ${(b.status === 'completed' && index < 2) ||
                                                        (b.status === 'in-progress' && index < 1)
                                                        ? 'bg-blue-600'
                                                        : 'bg-gray-200'
                                                        }`}></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                                        <span>Confirmed</span>
                                        <span>In Progress</span>
                                        <span>Completed</span>
                                    </div>
                                </div>

                                {user.role !== "customer" && b.customer && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Customer Details</h4>
                                        <p className="text-sm"><span className="font-medium">Name:</span> {b.customer.name}</p>
                                        <p className="text-sm"><span className="font-medium">Email:</span> {b.customer.email}</p>
                                        {b.customer.phone && (
                                            <p className="text-sm"><span className="font-medium">Phone:</span> {b.customer.phone}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                                {b.status !== "cancelled" && b.status !== "completed" && (
                                    <button
                                        onClick={() => cancelBooking(b._id)}
                                        className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors"
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                                {(user.role === "admin" || user.role === "staff") && b.status !== "completed" && (
                                    <button
                                        onClick={() => completeBooking(b._id)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Complete Booking
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}