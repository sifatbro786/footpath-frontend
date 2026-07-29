// src/pages/admin/orders/OrderDetail.jsx
// Route (add to AppRoute.jsx): <Route path="orders/:id" element={<OrderDetail />} />
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { orderApi } from "../../../api/orderApi";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";
import OrderStatusBadge from "../../../components/admin/orders/OrderStatusBadge";
import PaymentStatusBadge from "../../../components/admin/orders/PaymentStatusBadge";

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

// Quick actions map straight to updateOrderStatus — no separate backend endpoint per action
const QUICK_ACTIONS = [
    { label: "Confirm", status: "Confirmed", cls: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
    { label: "Ship", status: "Shipped", cls: "bg-purple-50 text-purple-600 hover:bg-purple-100" },
    { label: "Deliver", status: "Delivered", cls: "bg-green-50 text-green-600 hover:bg-green-100" },
    { label: "Cancel", status: "Cancelled", cls: "bg-red-50 text-red-600 hover:bg-red-100" },
];

const formatBDT = (n) =>
    `\u09F3${Number(n || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
const formatDT = (d) =>
    d ? new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "N/A";

const Card = ({ title, children, right }) => (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            {right}
        </div>
        {children}
    </section>
);

const Row = ({ label, children }) => (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2 text-sm last:border-0">
        <span className="text-gray-500">{label}</span>
        <span className="text-right font-medium text-gray-900">{children}</span>
    </div>
);

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Fulfillment & Status form state
    const [trackingNumber, setTrackingNumber] = useState("");
    const [carrier, setCarrier] = useState("");
    const [statusInput, setStatusInput] = useState("");
    const [paymentStatusInput, setPaymentStatusInput] = useState("");
    const [note, setNote] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await orderApi.getOne(id);
            const o = data.order;
            setOrder(o);
            setTrackingNumber(o.trackingNumber || "");
            setCarrier(o.carrier || "");
            setStatusInput(o.orderStatus);
            setPaymentStatusInput(o.paymentStatus);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load order");
            navigate("/admin/orders");
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        load();
    }, [load]);

    // updateOrderStatus handles status + trackingNumber + carrier + note together
    const handleSaveStatus = async (overrideStatus) => {
        setSaving(true);
        try {
            const payload = {
                status: overrideStatus || statusInput,
                trackingNumber,
                carrier,
                note: note.trim() || undefined,
            };
            const { data } = await orderApi.updateStatus(id, payload);
            setOrder(data.order);
            setStatusInput(data.order.orderStatus);
            setNote("");
            toast.success("Order status updated");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update status");
        } finally {
            setSaving(false);
        }
    };

    // Separate endpoint — payment status is independent of order status in the backend
    const handleSavePayment = async () => {
        if (paymentStatusInput === order.paymentStatus) return;
        setSaving(true);
        try {
            const { data } = await orderApi.updatePaymentStatus(id, paymentStatusInput);
            setOrder(data.order);
            toast.success("Payment status updated");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update payment status");
        } finally {
            setSaving(false);
        }
    };

    const handleAddNoteOnly = async () => {
        if (!note.trim()) return;
        setSaving(true);
        try {
            const { data } = await orderApi.addNote(id, note.trim());
            setOrder(data.order);
            setNote("");
            toast.success("Note added");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add note");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await orderApi.remove(id);
            toast.success("Order deleted");
            navigate("/admin/orders");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete order");
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 text-gray-400">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-500" />
            </div>
        );
    }
    if (!order) return null;

    const itemsSubtotal = order.orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const isCOD = order.paymentMethod === "COD";

    // statusHistory + adminNotes are separate arrays in the schema — merge for one timeline
    const timeline = [
        ...order.statusHistory.map((h) => ({
            type: "status",
            at: h.updatedAt,
            title: h.status,
            note: h.note,
            by: h.updatedBy?.name,
        })),
        ...order.adminNotes.map((n) => ({
            type: "note",
            at: n.addedAt,
            title: "Admin Note",
            note: n.note,
            by: n.addedBy?.name,
        })),
    ].sort((a, b) => new Date(b.at) - new Date(a.at));

    return (
        <div className="space-y-5 pb-10">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/admin/orders")}
                        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-900">
                                Order #{order.orderNumber}
                            </h1>
                            <OrderStatusBadge status={order.orderStatus} />
                        </div>
                        <p className="text-sm text-gray-500">
                            Placed on {formatDT(order.createdAt)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={load}
                        className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                {/* Left column */}
                <div className="space-y-5 lg:col-span-2">
                    <Card title={`Order Items (${order.orderItems.length})`}>
                        <div className="space-y-3">
                            {order.orderItems.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                                >
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-14 w-14 rounded-md object-cover"
                                        />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-gray-900">
                                            {item.name}
                                        </p>
                                        {item.variant?.displayName && (
                                            <p className="text-xs text-gray-400">
                                                {item.variant.displayName}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400">
                                            {formatBDT(item.price)} × {item.quantity}
                                        </p>
                                    </div>
                                    <p className="shrink-0 text-sm font-semibold text-gray-900">
                                        {formatBDT(item.price * item.quantity)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="Fulfillment & Status">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">
                                    Tracking Number
                                </label>
                                <input
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="e.g., AB123456789BD"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">
                                    Shipping Carrier
                                </label>
                                <input
                                    value={carrier}
                                    onChange={(e) => setCarrier(e.target.value)}
                                    placeholder="e.g., RedX / Sundarban"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">
                                    Update Order Status
                                </label>
                                <select
                                    value={statusInput}
                                    onChange={(e) => setStatusInput(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                                >
                                    {ORDER_STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">
                                    Update Payment Status
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={paymentStatusInput}
                                        onChange={(e) => setPaymentStatusInput(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                                    >
                                        {PAYMENT_STATUSES.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleSavePayment}
                                        disabled={
                                            saving || paymentStatusInput === order.paymentStatus
                                        }
                                        className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="mb-1 block text-xs font-medium text-gray-500">
                                Add Note (optional)
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={2}
                                placeholder="Add a note about this status update…"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                            />
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                onClick={() => handleSaveStatus()}
                                disabled={saving}
                                className="flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                                <Save size={14} />
                                Save Changes
                            </button>
                            {note.trim() && (
                                <button
                                    onClick={handleAddNoteOnly}
                                    disabled={saving}
                                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Add Note Only
                                </button>
                            )}
                        </div>

                        <div className="mt-5 border-t border-gray-100 pt-4">
                            <p className="mb-2 text-xs font-medium text-gray-500">Quick Actions</p>
                            <div className="flex flex-wrap gap-2">
                                {QUICK_ACTIONS.map((a) => (
                                    <button
                                        key={a.status}
                                        onClick={() => handleSaveStatus(a.status)}
                                        disabled={saving || order.orderStatus === a.status}
                                        className={`rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-40 ${a.cls}`}
                                    >
                                        {a.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <Card title="Order History & Notes">
                        <div className="space-y-3">
                            {timeline.map((t, i) => (
                                <div key={i} className="rounded-md border border-gray-100 p-3">
                                    <p className="text-xs text-gray-400">{formatDT(t.at)}</p>
                                    <p className="text-sm font-medium text-gray-900">{t.title}</p>
                                    {t.note && <p className="text-sm text-gray-600">{t.note}</p>}
                                    {t.by && (
                                        <p className="text-xs text-gray-400">Updated by: {t.by}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right column */}
                <div className="space-y-5">
                    <Card title="Summary">
                        <Row label="Items Subtotal">{formatBDT(itemsSubtotal)}</Row>
                        <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`}>
                            -{formatBDT(order.discountAmount)}
                        </Row>
                        <Row label="Shipping">{formatBDT(order.shippingPrice)}</Row>
                        <Row label="Tax">{formatBDT(order.taxPrice)}</Row>
                        {isCOD && order.codOnlinePaymentAmount > 0 && (
                            <>
                                <Row label="Paid Online (COD charge)">
                                    {formatBDT(order.codOnlinePaymentAmount)}
                                </Row>
                                <Row label="Due on Delivery">
                                    {formatBDT(order.remainingAmount)}
                                </Row>
                            </>
                        )}
                        <div className="mt-2 flex justify-between border-t border-gray-200 pt-2">
                            <span className="font-semibold text-gray-900">Total</span>
                            <span className="font-bold text-gray-900">
                                {formatBDT(order.totalPrice)}
                            </span>
                        </div>
                    </Card>

                    <Card title="Payment">
                        <Row label="Status">
                            <PaymentStatusBadge status={order.paymentStatus} />
                        </Row>
                        <Row label="Method">{order.paymentMethod}</Row>
                        <Row label="Paid At">{formatDT(order.paidAt)}</Row>
                    </Card>

                    <Card title="Customer & Shipping">
                        <p className="mb-1 text-xs font-medium text-gray-500">Customer</p>
                        <p className="text-sm font-medium text-gray-900">
                            {order.shippingAddress?.name}{" "}
                            {order.isGuest ? "(Guest)" : "(Registered)"}
                        </p>
                        {order.user?.email && (
                            <p className="text-sm text-blue-600">{order.user.email}</p>
                        )}
                        {order.isGuest && order.guestEmail && (
                            <p className="text-sm text-gray-500">{order.guestEmail}</p>
                        )}
                        <p className="text-sm text-gray-500">{order.shippingAddress?.phone}</p>

                        <p className="mb-1 mt-4 text-xs font-medium text-gray-500">
                            Shipping Address
                        </p>
                        <p className="text-sm text-gray-700">
                            {order.shippingAddress?.addressLine1}
                        </p>
                        {order.shippingAddress?.addressLine2 && (
                            <p className="text-sm text-gray-700">
                                {order.shippingAddress.addressLine2}
                            </p>
                        )}
                        <p className="text-sm text-gray-700">
                            {order.shippingAddress?.upazila}, {order.shippingAddress?.district}
                        </p>
                        <p className="text-sm text-gray-700">
                            {order.shippingAddress?.zipCode} {order.shippingAddress?.country}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                            {order.shippingAddress?.locationType?.replace("_", " ")} ·{" "}
                            {order.shippingAddress?.deliveryType}
                            {order.shippingAddress?.courierBranch &&
                                ` · ${order.shippingAddress.courierBranch}`}
                        </p>
                    </Card>

                    <Card title="Tracking Details">
                        <Row label="Tracking Number">{order.trackingNumber || "N/A"}</Row>
                        <Row label="Carrier">{order.carrier || "N/A"}</Row>
                    </Card>
                </div>
            </div>

            <ConfirmDialog
                open={confirmDelete}
                title="Delete this order?"
                message="This restores stock for any active order items and permanently removes the order. This cannot be undone."
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete(false)}
            />
        </div>
    );
};

export default OrderDetail;
