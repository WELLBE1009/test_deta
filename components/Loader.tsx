
import React from 'react';

interface LoaderProps {
    message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24 mx-auto mb-4"></div>
                <p className="text-xl text-slate-700">{message}</p>
                <style>{`
                    .loader {
                        border-top-color: #3b82f6; /* blue-500 */
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        to {
                            transform: rotate(360deg);
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default Loader;
