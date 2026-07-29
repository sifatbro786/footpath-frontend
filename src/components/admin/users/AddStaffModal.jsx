// src/components/admin/users/AddStaffModal.jsx
import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { adminUsersApi } from "../../../api/adminApi";
import { assignableRoles } from "./userConstants";

const EMPTY = { name: "", email: "", phoneNumber: "", password: "", role: "user" };

const AddStaffModal = ({ open, onClose, onCreated, actingUserRole }) => {
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    if (!open) return null;

    const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const close = () => {
        if (saving) return;
        setForm(EMPTY);
        setError("");
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.name.trim() || !form.email.trim() || !form.password) {
            setError("Full name, email and password are required.");
            return;
        }
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setSaving(true);
        try {
            await adminUsersApi.createUser({
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                phoneNumber: form.phoneNumber.trim() || undefined,
                password: form.password,
                role: form.role,
            });
            toast.success("Staff member created");
            setForm(EMPTY);
            onCreated();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create staff member");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={close} />
            <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            Add New Staff Member
                        </h3>
                        <p className="mt-0.5 text-sm text-gray-500">
                            Create a new account and assign their initial access role.
                        </p>
                    </div>
                    <button
                        onClick={close}
                        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
                    {error && (
                        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-800">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={form.name}
                            onChange={setField("name")}
                            placeholder="John Doe"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-800">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={setField("email")}
                            placeholder="john@example.com"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-800">
                            Phone Number (Optional)
                        </label>
                        <input
                            value={form.phoneNumber}
                            onChange={setField("phoneNumber")}
                            placeholder="01XXXXXXXXX"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-800">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={setField("password")}
                            placeholder="At least 6 characters"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            Account is created pre-verified — the staff member can log in
                            immediately with this password.
                        </p>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-800">Role</label>
                        <select
                            value={form.role}
                            onChange={setField("role")}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                        >
                            {assignableRoles(actingUserRole).map((r) => (
                                <option key={r.value} value={r.value}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={close}
                            disabled={saving}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                        >
                            {saving ? "Creating…" : "Create Staff Member"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStaffModal;
