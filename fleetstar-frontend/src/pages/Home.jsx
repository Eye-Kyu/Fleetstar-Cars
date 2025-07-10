import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, Link } from "react-router-dom";

export default function Home() {
    const { user } = useContext(AuthContext);

    if (user) {
        if (user.role === "customer") return <Navigate to="/bookings" />;
        if (user.role === "admin" || user.role === "staff") return <Navigate to="/dashboard" />;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-3xl mb-4">Welcome to FleetStar Car Rentals 🚗</h1>
            <p className="mb-4">Please <Link to="/login" className="text-blue-500">Login</Link> or <Link to="/register" className="text-blue-500">Register</Link> to continue.</p>
        </div>
    );
}
