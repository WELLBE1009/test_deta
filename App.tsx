
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import PasswordProtect from './components/PasswordProtect';
import { ACCESS_PASSWORD } from './constants';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        // This is a simple session persistence. For real apps, use more secure methods.
        const sessionAuth = sessionStorage.getItem('dashboard_authenticated');
        if (sessionAuth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleAuthentication = (password: string): boolean => {
        if (password === ACCESS_PASSWORD) {
            sessionStorage.setItem('dashboard_authenticated', 'true');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    return (
        <>
            {isAuthenticated ? (
                <Dashboard />
            ) : (
                <PasswordProtect onAuthenticate={handleAuthentication} />
            )}
        </>
    );
};

export default App;
