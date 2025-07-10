import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Vehicles from "./pages/Vehicles.jsx";
import Bookings from "./pages/Bookings.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";

export default function App() {
  return (
    <Routes>
      {/* Redirect root / to /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Login & Register */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<Home />} />


      {/* Customer-only */}
      <Route
        path="/bookings"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <Bookings />
          </ProtectedRoute>
        }
      />

      {/* Admin/Staff-only */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "staff"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Optional: Vehicles page */}
      <Route path="/vehicles" element={<Vehicles />} />
    </Routes>
  );
}
