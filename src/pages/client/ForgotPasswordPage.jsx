import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi";

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Backend always returns the same generic message here, whether or
            // not the account exists — do NOT infer account existence from this.
            const { data } = await authApi.forgotPassword({ email });
            toast.success(data.message);
            navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Forgot password</h1>
                <p className="mt-1 text-sm text-gray-500">
                    We&apos;ll email you an OTP to reset your password.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                >
                    {submitting ? "Sending..." : "Send OTP"}
                </button>
            </form>
        </div>
    );
};

export default ForgotPasswordPage;
