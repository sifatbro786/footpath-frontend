import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Seo from "../../components/common/Seo";
import { useAuth } from "../../hooks/useAuth";
import { useUpdateProfile } from "../../hooks/store/useAccount";

/**
 * /account/profile
 *
 * Covers the fields the User schema has always carried but the UI never
 * exposed: dateOfBirth, gender, and the three notification preferences.
 * `preferences` also needed a backend change (Phase 6) because updateProfile's
 * whitelist silently dropped it, so the toggles could be read and never saved.
 *
 * Email is shown but not editable: changing it would invalidate the verified
 * flag and needs the OTP flow, which is a different journey.
 */

const field =
    "w-full border border-ink/20 bg-paper px-3.5 py-2.5 text-sm text-ink " +
    "placeholder:text-ink/30 focus:border-ink focus:outline-none disabled:bg-ink/3 disabled:text-ink/40";
const label = "block font-label text-[11px] uppercase tracking-[0.18em] text-ink/50";

/** ISO timestamp to the yyyy-mm-dd a date input expects. */
const toDateInput = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
};

export default function ProfilePage() {
    const { user } = useAuth();
    const updateProfile = useUpdateProfile();

    const [values, setValues] = useState({
        name: "",
        phoneNumber: "",
        dateOfBirth: "",
        gender: "",
        preferences: {
            newsletter: true,
            smsNotifications: false,
            emailNotifications: true,
        },
    });

    useEffect(() => {
        if (!user) return;
        setValues({
            name: user.name ?? "",
            phoneNumber: user.phoneNumber ?? "",
            dateOfBirth: toDateInput(user.dateOfBirth),
            gender: user.gender ?? "",
            preferences: {
                newsletter: user.preferences?.newsletter ?? true,
                smsNotifications: user.preferences?.smsNotifications ?? false,
                emailNotifications: user.preferences?.emailNotifications ?? true,
            },
        });
    }, [user]);

    const set = (patch) => setValues((prev) => ({ ...prev, ...patch }));
    const setPreference = (key, value) =>
        setValues((prev) => ({ ...prev, preferences: { ...prev.preferences, [key]: value } }));

    const submit = (e) => {
        e.preventDefault();

        if (!values.name.trim()) {
            toast.error("Please enter your name.");
            return;
        }

        updateProfile.mutate(
            {
                name: values.name.trim(),
                phoneNumber: values.phoneNumber.trim(),
                // Empty strings would fail the schema's date cast, so send
                // undefined to leave the field untouched instead.
                dateOfBirth: values.dateOfBirth || undefined,
                gender: values.gender,
                preferences: values.preferences,
            },
            {
                onSuccess: () => toast.success("Profile updated"),
                onError: (error) =>
                    toast.error(
                        error?.response?.data?.message ?? "Could not save your profile.",
                    ),
            },
        );
    };

    const toggles = [
        {
            key: "emailNotifications",
            title: "Order emails",
            blurb: "Confirmations and delivery updates.",
        },
        {
            key: "smsNotifications",
            title: "SMS updates",
            blurb: "A text when your order is on its way.",
        },
        {
            key: "newsletter",
            title: "Newsletter",
            blurb: "New arrivals and offers, now and then.",
        },
    ];

    return (
        <>
            <Seo title="Your profile | Elmate Stationery" noIndex />

            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Profile</h2>

            <form onSubmit={submit} className="mt-6 max-w-xl space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="name" className={label}>
                            Name
                        </label>
                        <input
                            id="name"
                            className={`mt-2 ${field}`}
                            value={values.name}
                            onChange={(e) => set({ name: e.target.value })}
                            autoComplete="name"
                        />
                    </div>

                    <div>
                        <label htmlFor="phoneNumber" className={label}>
                            Phone
                        </label>
                        <input
                            id="phoneNumber"
                            type="tel"
                            className={`mt-2 ${field}`}
                            value={values.phoneNumber}
                            onChange={(e) => set({ phoneNumber: e.target.value })}
                            placeholder="01XXXXXXXXX"
                            autoComplete="tel"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="email" className={label}>
                        Email
                    </label>
                    <input id="email" className={`mt-2 ${field}`} value={user?.email ?? ""} disabled />
                    <p className="mt-1.5 font-label text-[11px] text-ink/40">
                        {user?.isEmailVerified
                            ? "Verified. Contact us if you need to change it."
                            : "Not verified yet."}
                    </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="dateOfBirth" className={label}>
                            Date of birth
                        </label>
                        <input
                            id="dateOfBirth"
                            type="date"
                            className={`mt-2 ${field}`}
                            value={values.dateOfBirth}
                            onChange={(e) => set({ dateOfBirth: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="gender" className={label}>
                            Gender
                        </label>
                        <select
                            id="gender"
                            className={`mt-2 ${field}`}
                            value={values.gender}
                            onChange={(e) => set({ gender: e.target.value })}
                        >
                            <option value="">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                <fieldset className="border-t border-line pt-6">
                    <legend className={label}>What we send you</legend>
                    <div className="mt-3.5 space-y-3">
                        {toggles.map((toggle) => (
                            <label
                                key={toggle.key}
                                className="flex cursor-pointer items-start gap-3"
                            >
                                <input
                                    type="checkbox"
                                    checked={values.preferences[toggle.key]}
                                    onChange={(e) => setPreference(toggle.key, e.target.checked)}
                                    className="mt-1 h-3.5 w-3.5 shrink-0 appearance-none border
                                               border-ink/30 bg-paper checked:border-ink checked:bg-ink"
                                />
                                <span>
                                    <span className="block text-sm text-ink">{toggle.title}</span>
                                    <span className="block text-[13px] text-ink-soft">
                                        {toggle.blurb}
                                    </span>
                                </span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                <button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="border border-ink bg-ink px-6 py-3 font-label text-[11px] uppercase
                               tracking-[0.18em] text-paper transition-colors hover:bg-transparent
                               hover:text-ink disabled:opacity-50"
                >
                    {updateProfile.isPending ? "Saving" : "Save changes"}
                </button>
            </form>
        </>
    );
}
