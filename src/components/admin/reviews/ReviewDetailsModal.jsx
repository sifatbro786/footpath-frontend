// src/components/admin/reviews/ReviewDetailsModal.jsx
import { useState } from "react";
import { X, Star, Trash2 } from "lucide-react";
import { statusMeta } from "./reviewConstants";

const fmt = (d) =>
    d
        ? new Date(d).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
          })
        : "—";

const Stars = ({ rating }) => (
    <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
            <Star
                key={n}
                size={16}
                className={n <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}
            />
        ))}
    </span>
);

const ReviewDetailsModal = ({ open, review, onClose, onDecide, onDelete, busy }) => {
    const [rejectMode, setRejectMode] = useState(false);
    const [note, setNote] = useState("");

    if (!open || !review) return null;

    const sMeta = statusMeta(review.status);
    // Bulk demo reviews are seeded against a random, non-existent user id —
    // populate() legitimately returns null for those.
    const userName = review.user?.name || "Demo Customer";
    const userEmail = review.user?.email || "—";

    const close = () => {
        if (busy) return;
        setRejectMode(false);
        setNote("");
        onClose();
    };

    const confirmReject = () => {
        onDecide(review._id, "rejected", note.trim() || "Rejected by admin");
        setRejectMode(false);
        setNote("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={close} />
            <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Review Details</h3>
                        <p className="mt-0.5 text-sm text-gray-500">
                            Complete information about this customer review
                        </p>
                    </div>
                    <button
                        onClick={close}
                        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-5 px-6 py-5">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                            {userName[0]?.toUpperCase() || "?"}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">{userName}</p>
                            <p className="truncate text-sm text-gray-500">{userEmail}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Stars rating={review.rating} />
                        <span className="text-sm text-gray-500">({review.rating}/5)</span>
                        <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sMeta.badge}`}
                        >
                            {sMeta.label}
                        </span>
                    </div>

                    <div>
                        <p className="mb-1 text-sm font-medium text-gray-800">Review Comment</p>
                        <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
                            {review.comment || <span className="text-gray-400">No comment</span>}
                        </p>
                    </div>

                    {review.status === "rejected" && review.adminNotes && (
                        <div>
                            <p className="mb-1 text-sm font-medium text-gray-800">Rejection Note</p>
                            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                                {review.adminNotes}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-800">Product Name</p>
                            <p className="text-sm text-gray-500">{review.product?.name || "—"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800">Product SKU</p>
                            <p className="text-sm text-gray-500">{review.product?.sku || "—"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-800">Submitted Date</p>
                            <p className="text-sm text-gray-500">{fmt(review.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800">Last Updated</p>
                            <p className="text-sm text-gray-500">{fmt(review.updatedAt)}</p>
                        </div>
                    </div>

                    {rejectMode && (
                        <div>
                            <p className="mb-1 text-sm font-medium text-gray-800">
                                Reason for rejection (optional)
                            </p>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={2}
                                placeholder="Shown internally — helps track why this was rejected"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-6 py-4">
                    <button
                        onClick={() => onDelete(review)}
                        disabled={busy}
                        className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>

                    <div className="flex items-center gap-2">
                        {rejectMode ? (
                            <>
                                <button
                                    onClick={() => setRejectMode(false)}
                                    disabled={busy}
                                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmReject}
                                    disabled={busy}
                                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {busy ? "Rejecting…" : "Confirm Reject"}
                                </button>
                            </>
                        ) : (
                            <>
                                {review.status !== "rejected" && (
                                    <button
                                        onClick={() => setRejectMode(true)}
                                        disabled={busy}
                                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                )}
                                {review.status !== "approved" && (
                                    <button
                                        onClick={() => onDecide(review._id, "approved")}
                                        disabled={busy}
                                        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                                    >
                                        {busy ? "Approving…" : "Approve"}
                                    </button>
                                )}
                                <button
                                    onClick={close}
                                    disabled={busy}
                                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Close
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewDetailsModal;
