import { Link } from "react-router-dom";

const NotFoundPage = () => {
    return (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
            <h1 className="text-4xl font-bold text-gray-900">404</h1>
            <p className="text-gray-500">Page not found.</p>
            <Link to="/" className="text-sm font-medium text-gray-900 hover:underline">
                Go back home
            </Link>
        </div>
    );
};

export default NotFoundPage;
