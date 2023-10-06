import { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {

    // Assume user is always logged in for placeholder purposes.
    const [isAuthenticated, setAuthenticated] = useState(true);
    const [userId, setUserId] = useState('123456'); 
    const [username, setUsername] = useState('Godel');
    const [role, setRole] = useState('user'); 

    function login(username, password) {
        setAuthenticated(true);
        setUsername('Godel');
        setUserId('123456');  
        setRole('user');
    }

    function logout() {
        setAuthenticated(false);
        setUsername(null);
        setUserId(null);
        setRole(null);
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, username, userId, role }}>
            {children}
        </AuthContext.Provider>
    );
}