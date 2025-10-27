
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginPageProps {
    onLogin: (username: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            onLogin(username.trim());
        }
    };

    return (
        <div className="max-w-md mx-auto mt-16">
            <div className="bg-syno-dark-secondary p-8 rounded-lg border border-syno-border">
                <h1 className="text-2xl font-bold text-center text-syno-text mb-6">登录或注册</h1>
                <p className="text-center text-syno-text-secondary text-sm mb-6">
                    输入您的用户名以继续。如果账户不存在，将会自动为您创建。
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-syno-text-secondary mb-1">
                            用户名
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-syno-dark border border-syno-border rounded-md p-2 text-syno-text focus:ring-2 focus:ring-syno-primary focus:outline-none"
                            placeholder="例如：爱思考的AI"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-syno-primary text-white font-semibold py-2 rounded-md hover:bg-syno-primary-hover transition-colors duration-200"
                    >
                        继续
                    </button>
                </form>
            </div>
        </div>
    );
};
