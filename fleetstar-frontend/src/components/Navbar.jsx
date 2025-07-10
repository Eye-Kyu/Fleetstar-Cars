import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react"; // optional icons, or replace with text

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="bg-blue-600 text-white">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo / Brand */}
                    <Link to="/" className="text-lg font-bold">
                        FleetStar Car Rentals
                    </Link>

                    {/* Hamburger Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="focus:outline-none"
                        >
                            {menuOpen ? <X /> : <Menu />}
                        </button>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        {user && (
                            <>
                                <span className="text-sm">
                                    {user.name} ({user.role})
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 px-2 py-1 rounded text-sm"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden px-4 pb-4">
                    {user && (
                        <div className="flex flex-col gap-2">
                            <span className="text-sm">
                                {user.name} ({user.role})
                            </span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 px-2 py-1 rounded text-sm w-24"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
