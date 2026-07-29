// src/components/admin/category/FieldLabel.jsx
import { HelpCircle } from "lucide-react";

/**
 * Label + optional required marker + hover/focus tooltip (the "?" affordance).
 * Pure CSS tooltip — no external lib. Also exposes the text via `title` for
 * accessibility / touch devices.
 */
const FieldLabel = ({ htmlFor, label, tooltip, required = false }) => (
    <label
        htmlFor={htmlFor}
        className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-800"
    >
        <span>
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
        </span>

        {tooltip && (
            <span className="group relative inline-flex" tabIndex={0} title={tooltip}>
                <HelpCircle
                    size={14}
                    className="cursor-help text-gray-400 transition-colors group-hover:text-gray-600 group-focus:text-gray-600"
                />
                <span
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-md bg-gray-900 px-3 py-2 text-center text-xs font-normal leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus:opacity-100"
                >
                    {tooltip}
                    <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-gray-900" />
                </span>
            </span>
        )}
    </label>
);

export default FieldLabel;
