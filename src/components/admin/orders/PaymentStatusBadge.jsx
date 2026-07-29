// src/components/admin/orders/PaymentStatusBadge.jsx
// Order.js `paymentStatus` enum: Pending | Paid | Failed | Refunded — exactly 4 values.
// paymentController.js used to assign a "Partially Paid" value that wasn't in this
// enum (threw ValidationError on save for every COD order with a remaining balance).
// Fixed backend-side: paymentStatus now stays "Pending" until the full total is
// collected; the advance amount is tracked separately via order.codOnlinePaymentAmount
// / order.remainingAmount (shown in the Summary card), not via paymentStatus.
const PAYMENT_STYLES = {
    Pending: "bg-yellow-100 text-yellow-700",
    Paid: "bg-green-100 text-green-700",
    Failed: "bg-red-100 text-red-700",
    Refunded: "bg-gray-200 text-gray-700",
};

const PaymentStatusBadge = ({ status }) => (
    <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            PAYMENT_STYLES[status] || "bg-gray-100 text-gray-600"
        }`}
    >
        {status}
    </span>
);

export default PaymentStatusBadge;
