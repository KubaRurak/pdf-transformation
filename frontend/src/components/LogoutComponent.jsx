import { useEffect } from 'react';
import { useAuth } from './security/AuthContext';  // replace with your actual path to AuthProvider

function LogoutComponent() {
    const { logout } = useAuth();

    useEffect(() => {
        logout();
        // Optionally, navigate to the home or login page after logging out
        // navigate('/login');
    }, [logout]);

    return (
        <div>
            <h2>Logging Out...</h2>
            <p>You have been logged out. Redirecting...</p>
        </div>
    );
}

export default LogoutComponent;