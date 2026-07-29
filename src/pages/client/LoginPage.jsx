import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = await login(form);
            toast.success("Logged in successfully");

            const redirectTo = location.state?.from?.pathname;
            if (redirectTo) {
                navigate(redirectTo, { replace: true });
            } else {
                navigate(data.user.role === "admin" ? "/admin" : "/", { replace: true });
            }
        } catch (err) {
            const message = err.response?.data?.message || "Login failed";
            toast.error(message);

            // backend returns this exact message when isEmailVerified === false
            if (message.toLowerCase().includes("verify your email")) {
                navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
            <h1 className="text-2xl font-bold text-gray-900">Login</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        name="password"
                        required
                        value={form.password}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                    />
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-gray-600">
                        <input
                            type="checkbox"
                            name="rememberMe"
                            checked={form.rememberMe}
                            onChange={handleChange}
                        />
                        Remember me (30 days)
                    </label>
                    <Link to="/forgot-password" className="text-gray-900 hover:underline">
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                >
                    {submitting ? "Logging in..." : "Login"}
                </button>
            </form>

            <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="font-medium text-gray-900 hover:underline">
                    Register
                </Link>
            </p>
        </div>
    );
};

export default LoginPage;
