import { BrowserRouter } from "react-router-dom";
import AppRoute from "./router/AppRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { Toaster } from "react-hot-toast";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoute />
                <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
