
import React, { useState } from 'react';

interface PasswordProtectProps {
    onAuthenticate: (password: string) => boolean;
}

const PasswordProtect: React.FC<PasswordProtectProps> = ({ onAuthenticate }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!onAuthenticate(password)) {
            setError('アクセスが拒否されました。パスワードが正しくありません。');
            setPassword('');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800">認証が必要です</h1>
                    <p className="mt-2 text-slate-500">ダッシュボードにアクセスするにはパスワードを入力してください。</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="peer h-10 w-full border-b-2 border-slate-300 text-slate-900 placeholder-transparent focus:outline-none focus:border-blue-600"
                            placeholder="password"
                            autoFocus
                        />
                         <label
                            htmlFor="password"
                            className="absolute left-0 -top-3.5 text-slate-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-slate-600 peer-focus:text-sm"
                         >
                            パスワード
                         </label>
                    </div>
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white font-semibold bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        アクセス
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasswordProtect;
