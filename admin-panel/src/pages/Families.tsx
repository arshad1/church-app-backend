import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { familiesAPI } from '../services/api';

interface Family {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    houseName?: string;
    members?: any[];
    createdAt: string;
}

export default function Families() {
    const navigate = useNavigate();
    const [families, setFamilies] = useState<Family[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);

    // Stats state
    const [totalFamilies, setTotalFamilies] = useState(0);
    const [avgSize, setAvgSize] = useState(0);

    const loadFamilies = async (p: number, l: number, s: string) => {
        try {
            setLoading(true);
            const res = await familiesAPI.getAll({ page: p, limit: l, search: s });
            setFamilies(res.data.data);
            setTotal(res.data.meta.total);

            // Update stats if search is empty
            if (!s) {
                setTotalFamilies(res.data.meta.total);
                // Calculate avg size from first page if needed, but better to have a dedicated endpoint
                // For now use the loaded data for a rough estimate or just show total
                const avg = res.data.data.length > 0
                    ? Math.round((res.data.data.reduce((acc: number, f: Family) => acc + (f.members?.length || 0), 0) / res.data.data.length) * 10) / 10
                    : 0;
                setAvgSize(avg);
            }
        } catch (error) {
            console.error('Error loading families:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            loadFamilies(page, limit, searchTerm);
        }, 500);

        return () => clearTimeout(handler);
    }, [page, limit, searchTerm]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1); // Reset to first page on search
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Families</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage church families and households</p>
                </div>
                <button
                    onClick={() => navigate('/families/add')}
                    className="bg-[#8B1E3F] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Family
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#8B1E3F] text-white p-6 rounded-3xl shadow-xl shadow-red-900/10 relative overflow-hidden border border-red-800/50">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full" />
                    <p className="text-xs uppercase tracking-widest font-bold opacity-70">Total Families</p>
                    <p className="text-4xl font-black mt-2">{totalFamilies}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-widest font-bold text-gray-400">Avg. Family Size</p>
                        <p className="text-2xl font-bold text-gray-900 mt-0.5">{avgSize}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-widest font-bold text-gray-400">Total Houses</p>
                        <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalFamilies}</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-2 mb-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search families by name, address, or phone..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border-none focus:ring-0 text-gray-900 placeholder-gray-400 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Families Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1E3F]"></div>
                </div>
            ) : families.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <p className="text-gray-900 font-bold text-lg">No families found</p>
                    <p className="text-gray-500 mt-1 max-w-xs mx-auto">Try adjusting your search terms or add a new family unit to the directory.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {families.map((family) => (
                            <div
                                key={family.id}
                                onClick={() => navigate(`/families/${family.id}`)}
                                className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 hover:shadow-xl hover:border-red-100 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6">
                                    <div className="bg-red-50 text-[#8B1E3F] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm group-hover:bg-[#8B1E3F] group-hover:text-white transition-colors">
                                        {family.members?.length || 0} Members
                                    </div>
                                </div>

                                <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl flex items-center justify-center text-[#8B1E3F] mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>

                                <h3 className="text-xl font-black text-gray-900 mb-2 truncate group-hover:text-[#8B1E3F] transition-colors">{family.name}</h3>
                                {family.houseName && (
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="px-2 py-0.5 rounded-md bg-yellow-50 text-yellow-700 text-[10px] font-black uppercase tracking-widest border border-yellow-200/50">
                                            {family.houseName}
                                        </span>
                                    </div>
                                )}

                                <div className="space-y-3 text-sm text-gray-500 font-medium">
                                    {family.address && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <svg className="w-3 h-3 text-gray-400 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                            </div>
                                            <span className="line-clamp-2 leading-relaxed">{family.address}</span>
                                        </div>
                                    )}
                                    {family.phone && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </div>
                                            <span>{family.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="bg-white px-6 py-6 border-t border-gray-100 rounded-[2rem] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="text-sm text-gray-500 font-medium">
                                Showing <span className="text-gray-900 font-black">{Math.min((page - 1) * limit + 1, total)}</span> to <span className="text-gray-900 font-black">{Math.min(page * limit, total)}</span> of <span className="text-gray-900 font-black">{total}</span> records
                            </div>
                            <select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="bg-gray-50 border-none text-gray-900 text-sm rounded-xl focus:ring-[#8B1E3F] block p-2 font-bold outline-none transition-all"
                            >
                                <option value={10}>10 per page</option>
                                <option value={25}>25 per page</option>
                                <option value={50}>50 per page</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2.5 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            {[...Array(Math.ceil(total / limit))].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-11 h-11 rounded-xl font-bold transition-all shadow-sm ${page === i + 1
                                        ? 'bg-[#8B1E3F] text-white shadow-red-900/20'
                                        : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            )).slice(Math.max(0, page - 3), Math.min(Math.ceil(total / limit), page + 2))}
                            <button
                                onClick={() => setPage(p => Math.min(Math.ceil(total / limit), p + 1))}
                                disabled={page === Math.ceil(total / limit)}
                                className="p-2.5 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
