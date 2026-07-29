// src/components/admin/common/ConfirmDialog.jsx
import { AlertTriangle } from "lucide-react";

const ConfirmDialog = ({
    open,
    title = "Are you sure?",
    message,
    confirmLabel = "Delete",
    danger = true,
    loading = false,
    onConfirm,
    onCancel,
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
            <div className="relative w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
                <div className="flex items-start gap-3">
                    <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            danger ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                        }`}
                    >
                        <AlertTriangle size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                        {message && <p className="mt-1 text-sm text-gray-500">{message}</p>}
                    </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 ${
                            danger ? "bg-red-600 hover:bg-red-700" : "bg-gray-900 hover:bg-gray-700"
                        }`}
                    >
                        {loading ? "Please wait..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
