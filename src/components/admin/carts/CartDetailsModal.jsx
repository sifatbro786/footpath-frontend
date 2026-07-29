// src/pages/admin/carts/CartDetailsModal.jsx
import { X, Mail, Package } from "lucide-react";

const formatBDT = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;

/**
 * Read-only. There is no GET /carts/:id endpoint, so this renders entirely
 * from the row object already loaded by getAllCarts (which populates
 * items.product with name/price/imageGroups/stockStatus).
 */
const CartDetailsModal = ({ cart, open, onClose, onCreateForUser }) => {
    if (!open || !cart) return null;

    const items = cart.items || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {cart.user?.name || "Unknown user"}
                        </h3>
                        <p className="text-sm text-gray-400">{cart.user?.email || "—"}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-3 border-b border-gray-100 px-5 py-4 text-center">
                    <div>
                        <p className="text-xs text-gray-400">Items</p>
                        <p className="font-semibold text-gray-900">{items.length}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Total Value</p>
                        <p className="font-semibold text-gray-900">{formatBDT(cart.totalPrice)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Status</p>
                        <p
                            className={`font-semibold ${
                                cart.isAbandoned ? "text-red-600" : "text-green-700"
                            }`}
                        >
                            {cart.isAbandoned ? "Abandoned" : "Active"}
                        </p>
                    </div>
                </div>

                {/* Items */}
                <div className="max-h-[45vh] overflow-y-auto px-5 py-4">
                    {items.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-400">
                            This cart is empty.
                        </p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {items.map((item, i) => {
                                const product = item.product || {};
                                return (
                                    <li
                                        key={item._id || i}
                                        className="flex items-center gap-3 py-3"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                                            <Package size={18} className="text-gray-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-900">
                                                {product.name || "Product removed"}
                                            </p>
                                            {item.variant?.displayName && (
                                                <p className="truncate text-xs text-gray-400">
                                                    {item.variant.displayName}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right text-sm">
                                            <p className="text-gray-900">
                                                {formatBDT(item.priceAtPurchase)}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                × {item.quantity}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </button>
                    {cart.user && (
                        <button
                            onClick={() => onCreateForUser?.(cart.user)}
                            className="flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                        >
                            <Mail size={15} />
                            Recovery Campaign
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartDetailsModal;
