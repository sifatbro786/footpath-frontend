import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi";

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [form, setForm] = useState({
        email: searchParams.get("email") || "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setSubmitting(true);
        try {
            const { data } = await authApi.resetPassword({
                email: form.email,
                otp: form.otp,
                newPassword: form.newPassword,
            });
            toast.success(data.message || "Password reset successfully");
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.message || "Reset failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
            <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>

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
                    <label className="mb-1 block text-sm font-medium text-gray-700">OTP</label>
                    <input
                        type="text"
                        name="otp"
                        required
                        value={form.otp}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm tracking-widest focus:border-gray-900 focus:outline-none"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        New Password
                    </label>
                    <input
                        type="password"
                        name="newPassword"
                        required
                        minLength={6}
                        value={form.newPassword}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Confirm New Password
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

                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                >
                    {submitting ? "Resetting..." : "Reset Password"}
                </button>
            </form>
        </div>
    );
};

export default ResetPasswordPage;
