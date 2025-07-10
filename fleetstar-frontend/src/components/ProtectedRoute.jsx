import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";

/**
 * Protects a route by checking if user is logged in.
 * Optionally restricts by allowed roles.
 *
 * @param {JSX.Element} children - The page/component to render
 * @param {string[]} allowedRoles - optional array of roles
 */
export default function ProtectedRoute({ children, allowedRoles }) {
    const { user } = useContext(AuthContext);

    if (!user) {
        // Not logged in → redirect to login
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Logged in but role not allowed → show error or redirect
        return <Navigate to="/" replace />;
    }

    // Logged in and (role OK if specified) → allow
    return children;
}
