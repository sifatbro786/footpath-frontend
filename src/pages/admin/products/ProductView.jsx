// src/pages/admin/products/ProductView.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { productApi } from "../../../api/productApi";
import { variantFinalPrice, formatPrice } from "../../../components/admin/products/productPricing";

const Row = ({ label, children }) => (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2 text-sm last:border-0">
        <span className="text-gray-500">{label}</span>
        <span className="text-right font-medium text-gray-900">{children}</span>
    </div>
);

const Card = ({ title, children }) => (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-base font-semibold text-gray-900">{title}</h2>
        {children}
    </section>
);

const ProductView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        productApi
            .getOne(id)
            .then((res) => setProduct(res.data.product))
            .catch((err) => {
                toast.error(err.response?.data?.message || "Failed to load product");
                navigate("/admin/products");
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 text-gray-400">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-500" />
            </div>
        );
    }
    if (!product) return null;

    const currency = product.currency || "USD";
    const images = product.imageGroups?.flatMap((g) => g.images || []) || [];

    return (
        <div className="space-y-5 pb-10">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/admin/products")}
                        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
                        <p className="text-sm text-gray-500">
                            {product.sku ? `SKU: ${product.sku}` : "No SKU"} ·{" "}
                            {product.brand || "Generic"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/admin/products/${id}/edit`)}
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Pencil size={15} /> Edit
                </button>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                {/* Left: gallery + description */}
                <div className="space-y-5 lg:col-span-2">
                    <Card title="Media">
                        {images.length ? (
                            <div className="flex flex-wrap gap-2">
                                {images.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img.url}
                                        alt={img.alt || product.name}
                                        className="h-24 w-24 rounded-md border border-gray-200 object-cover"
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No images.</p>
                        )}
                    </Card>

                    <Card title="Description">
                        <p className="whitespace-pre-line text-sm text-gray-700">
                            {product.description || "—"}
                        </p>
                        {product.bulletPoints?.length > 0 && (
                            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-gray-700">
                                {product.bulletPoints.map((b, i) => (
                                    <li key={i}>{b}</li>
                                ))}
                            </ul>
                        )}
                    </Card>

                    {product.hasVariants && product.variants?.length > 0 && (
                        <Card title={`Variants (${product.variants.length})`}>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-140 text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                                            <th className="py-2 pr-3">Variant</th>
                                            <th className="px-3 py-2">Base</th>
                                            <th className="px-3 py-2">Final</th>
                                            <th className="px-3 py-2">Stock</th>
                                            <th className="px-3 py-2">SKU</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {product.variants.map((v, i) => (
                                            <tr key={i} className="border-b border-gray-100">
                                                <td className="py-2 pr-3">
                                                    {v.options?.map((o) => o.value).join(" / ") ||
                                                        "—"}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {formatPrice(
                                                        v.basePrice ?? product.basePrice,
                                                        currency,
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {formatPrice(
                                                        variantFinalPrice(
                                                            v,
                                                            product.basePrice,
                                                            product.discountType,
                                                            product.discountValue,
                                                        ),
                                                        currency,
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">{v.stock ?? 0}</td>
                                                <td className="px-3 py-2 text-gray-500">
                                                    {v.sku || "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {product.attributes?.length > 0 && (
                        <Card title="Attributes">
                            {product.attributes.map((a, i) => (
                                <Row key={i} label={a.key}>
                                    {a.value}
                                </Row>
                            ))}
                        </Card>
                    )}
                </div>

                {/* Right: facts */}
                <div className="space-y-5">
                    <Card title="Pricing">
                        <Row label="Base Price">{formatPrice(product.basePrice, currency)}</Row>
                        <Row label="Discount">
                            {product.discountType === "none"
                                ? "None"
                                : product.discountType === "percentage"
                                  ? `${product.discountValue}%`
                                  : formatPrice(product.discountValue, currency)}
                        </Row>
                        <Row label="Final Price">
                            {formatPrice(product.finalPrice ?? product.price, currency)}
                        </Row>
                    </Card>

                    <Card title="Inventory & Status">
                        <Row label="Stock">{product.stock}</Row>
                        <Row label="Low Stock Alert">{product.lowStockAlert ?? 5}</Row>
                        <Row label="Status">{product.isActive ? "Active" : "Inactive"}</Row>
                        <Row label="Featured">{product.isFeatured ? "Yes" : "No"}</Row>
                    </Card>

                    <Card title="Organization">
                        <Row label="Category">{product.category?.name || "—"}</Row>
                        <Row label="Subcategory">{product.subCategory?.name || "—"}</Row>
                    </Card>

                    <Card title="Shipping">
                        <Row label="Weight">{product.weight ?? 0} kg</Row>
                        <Row label="Dimensions (L×W×H)">
                            {`${product.dimensions?.length ?? 0} × ${product.dimensions?.width ?? 0} × ${product.dimensions?.height ?? 0} cm`}
                        </Row>
                        <Row label="Shipping Class">{product.shippingClass || "Standard"}</Row>
                    </Card>

                    {(product.metaTitle ||
                        product.metaDescription ||
                        product.metaKeywords?.length) && (
                        <Card title="SEO">
                            <Row label="Meta Title">{product.metaTitle || "—"}</Row>
                            <Row label="Meta Description">{product.metaDescription || "—"}</Row>
                            <Row label="Keywords">
                                {product.metaKeywords?.length
                                    ? product.metaKeywords.join(", ")
                                    : "—"}
                            </Row>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductView;
