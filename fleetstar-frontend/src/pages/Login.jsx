import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
    const { user, login } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    if (user) {
        if (user.role === "customer") return <Navigate to="/bookings" />;
        if (user.role === "admin" || user.role === "staff") return <Navigate to="/dashboard" />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 👇 send login request to backend
            const res = await axios.post("http://localhost:5000/api/auth/login", {
                email,
                password,
            });

            if (res.data.token) {
                login(res.data.token); // 👈 pass token to AuthContext
            } else {
                setError("Login failed: no token returned");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Invalid credentials or server error");
        }
    };

    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
                <h2 className="text-xl mb-4">Login</h2>
                {error && <p className="text-red-500">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-2 border mb-2 rounded"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-2 border mb-4 rounded text-blue"
                />
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
                    Login
                </button>
            </form>
        </div>
    );
}
