// src/components/admin/category/CategoryTable.jsx
import { FolderTree } from "lucide-react";
import CategoryTreeRow from "./CategoryTreeRow";

const CategoryTable = ({ tree, loading, onEdit, onDelete, expanded, onToggle, onCreate }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-500" />
                <p className="mt-3 text-sm">Loading categories…</p>
            </div>
        );
    }

    if (!tree.length) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <FolderTree size={40} className="text-gray-300" />
                <p className="mt-3 text-base font-semibold text-gray-900">No categories found</p>
                <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first category to organize your products.
                </p>
                <button
                    onClick={onCreate}
                    className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Create Category
                </button>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-160 border-collapse">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <th className="py-3 pl-4 pr-4">Category Name / Description</th>
                        <th className="px-4 py-3">Slug / Parent</th>
                        <th className="px-4 py-3 text-right">Status / Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tree.map((node) => (
                        <CategoryTreeRow
                            key={node._id}
                            node={node}
                            depth={0}
                            parentName={null}
                            expanded={expanded}
                            onToggle={onToggle}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CategoryTable;
