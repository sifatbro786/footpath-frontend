// src/components/admin/category/CategoryStatusBadge.jsx
const CategoryStatusBadge = ({ active }) => (
    <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
        }`}
    >
        {active ? "Active" : "Inactive"}
    </span>
);

export default CategoryStatusBadge;
