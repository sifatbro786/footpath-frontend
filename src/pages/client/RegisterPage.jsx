import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (!form.acceptTerms) {
            toast.error("Please accept the terms and conditions");
            return;
        }

        setSubmitting(true);
        try {
            // register() response: { success, message, userId, email, requiresVerification }
            const data = await register({
                name: form.name,
                email: form.email,
                password: form.password,
                acceptTerms: form.acceptTerms,
            });

            toast.success(data.message || "Registered! Check your email for the OTP.");

            if (data.requiresVerification) {
                navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
            } else {
                // dev-mode auto-verify path (SMTP failure + NODE_ENV=development) —
                // sendTokenResponse already ran server-side, but register() in
                // AuthContext doesn't persist a session for this branch, so send
                // the user to login rather than assuming they're authenticated.
                navigate("/login");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
            <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                    />
                </div>

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
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Password <span className="text-gray-400">(min 6 characters)</span>
                    </label>
                    <input
                        type="password"
                        name="password"
                        required
                        minLength={6}
                        value={form.password}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        name="confirmPassword"
                        required
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                    />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={form.acceptTerms}
                        onChange={handleChange}
                    />
                    I accept the terms and conditions
                </label>

                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                >
                    {submitting ? "Creating account..." : "Register"}
                </button>
            </form>

            <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-gray-900 hover:underline">
                    Login
                </Link>
            </p>
        </div>
    );
};

export default RegisterPage;
