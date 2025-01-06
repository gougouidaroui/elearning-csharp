import { useState, useEffect } from 'react';

// Check if the token is in localStorage and validate it with the backend
const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            setLoading(false);
            return;
        }

        // Verify token with the backend (optional if you want to validate the token on each visit)
        const validateToken = async () => {
            try {
                const response = await fetch('/api/Auth/validate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // Send the token in the Authorization header
                    },
                });

                if (response.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (err) {
                console.error('Error validating token:', err);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        validateToken();
    }, []);

    return { isAuthenticated, loading };
};

export default useAuth;
