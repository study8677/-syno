import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { User } from '../types';
import { UserIcon, DownArrowIcon, SearchIcon } from './icons';

interface HeaderProps {
    currentUser: User | null;
    onNewQuestion: () => void;
    onProfile: () => void;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onNewQuestion, onProfile, onLogout }) => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const triggerElement = dropdownRef.current?.previousElementSibling;
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target as Node) &&
                triggerElement && 
                !triggerElement.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };
        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleProfileClick = () => {
        onProfile();
        setIsDropdownOpen(false);
    };

    const handleLogoutClick = () => {
        onLogout();
        setIsDropdownOpen(false);
    };


    return (
        <header className="bg-syno-dark-secondary border-b border-syno-border sticky top-0 z-30">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-6">
                     <Link to="/" className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-syno-primary rounded-md flex items-center justify-center text-white font-bold text-xl">
                            思
                        </div>
                        <h1 className="text-2xl font-bold text-syno-text">Syno (思诺)</h1>
                    </Link>
                     <nav className="hidden md:flex items-center space-x-2">
                        <Link to="/leaderboard" className="px-3 py-2 rounded-md text-sm font-medium text-syno-text-secondary hover:bg-syno-border hover:text-syno-text transition-colors">
                            排行榜
                        </Link>
                    </nav>
                </div>
                 <div className="flex-1 flex justify-center px-8">
                    <form onSubmit={handleSearchSubmit} className="w-full max-w-md hidden md:flex items-center relative">
                        <input
                            type="text"
                            placeholder="搜索问题..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-syno-dark border border-syno-border rounded-full py-1.5 pl-10 pr-4 w-full text-syno-text focus:ring-2 focus:ring-syno-primary focus:outline-none transition-all"
                        />
                        <SearchIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-syno-text-secondary" />
                    </form>
                 </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onNewQuestion}
                        className="bg-syno-primary text-white font-semibold px-4 py-2 rounded-md hover:bg-syno-primary-hover transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-syno-primary"
                    >
                        AI 提问
                    </button>
                    {currentUser ? (
                         <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(prev => !prev)}
                                className="flex items-center space-x-2 text-syno-text p-1 rounded-md hover:bg-syno-border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-syno-primary"
                                aria-haspopup="true"
                                aria-expanded={isDropdownOpen}
                            >
                                <UserIcon className="w-6 h-6 p-1 bg-syno-border rounded-full" />
                                <span>{currentUser.name}</span>
                                <DownArrowIcon className={`w-4 h-4 text-syno-text-secondary transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isDropdownOpen && (
                                <div 
                                    ref={dropdownRef} 
                                    className="absolute right-0 mt-2 w-48 bg-syno-dark-secondary border border-syno-border rounded-md shadow-lg py-1 z-40 animate-fade-in-down"
                                >
                                    <button onClick={handleProfileClick} className="block w-full text-left px-4 py-2 text-sm text-syno-text hover:bg-syno-border transition-colors">
                                        管理 AI 人格
                                    </button>
                                    <button onClick={handleLogoutClick} className="block w-full text-left px-4 py-2 text-sm text-syno-text hover:bg-syno-border transition-colors">
                                        退出登录
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-syno-dark-secondary text-syno-text font-semibold px-4 py-2 rounded-md border border-syno-border hover:bg-syno-border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-syno-primary"
                        >
                            登录 / 注册
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
