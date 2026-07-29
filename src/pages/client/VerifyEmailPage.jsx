import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { authApi } from "../../api/authApi";

const VerifyEmailPage = () => {
    const { verifyEmail } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [email, setEmail] = useState(searchParams.get("email") || "");
    const [otp, setOtp] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await verifyEmail({ email, otp });
            toast.success("Email verified! You're logged in.");
            navigate("/", { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || "Verification failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            toast.error("Enter your email first");
            return;
        }
        setResending(true);
        try {
            const { data } = await authApi.resendVerification({ email });
            toast.success(data.message || "OTP resent");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not resend OTP");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Enter the OTP sent to your email address.
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

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">OTP</label>
                    <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm tracking-widest focus:border-gray-900 focus:outline-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                >
                    {submitting ? "Verifying..." : "Verify Email"}
                </button>
            </form>

            <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm font-medium text-gray-900 hover:underline disabled:opacity-50"
            >
                {resending ? "Sending..." : "Resend OTP"}
            </button>
        </div>
    );
};

export default VerifyEmailPage;
