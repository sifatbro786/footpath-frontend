import { createContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/authApi";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // true while we validate an existing token on first load

    const loadUser = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const { data } = await authApi.getMe(); // { success, user }
            setUser(data.user);
        } catch {
            // token expired / invalid — axiosInstance 401 interceptor also clears it
            localStorage.removeItem("token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const persistSession = (token, userData) => {
        localStorage.setItem("token", token);
        setUser(userData);
    };

    // Throws on failure — pages catch it and read error.response.data.message
    const login = async ({ email, password, rememberMe }) => {
        const { data } = await authApi.login({ email, password, rememberMe });
        persistSession(data.token, data.user);
        return data;
    };

    // register() does NOT return a token — backend requires OTP verification
    // first (unless NODE_ENV=development and SMTP fails, an edge case we don't
    // special-case on the frontend). Response: { success, message, userId, email, requiresVerification }
    const register = async (payload) => {
        const { data } = await authApi.register(payload);
        return data;
    };

    const verifyEmail = async ({ email, otp }) => {
        const { data } = await authApi.verifyEmail({ email, otp });
        persistSession(data.token, data.user);
        return data;
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } finally {
            localStorage.removeItem("token");
            setUser(null);
        }
    };

    const updateUser = (userData) => setUser(userData);

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        verifyEmail,
        logout,
        updateUser,
        refreshUser: loadUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
