import { Send, Trash2, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { orderApi } from "../../../api/orderApi";
import ConfirmDialog from "../common/ConfirmDialog";
import OrderStatusBadge from "./OrderStatusBadge";

const ORDER_STATUSES = [
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Refunded",
];
const PAYMENT_STATUSES = ["Pending", "Paid", "Failed", "Refunded"];

const currency = (n) => `৳${Number(n || 0).toLocaleString("en-US")}`;
const formatDate = (d) =>
    d ? new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "—";

// `order` must be the full admin order object (from orderApi.getOne), not the
// slimmer list-row shape — it needs statusHistory/adminNotes/orderItems etc.
const OrderDetailsModal = ({ open, order, onClose, onUpdated, onDeleted }) => {
    const [statusForm, setStatusForm] = useState({
        status: "",
        note: "",
        trackingNumber: "",
        carrier: "",
    });
    const [paymentStatus, setPaymentStatus] = useState("");
    const [noteText, setNoteText] = useState("");
    const [savingStatus, setSavingStatus] = useState(false);
    const [savingPayment, setSavingPayment] = useState(false);
    const [savingNote, setSavingNote] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    if (!open || !order) return null;

    const handleStatusSubmit = async (e) => {
        e.preventDefault();
        const status = statusForm.status || order.orderStatus;
        setSavingStatus(true);
        try {
            const { data } = await orderApi.updateStatus(order._id, {
                status,
                note: statusForm.note || undefined,
                trackingNumber: statusForm.trackingNumber || undefined,
                carrier: statusForm.carrier || undefined,
            });
            toast.success("Order status updated");
            onUpdated(data.order);
            setStatusForm({ status: "", note: "", trackingNumber: "", carrier: "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Status update failed");
        } finally {
            setSavingStatus(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        const value = paymentStatus || order.paymentStatus;
        setSavingPayment(true);
        try {
            const { data } = await orderApi.updatePaymentStatus(order._id, value);
            toast.success("Payment status updated");
            onUpdated(data.order);
            setPaymentStatus("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Payment status update failed");
        } finally {
            setSavingPayment(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!noteText.trim()) return;
        setSavingNote(true);
        try {
            const { data } = await orderApi.addNote(order._id, noteText.trim());
            toast.success("Note added");
            onUpdated(data.order);
            setNoteText("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add note");
        } finally {
            setSavingNote(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await orderApi.remove(order._id);
            toast.success("Order deleted");
            onDeleted(order._id);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        } finally {
            setDeleting(false);
            setDeleteConfirmOpen(false);
        }
    };

    const itemsTotal = order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            Order #{order.orderNumber}
                        </h3>
                        <p className="text-xs text-gray-500">
                            Placed {formatDate(order.createdAt)}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setDeleteConfirmOpen(true)}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            title="Delete order"
                        >
                            <Trash2 size={18} />
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left: items + customer + shipping */}
                        <div className="flex flex-col gap-5 lg:col-span-2">
                            <div className="flex items-center gap-2">
                                <OrderStatusBadge status={order.orderStatus} />
                                <OrderStatusBadge status={order.paymentStatus} type="payment" />
                                <span className="text-xs text-gray-400">{order.paymentMethod}</span>
                            </div>

                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                                    Order Items
                                </p>
                                <div className="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-200">
                                    {order.orderItems.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-12 w-12 rounded-md object-cover"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-md bg-gray-100" />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900">
                                                    {item.name}
                                                </p>
                                                {item.variant?.options?.length > 0 && (
                                                    <p className="text-xs text-gray-500">
                                                        {item.variant.options
                                                            .map((o) => o.value)
                                                            .join(" / ")}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400">
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {currency(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                                    Customer & Shipping
                                </p>
                                <div className="rounded-lg border border-gray-200 p-3 text-sm">
                                    <p className="font-medium text-gray-900">
                                        {order.shippingAddress?.name}{" "}
                                        {order.isGuest && (
                                            <span className="ml-1 text-xs font-normal text-gray-400">
                                                (Guest)
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-gray-500">{order.shippingAddress?.phone}</p>
                                    <p className="text-gray-500">
                                        {order.shippingAddress?.email ||
                                            order.guestEmail ||
                                            order.user?.email}
                                    </p>
                                    <p className="mt-2 text-gray-600">
                                        {[
                                            order.shippingAddress?.addressLine1,
                                            order.shippingAddress?.addressLine2,
                                            order.shippingAddress?.upazila,
                                            order.shippingAddress?.district,
                                        ]
                                            .filter(Boolean)
                                            .join(", ") || "—"}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {order.shippingAddress?.locationType} ·{" "}
                                        {order.shippingAddress?.deliveryType}
                                        {order.shippingAddress?.courierBranch &&
                                            ` · ${order.shippingAddress.courierBranch}`}
                                    </p>
                                    {order.trackingNumber && (
                                        <p className="mt-2 text-xs text-gray-500">
                                            Tracking:{" "}
                                            <span className="font-medium">
                                                {order.trackingNumber}
                                            </span>{" "}
                                            {order.carrier && `(${order.carrier})`}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                                    Status History
                                </p>
                                <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
                                    {order.statusHistory?.length ? (
                                        [...order.statusHistory].reverse().map((h, i) => (
                                            <div key={i} className="flex items-start gap-2 text-xs">
                                                <OrderStatusBadge status={h.status} />
                                                <div className="flex-1">
                                                    <p className="text-gray-600">{h.note}</p>
                                                    <p className="text-gray-400">
                                                        {formatDate(h.updatedAt)}
                                                        {h.updatedBy?.name &&
                                                            ` · ${h.updatedBy.name}`}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400">No history yet</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                                    Admin Notes
                                </p>
                                <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
                                    {order.adminNotes?.length ? (
                                        order.adminNotes.map((n, i) => (
                                            <div key={i} className="text-xs">
                                                <p className="text-gray-700">{n.note}</p>
                                                <p className="text-gray-400">
                                                    {formatDate(n.addedAt)}
                                                    {n.addedBy?.name && ` · ${n.addedBy.name}`}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400">No notes yet</p>
                                    )}
                                    <form onSubmit={handleAddNote} className="mt-1 flex gap-2">
                                        <input
                                            value={noteText}
                                            onChange={(e) => setNoteText(e.target.value)}
                                            placeholder="Add an internal note..."
                                            className="flex-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:border-gray-900 focus:outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={savingNote || !noteText.trim()}
                                            className="flex items-center gap-1 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                                        >
                                            <Send size={12} />
                                            Add
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Right: pricing + status controls */}
                        <div className="flex flex-col gap-5">
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                                    Price Breakdown
                                </p>
                                <div className="flex flex-col gap-1.5 rounded-lg border border-gray-200 p-3 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Items</span>
                                        <span>{currency(itemsTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span>{currency(order.shippingPrice)}</span>
                                    </div>
                                    {order.taxPrice > 0 && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>Tax</span>
                                            <span>{currency(order.taxPrice)}</span>
                                        </div>
                                    )}
                                    {order.discountAmount > 0 && (
                                        <div className="flex justify-between text-emerald-600">
                                            <span>
                                                Discount{" "}
                                                {order.couponCode && `(${order.couponCode})`}
                                            </span>
                                            <span>-{currency(order.discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="mt-1 flex justify-between border-t border-gray-100 pt-1.5 font-semibold text-gray-900">
                                        <span>Total</span>
                                        <span>{currency(order.totalPrice)}</span>
                                    </div>
                                </div>
                            </div>

                            <form
                                onSubmit={handleStatusSubmit}
                                className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3"
                            >
                                <p className="text-xs font-semibold uppercase text-gray-400">
                                    Update Status
                                </p>
                                <select
                                    value={statusForm.status || order.orderStatus}
                                    onChange={(e) =>
                                        setStatusForm((f) => ({ ...f, status: e.target.value }))
                                    }
                                    className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
                                >
                                    {ORDER_STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                                {(statusForm.status || order.orderStatus) === "Shipped" && (
                                    <>
                                        <input
                                            value={statusForm.trackingNumber}
                                            onChange={(e) =>
                                                setStatusForm((f) => ({
                                                    ...f,
                                                    trackingNumber: e.target.value,
                                                }))
                                            }
                                            placeholder="Tracking number"
                                            className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
                                        />
                                        <input
                                            value={statusForm.carrier}
                                            onChange={(e) =>
                                                setStatusForm((f) => ({
                                                    ...f,
                                                    carrier: e.target.value,
                                                }))
                                            }
                                            placeholder="Carrier"
                                            className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
                                        />
                                    </>
                                )}
                                <input
                                    value={statusForm.note}
                                    onChange={(e) =>
                                        setStatusForm((f) => ({ ...f, note: e.target.value }))
                                    }
                                    placeholder="Note (optional)"
                                    className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={savingStatus}
                                    className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                                >
                                    {savingStatus ? "Saving..." : "Update Status"}
                                </button>
                                {order.orderStatus !== "Cancelled" && (
                                    <p className="text-[11px] text-gray-400">
                                        Changing status to Cancelled restores stock for these items
                                        automatically.
                                    </p>
                                )}
                            </form>

                            <form
                                onSubmit={handlePaymentSubmit}
                                className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3"
                            >
                                <p className="text-xs font-semibold uppercase text-gray-400">
                                    Update Payment Status
                                </p>
                                <select
                                    value={paymentStatus || order.paymentStatus}
                                    onChange={(e) => setPaymentStatus(e.target.value)}
                                    className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
                                >
                                    {PAYMENT_STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="submit"
                                    disabled={savingPayment}
                                    className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                                >
                                    {savingPayment ? "Saving..." : "Update Payment"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={deleteConfirmOpen}
                title="Delete this order?"
                message={`Order #${order.orderNumber} will be permanently deleted. Stock will be restored if it wasn't already cancelled.`}
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirmOpen(false)}
            />
        </div>
    );
};

export default OrderDetailsModal;
