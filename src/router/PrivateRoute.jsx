import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// allowedRoles is optional: e.g. <PrivateRoute allowedRoles={["admin"]} />
// User.role enum (User.js): "user" | "admin" | "executive"
const PrivateRoute = ({ allowedRoles }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <span className="text-sm text-gray-500">Loading...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
