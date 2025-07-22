import { useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
    const [stats, setStats] = useState({});
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [statsRes, bookingsRes] = await Promise.all([
                    axios.get("/dashboard", {
                        headers: {
                            Authorization: `Bearer ${user.token}`
                        }
                    }),
                    axios.get("/bookings?limit=5", {
                        headers: {
                            Authorization: `Bearer ${user.token}`
                        }
                    })
                ]);
                setStats(statsRes.data);
                setRecentBookings(bookingsRes.data.bookings || []);
            } catch (err) {
                console.error("Dashboard error:", err);
                setError(err.response?.data?.message || "Failed to fetch dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user.token]);

    const StatCard = ({ title, value, change, isCurrency = false }) => {
        const positiveChange = change >= 0;

        return (
            <div className="bg-white w-screen p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
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
                    {isCurrency ? `Ksh ${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value ?? 0}
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
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                <div className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                    <div className="flex items-center">
                        <div className="h-5 w-5 text-red-500 mr-3">!</div>
                        <div>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={stats.totalRevenue || 0}
                    change={stats.revenueChange}
                    isCurrency
                />
                <StatCard
                    title="Total Bookings"
                    value={stats.totalBookings || 0}
                    change={stats.bookingsChange}
                />
                <StatCard
                    title="Active Vehicles"
                    value={stats.activeVehicles || 0}
                    change={stats.vehiclesChange}
                />
                <StatCard
                    title="Customers"
                    value={stats.customers || 0}
                    change={stats.customersChange}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold">Recent Bookings</h2>
                        <a
                            href="/Bookings.jsx"
                            className="text-sm text-blue-600 hover:underline flex items-center"
                        >
                            View All
                        </a>
                    </div>

                    {recentBookings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vehicle
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Dates
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentBookings.map((booking) => (
                                        <tr key={booking._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {booking.customer?.name || 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {booking.vehicle?.name || 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(booking.pickupDate).toLocaleDateString()} - {' '}
                                                {new Date(booking.returnDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                Ksh {(booking.totalCost || 0).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : booking.status === 'cancelled'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
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
                            <a
                                href="/vehicles/new"
                                className="block w-full px-4 py-3 text-left text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Add New Vehicle
                            </a>
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