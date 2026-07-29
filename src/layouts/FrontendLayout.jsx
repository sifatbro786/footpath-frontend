import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import Logo from "/logo.png";

const FrontendLayout = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
        navigate("/login");
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <header className="border-b border-gray-200 bg-white">
                <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <Link to="/" className="text-lg font-bold text-gray-900">
                        <img src={Logo} alt="logo" className="w-14 h-full object-cover" />
                    </Link>

                    <div className="flex items-center gap-4 text-sm">
                        {isAuthenticated ? (
                            <>
                                {user?.role === "admin" || user?.role === "executive" && (
                                    <Link to="/admin" className="text-gray-600 hover:text-gray-900">
                                        Admin
                                    </Link>
                                )}
                                <Link to="/profile" className="text-gray-600 hover:text-gray-900">
                                    {user?.name || "Profile"}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="rounded-md bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-700"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-gray-900">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="rounded-md bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-700"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default FrontendLayout;
