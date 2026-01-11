import { useEffect, useState } from 'react';
import { reportsAPI } from '../services/api';

const StatCard = ({ title, value, icon, gradient }: any) => (
    <div
        className={`h-full rounded-2xl p-6 text-white shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden`}
        style={{
            background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
            boxShadow: `0 8px 32px ${adaptColor(gradient[0], 0.3)}`
        }}
    >
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full" />

        <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
                <p className="opacity-90 mb-1 text-sm font-medium">{title}</p>
                <h3 className="text-4xl font-bold">{value}</h3>
            </div>
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                {icon}
            </div>
        </div>

        <div className="flex items-center gap-1 opacity-90 relative z-10">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-xs font-medium">Active</span>
        </div>
    </div>
);

// Helper to simulate MUI's alpha function for shadows (simplified)
const adaptColor = (_hex: string, opacity: number) => {
    // Simple conversion or returning a default shadow color if mostly using predefined gradients
    // For Tailwind, we usually use classes, but since gradients are dynamic here, we keep the style.
    // We can just return a generic shadow color since the gradient handles the look.
    return `rgba(0, 0, 0, ${opacity})`;
};

export default function Dashboard() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        reportsAPI.getDashboard().then((res) => setStats(res.data));
    }, []);

    if (!stats) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

    const cards = [
        {
            title: 'Total Members',
            value: stats.members.total,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            gradient: ['#6d182d', '#3b0814'], // Deep Maroon
        },
        {
            title: 'Active Members',
            value: stats.members.active,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            gradient: ['#ba2345', '#811931'], // Rose Maroon
        },
        {
            title: 'Families',
            value: stats.families,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            gradient: ['#d7a43a', '#9f611d'], // Gold
        },
        {
            title: 'Ministries',
            value: stats.ministries,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            gradient: ['#9a1a36', '#6d182d'], // Wine Maroon
        },
        {
            title: 'Total Events',
            value: stats.events.total,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            gradient: ['#c58627', '#7e461b'], // Amber/Bronze
        },
        {
            title: 'Upcoming Events',
            value: stats.events.upcoming,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            gradient: ['#811931', '#4c0519'], // Deepest Maroon
        },
    ];

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                    <StatCard key={index} {...card} />
                ))}
            </div>
        </div>
    );
}
