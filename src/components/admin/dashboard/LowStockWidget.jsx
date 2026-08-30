import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, PackageCheck } from "lucide-react";

import { productApi } from "../../../api/productApi";

/**
 * Products at or below their own restock threshold.
 *
 * "Low" is per product (Product.lowStockAlert), not one global number, which is
 * why this needs its own endpoint rather than a filter on the product list.
 *
 * For a product with variants the figure is the SUM of variant stock: the
 * parent `stock` field is usually 0 on those and would report everything as out
 * of stock. The row says how many variants that total covers, so the number is
 * not mistaken for a single shelf count.
 */
export default function LowStockWidget({ limit = 8 }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;

        productApi
            .getLowStock(limit)
            .then(({ data }) => {
                if (!cancelled) setProducts(data.products || []);
            })
            .catch(() => {
                if (!cancelled) setFailed(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [limit]);

    // A dashboard widget that failed should not shout about it; the rest of the
    // page is still useful.
    if (failed) return null;

    return (
        <div className="rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <AlertTriangle size={15} className="text-amber-500" />
                    Running low
                </h2>
                <Link
                    to="/admin/products"
                    className="text-xs font-medium text-gray-500 underline underline-offset-2 hover:text-gray-900"
                >
                    All products
                </Link>
            </div>

            {loading ? (
                <div className="space-y-2 p-4">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="px-4 py-10 text-center">
                    <PackageCheck size={20} className="mx-auto text-green-500" />
                    <p className="mt-2 text-sm text-gray-500">
                        Everything is above its restock threshold.
                    </p>
                </div>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {products.map((product) => {
                        const isOut = product.effectiveStock <= 0;
                        const image = product.imageGroups?.[0]?.images?.[0]?.url;

                        return (
                            <li key={product._id}>
                                <Link
                                    to={`/admin/products/${product._id}/edit`}
                                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50"
                                >
                                    {image ? (
                                        <img
                                            src={image}
                                            alt=""
                                            className="h-9 w-9 shrink-0 rounded border border-gray-200 object-cover"
                                        />
                                    ) : (
                                        <div className="h-9 w-9 shrink-0 rounded border border-gray-200 bg-gray-50" />
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm text-gray-900">
                                            {product.name}
                                        </p>
                                        {product.hasVariants && (
                                            <p className="text-xs text-gray-400">
                                                Across all variants
                                            </p>
                                        )}
                                    </div>

                                    <span
                                        className={`shrink-0 text-sm font-semibold tabular-nums ${
                                            isOut ? "text-red-600" : "text-amber-600"
                                        }`}
                                    >
                                        {isOut ? "Out" : product.effectiveStock}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
