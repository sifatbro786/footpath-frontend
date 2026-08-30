import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Seo from "../../components/common/Seo";
import { useChangePassword } from "../../hooks/store/useAccount";

/**
 * /account/password
 *
 * Requires the CURRENT password, which is what separates this from the OTP
 * reset flow. Without that check, a borrowed unlocked session could lock the
 * real owner out permanently.
 *
 * The endpoint is rate limited with authLimiter (20 per 15 minutes) because it
 * verifies a password and is therefore an oracle for anyone holding a session.
 */

const field =
    "w-full border border-ink/20 bg-paper px-3.5 py-2.5 text-sm text-ink " +
    "placeholder:text-ink/30 focus:border-ink focus:outline-none";
const label = "block font-label text-[11px] uppercase tracking-[0.18em] text-ink/50";

const MIN_LENGTH = 6; // matches the User schema and the controller

export default function PasswordPage() {
    const changePassword = useChangePassword();
    const [values, setValues] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [clientError, setClientError] = useState(null);

    const set = (patch) => {
        setValues((prev) => ({ ...prev, ...patch }));
        setClientError(null);
    };

    const submit = (e) => {
        e.preventDefault();
        setClientError(null);

        if (values.newPassword.length < MIN_LENGTH) {
            setClientError(`Your new password must be at least ${MIN_LENGTH} characters.`);
            return;
        }
        if (values.newPassword !== values.confirmPassword) {
            setClientError("The two new passwords do not match.");
            return;
        }
        if (values.currentPassword === values.newPassword) {
            setClientError("Your new password must be different from the current one.");
            return;
        }

        changePassword.mutate(
            {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            },
            {
                onSuccess: () => {
                    toast.success("Password changed");
                    setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
                },
            },
        );
    };

    // The server distinguishes a wrong current password (401) from a weak or
    // unchanged new one (400); both come back with a usable message.
    const serverError = changePassword.isError
        ? (changePassword.error?.response?.data?.message ??
          "Could not change your password. Please try again.")
        : null;

    const message = clientError ?? serverError;

    return (
        <>
            <Seo title="Change your password | Elmate Stationery" noIndex />

            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Password</h2>
            <p className="mt-2.5 text-[13px] text-ink-soft">
                You will stay signed in on this device after changing it.
            </p>

            <form onSubmit={submit} className="mt-6 max-w-md space-y-5">
                <div>
                    <label htmlFor="currentPassword" className={label}>
                        Current password
                    </label>
                    <input
                        id="currentPassword"
                        type="password"
                        className={`mt-2 ${field}`}
                        value={values.currentPassword}
                        onChange={(e) => set({ currentPassword: e.target.value })}
                        autoComplete="current-password"
                    />
                </div>

                <div>
                    <label htmlFor="newPassword" className={label}>
                        New password
                    </label>
                    <input
                        id="newPassword"
                        type="password"
                        className={`mt-2 ${field}`}
                        value={values.newPassword}
                        onChange={(e) => set({ newPassword: e.target.value })}
                        autoComplete="new-password"
                    />
                    <p className="mt-1.5 font-label text-[11px] text-ink/40">
                        At least {MIN_LENGTH} characters.
                    </p>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className={label}>
                        Repeat new password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        className={`mt-2 ${field}`}
                        value={values.confirmPassword}
                        onChange={(e) => set({ confirmPassword: e.target.value })}
                        autoComplete="new-password"
                    />
                </div>

                {message && (
                    <p role="alert" className="text-sm text-coral">
                        {message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={
                        changePassword.isPending ||
                        !values.currentPassword ||
                        !values.newPassword ||
                        !values.confirmPassword
                    }
                    className="border border-ink bg-ink px-6 py-3 font-label text-[11px] uppercase
                               tracking-[0.18em] text-paper transition-colors hover:bg-transparent
                               hover:text-ink disabled:cursor-not-allowed disabled:border-ink/12
                               disabled:bg-ink/8 disabled:text-ink/35 disabled:hover:text-ink/35"
                >
                    {changePassword.isPending ? "Changing" : "Change password"}
                </button>
            </form>

            <p className="mt-8 text-[13px] text-ink-soft">
                Forgotten your current password?{" "}
                <Link
                    to="/forgot-password"
                    className="text-ink underline underline-offset-4 hover:text-brand"
                >
                    Reset it by email
                </Link>
                .
            </p>
        </>
    );
}
