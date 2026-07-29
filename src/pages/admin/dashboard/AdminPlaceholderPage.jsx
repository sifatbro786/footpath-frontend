const AdminPlaceholderPage = ({ title }) => {
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">
                This module's UI will be built in a later step.
            </p>
            <div className="mt-6 flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-sm text-gray-400">
                Coming soon
            </div>
        </div>
    );
};

export default AdminPlaceholderPage;
