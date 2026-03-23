import { useState, useEffect } from 'react';

export const useRole = () => {
    const [role, setRole] = useState('user');
    
    useEffect(() => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (token) {
            try {
                const payloadBase64 = token.split('.')[1];
                const decodedJson = atob(payloadBase64);
                const decoded = JSON.parse(decodedJson);
                if (decoded && decoded.role) {
                    setRole(decoded.role);
                }
            } catch (e) {
                console.error("Error decoding token", e);
            }
        }
    }, []);

    return { 
        role, 
        isProfessor: role === 'professor' 
    };
};
