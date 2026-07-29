// src/components/admin/products/InfoTip.jsx
import { Info } from "lucide-react";

// Small "(i)" affordance shown at the end of a field label. Hover/focus reveals
// the hint. Pure CSS — no tooltip library.
const InfoTip = ({ text, className = "" }) => {
    if (!text) return null;
    return (
        <span className={`group relative inline-flex ${className}`} tabIndex={0} title={text}>
            <Info
                size={14}
                className="cursor-help text-gray-400 transition-colors group-hover:text-gray-600 group-focus:text-gray-600"
            />
            <span
                role="tooltip"
                className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 w-60 rounded-md bg-gray-900 px-3 py-2 text-xs font-normal leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus:opacity-100"
            >
                {text}
            </span>
        </span>
    );
};

export default InfoTip;
