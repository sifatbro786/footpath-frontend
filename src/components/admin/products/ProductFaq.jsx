// src/components/admin/products/ProductFaq.jsx
import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

// items: [{ q: string, a: string }]
const ProductFaq = ({ title = "Help", items }) => {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-gray-700">
                <HelpCircle size={16} className="text-blue-600" />
                <p className="text-sm font-semibold">{title}</p>
            </div>

            <div className="flex flex-col gap-2">
                {items.map((item, i) => (
                    <div
                        key={i}
                        className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                    >
                        <button
                            type="button"
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                            {item.q}
                            <ChevronDown
                                size={16}
                                className={`shrink-0 text-gray-400 transition-transform ${
                                    openIndex === i ? "rotate-180" : ""
                                }`}
                            />
                        </button>
                        {openIndex === i && (
                            <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
                                {item.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductFaq;
