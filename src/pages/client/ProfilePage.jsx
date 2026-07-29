import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { authApi } from "../../api/authApi";

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({
        name: "",
        phoneNumber: "",
        dateOfBirth: "",
        gender: "",
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || "",
                phoneNumber: user.phoneNumber || "",
                dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
                gender: user.gender || "",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await authApi.updateProfile(form);
            updateUser(data.user);
            toast.success(data.message || "Profile updated");
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="mt-1 text-sm text-gray-500">{user.email}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Phone Number
                    </label>
                    <input
                        type="text"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Date of Birth
                    </label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={form.dateOfBirth}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
                    <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                    >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                >
                    {submitting ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
};

export default ProfilePage;
