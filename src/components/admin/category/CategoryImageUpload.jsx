// src/components/admin/category/CategoryImageUpload.jsx
import { useRef, useState, useEffect } from "react";
import { UploadCloud, X } from "lucide-react";
import toast from "react-hot-toast";

const MAX_BYTES = 5 * 1024 * 1024; // backend limit (uploadCategoryImage) = 5MB
const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

/**
 * props:
 *  - file:          File | null              (newly selected image)
 *  - existingUrl:   string | null            (image already saved on the record)
 *  - onSelect(file)                          (a new File was chosen)
 *  - onClearFile()                           (drop the freshly selected File)
 *  - onRemoveExisting()                      (request removal of the saved image)
 */
const CategoryImageUpload = ({ file, existingUrl, onSelect, onClearFile, onRemoveExisting }) => {
    const inputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Object URL for the selected File; revoke on change/unmount to avoid leaks.
    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const validateAndSelect = (picked) => {
        if (!picked) return;
        if (!ALLOWED.includes(picked.type)) {
            toast.error("Only PNG, JPG, WEBP or GIF allowed");
            return;
        }
        if (picked.size > MAX_BYTES) {
            toast.error("Image must be 5MB or smaller");
            return;
        }
        onSelect(picked);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        validateAndSelect(e.dataTransfer.files?.[0]);
    };

    const shownUrl = previewUrl || existingUrl;

    if (shownUrl) {
        return (
            <div className="relative w-full overflow-hidden rounded-lg border border-gray-200">
                <img
                    src={shownUrl}
                    alt="Category"
                    className="h-48 w-full object-contain bg-gray-50"
                />
                <button
                    type="button"
                    onClick={() => (previewUrl ? onClearFile() : onRemoveExisting())}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow hover:bg-white hover:text-red-600"
                    title={previewUrl ? "Discard selected image" : "Remove image"}
                >
                    <X size={16} />
                </button>
                {previewUrl && (
                    <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">
                        New — saves on submit
                    </span>
                )}
            </div>
        );
    }

    return (
        <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
                dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
        >
            <UploadCloud size={28} className="text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="mt-1 text-xs text-gray-400">PNG, JPG, WEBP or GIF (Max 5MB)</p>
            <input
                ref={inputRef}
                type="file"
                accept={ALLOWED.join(",")}
                className="hidden"
                onChange={(e) => {
                    validateAndSelect(e.target.files?.[0]);
                    e.target.value = ""; // allow re-selecting the same file
                }}
            />
        </div>
    );
};

export default CategoryImageUpload;
