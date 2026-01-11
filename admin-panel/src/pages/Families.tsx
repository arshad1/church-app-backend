import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { familiesAPI } from '../services/api';

interface Family {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    members?: any[];
    createdAt: string;
}

export default function Families() {
    const navigate = useNavigate();
    const [families, setFamilies] = useState<Family[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadFamilies();
    }, []);

    const loadFamilies = async () => {
        try {
            setLoading(true);
            const res = await familiesAPI.getAll();
            setFamilies(res.data);
        } catch (error) {
            console.error('Error loading families:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredFamilies = families.filter((family) =>
        family.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        family.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Families</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage church families and households</p>
                </div>
                <button
                    onClick={() => navigate('/families/add')}
                    className="bg-gradient-to-r from-primary-600 to-primary-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2 border border-primary-700/50"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Family
                </button>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4 mb-8 overflow-x-auto">
                <div className="flex-1 min-w-[220px] bg-gradient-to-br from-primary-700 to-primary-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden border border-white/10">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full" />
                    <p className="text-xs uppercase tracking-wider font-bold opacity-70">Total Families</p>
                    <p className="text-4xl font-black mt-2">{families.length}</p>
                </div>
                <div className="flex-1 min-w-[220px] bg-gradient-to-br from-accent-500 to-accent-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden border border-white/10">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full" />
                    <p className="text-xs uppercase tracking-wider font-bold opacity-70">Average Size</p>
                    <p className="text-4xl font-black mt-2">
                        {families.length > 0
                            ? Math.round((families.reduce((acc, f) => acc + (f.members?.length || 0), 0) / families.length) * 10) / 10
                            : 0}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-5 mb-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search families by name or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Families Grid */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading families...</div>
            ) : filteredFamilies.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-3xl border border-gray-100">
                    <p className="font-medium">No families found</p>
                    <p className="text-sm mt-1">Try a different search or add a new family</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFamilies.map((family) => (
                        <div
                            key={family.id}
                            onClick={() => navigate(`/families/${family.id}`)}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-primary-50 text-primary-700 rounded-xl group-hover:bg-primary-100 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-lg">
                                    {family.members?.length || 0} Members
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{family.name}</h3>

                            <div className="space-y-2 text-sm text-gray-500">
                                {family.address && (
                                    <div className="flex items-start gap-2">
                                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="line-clamp-2">{family.address}</span>
                                    </div>
                                )}
                                {family.phone && (
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span>{family.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
