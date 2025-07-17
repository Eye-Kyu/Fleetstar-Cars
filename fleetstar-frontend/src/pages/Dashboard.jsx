import { useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
    const [stats, setStats] = useState({});
    const [error, setError] = useState("");
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get("/dashboard", {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                });
                setStats(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch dashboard data.");
            }
        };

        fetchStats();
    }, [user.token]);

    return (
        <div className="p-4 w-screen">
            <h1 className="text-2xl mb-4">Admin Dashboard</h1>

            {error && <p className="text-red-500">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 shadow rounded">
                    <h2 className="text-lg text-yellow">Total Bookings</h2>
                    <p className="text-2xl">{stats.totalBookings ?? 0}</p>
                </div>
                <div className="bg-white p-4 shadow rounded">
                    <h2 className="text-lg">Total Revenue</h2>
                    <p className="text-2xl">Ksh {stats.totalRevenue?.toFixed(2) ?? 0}</p>
                </div>
                <div className="bg-white p-4 shadow rounded">
                    <h2 className="text-lg">Active Vehicles</h2>
                    <p className="text-2xl">{stats.activeVehicles ?? 0}</p>
                </div>
                <div className="bg-white p-4 shadow rounded">
                    <h2 className="text-lg">Customers</h2>
                    <p className="text-2xl">{stats.customers ?? 0}</p>
                </div>
                <div className="bg-white p-4 shadow rounded">
                    <h2 className="text-lg">Staff</h2>
                    <p className="text-2xl">{stats.staff ?? 0}</p>
                </div>
            </div>
        </div>
    );
}
