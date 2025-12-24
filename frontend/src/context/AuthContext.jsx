import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if token exists and valid
        // For simplicity, we just check presence of token and maybe decode payload if needed
        // Ideally call /me endpoint, but we don't have one strictly defined yet, so we rely on stored user info or just token presence + logic
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/authenticate', { email, password });
            const { token } = response.data;

            // We need to now who logged in (Role etc).
            // The backend returns just token currently? 
            // Let's check backend AuthController. Or we parse the token.
            // JWT usually has claims.

            const payload = JSON.parse(atob(token.split('.')[1]));

            const userData = {
                email: payload.sub,
                role: payload.userType, // Ensure backend puts this in claim
                name: payload.name,
                id: payload.userId,
                token
            };

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            return { success: false, message: "Invalid credentials" };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
