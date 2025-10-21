
import React, { useEffect, useState } from 'react';
import { AlertType } from '../types';

interface AlertProps {
    message: string;
    type: AlertType;
    isVisible: boolean;
}

const Alert: React.FC<AlertProps> = ({ message, type, isVisible }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShow(true);
        } else {
            const timer = setTimeout(() => setShow(false), 300); // For fade-out transition
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    if (!show) return null;

    const colorMap = {
        info: 'bg-blue-100 text-blue-800 border-blue-400',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-400',
        error: 'bg-red-100 text-red-700 border-red-400'
    };
    const iconName = { info: 'info', warning: 'alert-triangle', error: 'alert-circle' };

    return (
        <div 
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-xl z-50 border transition-opacity duration-300 ${colorMap[type]} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            <i data-lucide={iconName[type]} className="w-5 h-5 inline-block align-text-bottom mr-2"></i>
            {message}
        </div>
    );
};

export default Alert;
