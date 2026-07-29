// src/components/admin/category/CategoryTreeRow.jsx
import { ChevronRight, ChevronDown, Pencil, Trash2 } from "lucide-react";
import CategoryStatusBadge from "./CategoryStatusBadge";

const INDENT_PER_LEVEL = 20; // px

const CategoryTreeRow = ({
    node,
    depth = 0,
    parentName = null, // resolved from the tree during recursion
    expanded, // Set<string>
    onToggle,
    onEdit,
    onDelete,
}) => {
    const children = node.children || [];
    const hasChildren = children.length > 0;
    const isOpen = expanded.has(node._id);

    return (
        <>
            <tr className="border-b border-gray-100 hover:bg-gray-50">
                {/* Name / Description */}
                <td className="py-3 pr-4">
                    <div
                        className="flex items-start gap-2"
                        style={{ paddingLeft: depth * INDENT_PER_LEVEL }}
                    >
                        {hasChildren ? (
                            <button
                                type="button"
                                onClick={() => onToggle(node._id)}
                                className="mt-0.5 shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                                title={isOpen ? "Collapse" : "Expand"}
                            >
                                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                        ) : (
                            <span className="mt-0.5 inline-block w-5.5 shrink-0" />
                        )}
                        <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">{node.name}</p>
                            {node.description && (
                                <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                                    {node.description}
                                </p>
                            )}
                        </div>
                    </div>
                </td>

                {/* Slug / Parent */}
                <td className="px-4 py-3 align-top">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-700">{node.slug}</span>
                        <span className="mt-0.5 text-xs">
                            {parentName ? (
                                <span className="text-gray-500">{parentName}</span>
                            ) : (
                                <span className="font-medium text-blue-600">Top Level</span>
                            )}
                        </span>
                    </div>
                </td>

                {/* Status / Actions */}
                <td className="px-4 py-3 align-top">
                    <div className="flex items-center justify-end gap-3">
                        <CategoryStatusBadge active={node.isActive} />
                        <button
                            type="button"
                            onClick={() => onEdit(node)}
                            className="text-gray-400 hover:text-gray-700"
                            title="Edit"
                        >
                            <Pencil size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete(node)}
                            className="text-gray-400 hover:text-red-600"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </td>
            </tr>

            {hasChildren &&
                isOpen &&
                children.map((child) => (
                    <CategoryTreeRow
                        key={child._id}
                        node={child}
                        depth={depth + 1}
                        parentName={node.name}
                        expanded={expanded}
                        onToggle={onToggle}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
        </>
    );
};

export default CategoryTreeRow;
