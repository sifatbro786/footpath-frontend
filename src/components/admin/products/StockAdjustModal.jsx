// src/components/admin/products/StockAdjustModal.jsx
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { productApi } from "../../../api/productApi";

// Backend does `product.stock += quantity` — so we always submit a signed
// delta, never an absolute target value.
const StockAdjustModal = ({ open, product, onClose, onSaved }) => {
    const [mode, setMode] = useState("add"); // "add" | "remove"
    const [amount, setAmount] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!open || !product) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const qty = Number(amount);
        if (!qty || qty <= 0) {
            toast.error("Enter a valid quantity");
            return;
        }

        setSubmitting(true);
        try {
            const delta = mode === "add" ? qty : -qty;
            const { data } = await productApi.adjustStock(product._id, delta);
            toast.success(`Stock ${mode === "add" ? "increased" : "decreased"} by ${qty}`);
            onSaved(data.product);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Stock update failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Adjust Stock</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                </div>

                <p className="mb-3 text-sm text-gray-500">
                    {product.name} — current stock:{" "}
                    <span className="font-medium text-gray-900">{product.stock}</span>
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="flex overflow-hidden rounded-md border border-gray-300">
                        <button
                            type="button"
                            onClick={() => setMode("add")}
                            className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-sm font-medium ${
                                mode === "add"
                                    ? "bg-emerald-600 text-white"
                                    : "bg-white text-gray-600"
                            }`}
                        >
                            <Plus size={14} />
                            Add
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("remove")}
                            className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-sm font-medium ${
                                mode === "remove"
                                    ? "bg-red-600 text-white"
                                    : "bg-white text-gray-600"
                            }`}
                        >
                            <Minus size={14} />
                            Remove
                        </button>
                    </div>

                    <input
                        type="number"
                        min="1"
                        autoFocus
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Quantity"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                    />

                    <div className="mt-1 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                        >
                            {submitting ? "Saving..." : "Update Stock"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockAdjustModal;
