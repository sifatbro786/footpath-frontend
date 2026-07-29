// src/components/admin/products/ProductImageManager.jsx
import { ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { uploadApi } from "../../../api/uploadApi";

// value: [{ name, images: [{url, filename, alt, size, mimetype}] }]
// This shape is sent verbatim as `imageGroups` in the product create/update
// JSON body (see productApi.js for why it must be JSON, not multipart).
const ProductImageManager = ({ value, onChange }) => {
    const [uploadingGroup, setUploadingGroup] = useState(null);

    const groups = value?.length ? value : [{ name: "Main", images: [] }];

    const updateGroups = (next) => onChange(next);

    const handleAddGroup = () => {
        updateGroups([...groups, { name: `Group ${groups.length + 1}`, images: [] }]);
    };

    const handleRemoveGroup = (index) => {
        if (groups.length === 1) {
            toast.error("At least one image group is required");
            return;
        }
        updateGroups(groups.filter((_, i) => i !== index));
    };

    const handleGroupNameChange = (index, name) => {
        updateGroups(groups.map((g, i) => (i === index ? { ...g, name } : g)));
    };

    const handleUpload = async (index, fileList) => {
        const files = Array.from(fileList || []);
        if (!files.length) return;

        setUploadingGroup(index);
        try {
            const { data } = await uploadApi.uploadMultiple(files);
            const newImages = data.files.map((f) => ({
                url: f.url,
                filename: f.filename,
                alt: f.originalname,
                size: f.size,
                mimetype: f.mimetype,
            }));
            updateGroups(
                groups.map((g, i) =>
                    i === index ? { ...g, images: [...g.images, ...newImages] } : g,
                ),
            );
            toast.success(`${files.length} image(s) uploaded`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Image upload failed");
        } finally {
            setUploadingGroup(null);
        }
    };

    const handleRemoveImage = (groupIndex, imgIndex) => {
        updateGroups(
            groups.map((g, i) =>
                i === groupIndex ? { ...g, images: g.images.filter((_, j) => j !== imgIndex) } : g,
            ),
        );
    };

    return (
        <div className="flex flex-col gap-4">
            {groups.map((group, gIndex) => (
                <div key={gIndex} className="rounded-lg border border-gray-200 p-3">
                    <div className="mb-3 flex items-center gap-2">
                        <input
                            value={group.name}
                            onChange={(e) => handleGroupNameChange(gIndex, e.target.value)}
                            placeholder="Group name (e.g. Main, Red variant)"
                            className="flex-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveGroup(gIndex)}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            title="Remove group"
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {group.images.map((img, iIndex) => (
                            <div key={iIndex} className="relative h-20 w-20">
                                <img
                                    src={img.url}
                                    alt={img.alt}
                                    className="h-20 w-20 rounded-md border border-gray-200 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(gIndex, iIndex)}
                                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                                >
                                    <Trash2 size={10} />
                                </button>
                            </div>
                        ))}

                        <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500">
                            {uploadingGroup === gIndex ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    <ImagePlus size={18} />
                                    <span className="text-[10px]">Upload</span>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                disabled={uploadingGroup !== null}
                                onChange={(e) => handleUpload(gIndex, e.target.files)}
                            />
                        </label>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={handleAddGroup}
                className="flex w-fit items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
                <Plus size={15} />
                Add image group
            </button>
        </div>
    );
};

export default ProductImageManager;
