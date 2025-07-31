import { useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import VehicleForm from "../components/VehicleForm";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Dashboard() {
    const [stats, setStats] = useState({});
    const [recentBookings, setRecentBookings] = useState([]);
    const [pendingBookings, setPendingBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { user } = useContext(AuthContext);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [showCarsModal, setShowCarsModal] = useState(false);
    const [availableCars, setAvailableCars] = useState([]);
    const [carsLoading, setCarsLoading] = useState(false);

    // Status color mapping
    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-blue-100 text-blue-800',
            rejected: 'bg-red-100 text-red-800',
            active: 'bg-purple-100 text-purple-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, bookingsRes, pendingRes] = await Promise.all([
                axios.get("/dashboard", {
                    headers: { Authorization: `Bearer ${user.token}` }
                }),
                axios.get(
                    user.role === "admin" || user.role === "staff"
                        ? "/bookings?limit=5&sort=-createdAt"
                        : "/bookings/my?limit=5",
                    {
                        headers: { Authorization: `Bearer ${user.token}` }
                    }
                ),
                (user.role === "admin" || user.role === "staff") 
                    ? axios.get("/bookings?status=pending&limit=5", {
                        headers: { Authorization: `Bearer ${user.token}` }
                      })
                    : Promise.resolve({ data: [] })
            ]);

            setStats(statsRes.data);
            setRecentBookings(bookingsRes.data.bookings || bookingsRes.data || []);
            setPendingBookings(pendingRes.data.bookings || pendingRes.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user.token, user.role]);

    const fetchAvailableCars = async () => {
        try {
            setCarsLoading(true);
            const res = await axios.get("/vehicles?availability=available", {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setAvailableCars(res.data);
        } catch (err) {
            setError("Failed to load available cars");
        } finally {
            setCarsLoading(false);
        }
    };

    const handleVehicleAdded = () => {
        setShowVehicleModal(false);
        fetchDashboardData();
    };

    // Update booking status
    const updateBookingStatus = async (id, newStatus) => {
        try {
            await axios.put(`/bookings/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            // Optimistic UI updates
            setRecentBookings(prev => prev.map(booking =>
                booking._id === id ? { ...booking, status: newStatus } : booking
            ));
            setPendingBookings(prev => prev.filter(booking => booking._id !== id));
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${newStatus} booking`);
            fetchDashboardData();
        }
    };

    const approveBooking = (id) => {
        if (window.confirm('Are you sure you want to approve this booking?')) {
            updateBookingStatus(id, 'approved');
        }
    };

    const declineBooking = (id) => {
        if (window.confirm('Are you sure you want to decline this booking?')) {
            updateBookingStatus(id, 'rejected');
        }
    };

    const viewBookingDetails = (bookingId) => {
        window.location.href = `/bookings/${bookingId}`;
    };

    const StatCard = ({ title, value, change, isCurrency = false }) => {
        const positiveChange = change >= 0;
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-lg ${positiveChange ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {positiveChange ? '↑' : '↓'}
                    </div>
                    {change !== undefined && (
                        <span className={`text-sm ${positiveChange ? 'text-green-600' : 'text-red-600'}`}>
                            {positiveChange ? '+' : ''}{change}%
                        </span>
                    )}
                </div>
                <h3 className="text-gray-500 text-sm mt-4">{title}</h3>
                <p className="text-2xl font-semibold mt-1">
                    {isCurrency ? `Ksh ${(value || 0).toLocaleString()}` : value ?? 0}
                </p>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-6 w-screen mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
                            <div className="h-10 w-10 bg-gray-200 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Vehicle Modal */}
            {showVehicleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Add New Vehicle</h2>
                            <button onClick={() => setShowVehicleModal(false)} className="text-gray-500 hover:text-gray-700">
                                ✕
                            </button>
                        </div>
                        <VehicleForm onSuccess={handleVehicleAdded} />
                    </div>
                </div>
            )}

            {/* Available Cars Modal */}
            {showCarsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Available Vehicles</h2>
                            <button onClick={() => setShowCarsModal(false)} className="text-gray-500 hover:text-gray-700">
                                ✕
                            </button>
                        </div>
                        {carsLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                                        <div className="h-40 bg-gray-200 rounded mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                                    </div>
                                ))}
                            </div>
                        ) : availableCars.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <div className="mx-auto h-12 w-12 text-gray-400">🚗</div>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No available cars</h3>
                                <p className="mt-1 text-sm text-gray-500">Check back later for new arrivals</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {availableCars.map((car) => (
                                    <div key={car._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                        {car.image ? (
                                            <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                                                <img
                                                    src={car.image.startsWith('http') ? car.image : `${API_BASE_URL}/${car.image.replace(/\\/g, '/')}`}
                                                    alt={car.name}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/default-car.png';
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-48 bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-500">No Image Available</span>
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-lg font-medium text-gray-900">{car.name}</h3>
                                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                    Available
                                                </span>
                                            </div>
                                            <p className="text-gray-500 text-sm mt-1">{car.numberPlate}</p>
                                            <div className="mt-4 grid grid-cols-2 gap-2">
                                                <div>
                                                    <p className="text-xs text-gray-500">Type</p>
                                                    <p className="text-sm font-medium">{car.type}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Daily Rate</p>
                                                    <p className="text-sm font-medium">Ksh {car.dailyRate?.toFixed(2) || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Mileage</p>
                                                    <p className="text-sm font-medium">{car.mileage || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Fuel Type</p>
                                                    <p className="text-sm font-medium">{car.fuelType || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                <div className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('en-US', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                    <div className="flex items-center">
                        <div className="text-red-500 mr-3">!</div>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Revenue" value={stats.totalRevenue} change={stats.revenueChange} isCurrency />
                <StatCard title="Total Bookings" value={stats.totalBookings} change={stats.bookingsChange} />
                <StatCard title="Active Vehicles" value={stats.activeVehicles} change={stats.vehiclesChange} />
                <StatCard title="Customers" value={stats.customers} change={stats.customersChange} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold">Recent Bookings</h2>
                        <a href="/bookings" className="text-sm text-blue-600 hover:underline flex items-center">
                            View All
                        </a>
                    </div>

                    {recentBookings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentBookings.map((booking) => {
                                        const pickupDate = new Date(booking.pickupDate);
                                        const returnDate = new Date(booking.returnDate);
                                        const days = Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24));

                                        return (
                                            <tr 
                                                key={booking._id} 
                                                className="hover:bg-gray-50 cursor-pointer"
                                                onClick={() => viewBookingDetails(booking._id)}
                                            >
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <span className="text-blue-600 font-medium">
                                                                {booking.customer?.name?.charAt(0) || '?'}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {booking.customer?.name || 'N/A'}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {booking.customer?.email || ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 font-medium">
                                                        {booking.vehicle?.name || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {booking.vehicle?.numberPlate || ''}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {pickupDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        {' - '}
                                                        {returnDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {days} {days === 1 ? 'day' : 'days'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    Ksh {(booking.totalCost || 0).toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <div className="mx-auto h-12 w-12 text-gray-400">📅</div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No recent bookings</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new booking</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => setShowVehicleModal(true)}
                                className="block w-full px-4 py-3 text-left text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Add New Vehicle
                            </button>
                            <button
                                onClick={() => {
                                    setShowCarsModal(true);
                                    fetchAvailableCars();
                                }}
                                className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-between"
                                disabled={carsLoading}
                            >
                                View Available Cars
                                {carsLoading && (
                                    <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                            </button>
                            <a
                                href="/bookings/new"
                                className="block w-full px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Create Booking
                            </a>
                            <a
                                href="/users"
                                className="block w-full px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Manage Users
                            </a>
                            <a
                                href="/reports"
                                className="block w-full px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Generate Reports
                            </a>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4">System Status</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
                                <span className="text-gray-500">Database</span>
                                <span className="text-green-600 font-medium">Online</span>
                            </div>
                            <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
                                <span className="text-gray-500">API</span>
                                <span className="text-green-600 font-medium">Stable</span>
                            </div>
                            <div className="flex justify-between items-center text-sm py-2">
                                <span className="text-gray-500">Storage</span>
                                <span className="text-blue-600 font-medium">
                                    {stats.storageUsage || '0%'} used
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Bookings Section (Admin Only) */}
            {(user.role === "admin" || user.role === "staff") && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold">
                            Pending Approvals
                            {pendingBookings.length > 0 && (
                                <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    {pendingBookings.length}
                                </span>
                            )}
                        </h2>
                        <a 
                            href="/bookings?status=pending" 
                            className="text-sm text-blue-600 hover:underline flex items-center"
                        >
                            View All Pending
                        </a>
                    </div>

                    {pendingBookings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pendingBookings.map((booking) => {
                                        const pickupDate = new Date(booking.pickupDate);
                                        const returnDate = new Date(booking.returnDate);
                                        const days = Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24));

                                        return (
                                            <tr key={booking._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <span className="text-blue-600 font-medium">
                                                                {booking.customer?.name?.charAt(0) || '?'}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {booking.customer?.name || 'N/A'}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {booking.customer?.email || ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 font-medium">
                                                        {booking.vehicle?.name || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {booking.vehicle?.numberPlate || ''}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {pickupDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        {' - '}
                                                        {returnDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {days} {days === 1 ? 'day' : 'days'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    Ksh {(booking.totalCost || 0).toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => approveBooking(booking._id)}
                                                            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => declineBooking(booking._id)}
                                                            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <div className="mx-auto h-12 w-12 text-gray-400">⏳</div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending bookings</h3>
                            <p className="mt-1 text-sm text-gray-500">All bookings are processed</p>
                        </div>
                    )}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">Monthly Revenue</h2>
                    <select className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white">
                        <option>Last 6 Months</option>
                        <option>This Year</option>
                        <option>Last Year</option>
                    </select>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                    [Revenue Chart Placeholder]
                </div>
            </div>
        </div>
    );
}