// src/components/admin/orders/OrderStatusBadge.jsx
// Colors cover all 7 values of Order.js `orderStatus` enum — Processing/Shipped/
// Refunded are real reachable states (paymentController.js sets Processing on
// SSLCommerz success; Shipped/Refunded only settable via admin status update)
// even though they don't appear in the reference screenshots.
const STATUS_STYLES = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-blue-100 text-blue-700",
    Processing: "bg-indigo-100 text-indigo-700",
    Shipped: "bg-purple-100 text-purple-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
    Refunded: "bg-gray-200 text-gray-700",
};

const OrderStatusBadge = ({ status }) => (
    <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            STATUS_STYLES[status] || "bg-gray-100 text-gray-600"
        }`}
    >
        {status}
    </span>
);

export default OrderStatusBadge;
