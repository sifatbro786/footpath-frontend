// src/components/admin/category/ConfirmDialog.jsx
// Lightweight confirm for destructive actions (delete). This is NOT the category
// form — the form is a full page. Swap for your shared ConfirmDialog if you have one.
import { AlertTriangle } from "lucide-react";

const ConfirmDialog = ({
    open,
    title = "Are you sure?",
    message,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    loading = false,
    onConfirm,
    onCancel,
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={loading ? undefined : onCancel}
            />
            <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle size={20} className="text-red-600" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                        {message && <p className="mt-1 text-sm text-gray-500">{message}</p>}
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        {loading ? "Deleting…" : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
