import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuItems = [
        {
            text: 'Dashboard', icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            ), path: '/'
        },
        {
            text: 'Members', icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ), path: '/members'
        },
        {
            text: 'Families', icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ), path: '/families'
        },
        {
            text: 'Ministries', icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ), path: '/ministries'
        },
        {
            text: 'Events', icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ), path: '/events'
        },
        {
            text: 'Sacraments', icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ), path: '/sacraments'
        },
        {
            text: 'App Users', icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ), path: '/users'
        },
        {
            text: 'Settings', icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ), path: '/settings'
        },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile Sidebar */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
                    <div className="absolute left-0 top-0 h-full w-72 bg-gradient-to-b from-primary-800 to-primary-950 text-white shadow-2xl">
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-accent-100 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                Church Admin
                            </h2>
                        </div>
                        <div className="p-4">
                            <nav className="space-y-1">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.text}
                                        onClick={() => {
                                            navigate(item.path);
                                            setMobileOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                                    >
                                        <div className="text-accent-400">{item.icon}</div>
                                        <span className="font-medium">{item.text}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-gradient-to-b from-primary-800 to-primary-950 text-white h-screen sticky top-0 shadow-xl">
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-accent-100 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        Church Admin
                    </h2>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.text}
                            onClick={() => navigate(item.path)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-white/80 hover:text-white group"
                        >
                            <div className="text-accent-400 group-hover:scale-110 transition-transform">
                                {item.icon}
                            </div>
                            <span className="font-medium">{item.text}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-6 border-t border-white/5 bg-black/10">
                    <p className="text-xs text-white/40 text-center uppercase tracking-widest font-bold">
                        CMS v1.0
                    </p>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3">
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex-1" />

                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <p className="text-sm font-bold text-gray-900 leading-none">
                                    {user?.name || user?.email}
                                </p>
                                <p className="text-sm text-primary-600 font-bold uppercase tracking-wider mt-1">
                                    {user?.role}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-900/10 border border-primary-500/20">
                                {user?.name?.[0] || user?.email?.[0]}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900">
                                    {user?.name || user?.email}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user?.role}
                                </p>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                title="Logout"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
