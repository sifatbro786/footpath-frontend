import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search, Pencil, Trash2, Power, FileText } from "lucide-react";
import toast from "react-hot-toast";

import { aplusApi } from "../../../api/aplusApi";
import { productApi } from "../../../api/productApi";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";
import AplusEditorModal from "../../../components/admin/aplus/AplusEditorModal";

/**
 * /admin/aplus-content
 *
 * A+ Content is one document per product, so this page is a list of products
 * that HAVE content plus a search to attach it to one that does not.
 *
 * Everything is keyed by PRODUCT id, not by the A+ document id: the save route
 * is an upsert on productId, and toggle and delete both take a productId. There
 * is deliberately no "create" versus "update" distinction in the UI because
 * there is none in the API.
 */
export default function AplusContentManagement() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const [productQuery, setProductQuery] = useState("");
    const [productResults, setProductResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const [editorTarget, setEditorTarget] = useState(null); // { productId, productName }
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await aplusApi.list({ limit: 100 });
            setRows(data.aplusContents || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not load A+ content");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    // Debounced product search, for attaching content to a new product.
    useEffect(() => {
        const term = productQuery.trim();
        if (term.length < 2) {
            setProductResults([]);
            return;
        }

        const id = setTimeout(async () => {
            setSearching(true);
            try {
                const { data } = await productApi.getSearch(term);
                setProductResults(data.products || data.data || []);
            } catch {
                setProductResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(id);
    }, [productQuery]);

    const handleToggle = async (row) => {
        const productId = row.productId?._id ?? row.productId;
        setRows((prev) =>
            prev.map((r) => (r._id === row._id ? { ...r, isActive: !r.isActive } : r)),
        );
        try {
            await aplusApi.toggle(productId);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not update that content");
            load();
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const productId = deleteTarget.productId?._id ?? deleteTarget.productId;
            await aplusApi.remove(productId);
            toast.success("A+ content deleted");
            setDeleteTarget(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not delete that content");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">A+ content</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Rich content blocks shown below the description on a product page.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={load}
                    className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    <RefreshCw size={14} />
                    Refresh
                </button>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <label htmlFor="aplus-product" className="block text-sm font-medium text-gray-700">
                    Add content to a product
                </label>
                <div className="relative mt-2">
                    <Search
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        id="aplus-product"
                        value={productQuery}
                        onChange={(e) => setProductQuery(e.target.value)}
                        placeholder="Search products by name or SKU"
                        className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                </div>

                {productQuery.trim().length >= 2 && (
                    <div className="mt-2 max-h-56 overflow-y-auto rounded-md border border-gray-200">
                        {searching ? (
                            <p className="px-3 py-2.5 text-sm text-gray-500">Searching</p>
                        ) : productResults.length === 0 ? (
                            <p className="px-3 py-2.5 text-sm text-gray-500">No products found</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {productResults.map((product) => (
                                    <li key={product._id}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditorTarget({
                                                    productId: product._id,
                                                    productName: product.name,
                                                });
                                                setProductQuery("");
                                            }}
                                            className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-gray-50"
                                        >
                                            <span className="truncate text-gray-900">
                                                {product.name}
                                            </span>
                                            {product.sku && (
                                                <span className="shrink-0 text-xs text-gray-400">
                                                    {product.sku}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
                    ))}
                </div>
            ) : rows.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
                    <FileText size={22} className="mx-auto text-gray-300" />
                    <p className="mt-3 text-base font-semibold text-gray-900">
                        No A+ content yet
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        Search for a product above to give it rich content blocks.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                    <table className="w-full min-w-2xl text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Product</th>
                                <th className="px-4 py-3 font-medium">Title</th>
                                <th className="px-4 py-3 font-medium">Sections</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map((row) => (
                                <tr key={row._id}>
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {row.productId?.name ?? "Deleted product"}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{row.title}</td>
                                    <td className="px-4 py-3 tabular-nums text-gray-600">
                                        {row.sections?.length ?? 0}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={
                                                row.isActive
                                                    ? "text-green-600"
                                                    : "text-gray-400"
                                            }
                                        >
                                            {row.isActive ? "Live" : "Hidden"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleToggle(row)}
                                                aria-label="Toggle visibility"
                                                className="rounded border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                            >
                                                <Power size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={!row.productId?._id}
                                                onClick={() =>
                                                    setEditorTarget({
                                                        productId: row.productId._id,
                                                        productName: row.productId.name,
                                                    })
                                                }
                                                aria-label="Edit content"
                                                className="rounded border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeleteTarget(row)}
                                                aria-label="Delete content"
                                                className="rounded border border-gray-200 p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <AplusEditorModal
                target={editorTarget}
                onClose={() => setEditorTarget(null)}
                onSaved={() => {
                    setEditorTarget(null);
                    load();
                }}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete this A+ content?"
                message={`All content blocks for "${deleteTarget?.productId?.name ?? "this product"}" will be removed.`}
                confirmLabel="Delete"
                loading={deleting}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />
        </div>
    );
}
