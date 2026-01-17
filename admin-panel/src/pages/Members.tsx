import { useEffect, useState } from 'react';
import { membersAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Member {
    id: number;
    name: string;
    email?: string;
    status: string;
    phone?: string;
    profileImage?: string;
    family?: {
        id: number;
        name: string;
    };
    createdAt: string;
}

export default function Members() {
    const navigate = useNavigate();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState<string>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset to first page on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        loadMembers();
    }, [debouncedSearch, statusFilter, sortBy, sortOrder, page, limit]);

    const loadMembers = async () => {
        try {
            setLoading(true);
            const res = await membersAPI.getAll({
                search: debouncedSearch,
                status: statusFilter,
                sortBy,
                sortOrder,
                page,
                limit
            });
            // Handle new response structure { data, meta }
            if (res.data.data) {
                setMembers(res.data.data);
                setTotal(res.data.meta.total);
            } else {
                setMembers(res.data); // Fallback for old structure if any
            }
        } catch (error) {
            console.error('Error loading members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await membersAPI.approve(id);
            loadMembers();
        } catch (error) {
            console.error('Error approving member:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this member?')) {
            try {
                await membersAPI.delete(id);
                loadMembers();
            } catch (error) {
                console.error('Error deleting member:', error);
            }
        }
    };


    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };


    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700';
            case 'PENDING_APPROVAL': return 'bg-yellow-100 text-yellow-700';
            case 'INACTIVE': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (sortBy !== column) return null;
        return (
            <span className="ml-1">
                {sortOrder === 'asc' ? '↑' : '↓'}
            </span>
        );
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Church Directory</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage church members and directory profiles</p>
                </div>
                <button
                    onClick={() => navigate('/members/add')}
                    className="bg-[#8B1E3F] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-900/20 hover:bg-[#701a35] transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Member
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative bg-[#8B1E3F] rounded-2xl p-6 shadow-sm overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold uppercase tracking-wider text-white/80 mb-2">Total Members</p>
                        <h3 className="text-4xl font-black">{total}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Active Members</p>
                    <h3 className="text-4xl font-black text-[#8B1E3F]">
                        {members.filter(m => m.status === 'ACTIVE').length}
                        <span className="text-xs text-gray-400 font-normal ml-2 align-middle opacity-50">(Visible)</span>
                    </h3>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Pending</p>
                    <h3 className="text-4xl font-black text-[#8B1E3F]">
                        {members.filter(m => m.status === 'PENDING_APPROVAL').length}
                        <span className="text-xs text-gray-400 font-normal ml-2 align-middle opacity-50">(Visible)</span>
                    </h3>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
                    <div className="flex gap-4 flex-1 w-full sm:max-w-xl">
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Search by name, email or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-1 focus:ring-primary-500"
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING_APPROVAL">Pending</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white text-gray-500">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:text-gray-900" onClick={() => handleSort('name')}>
                                    Member <SortIcon column="name" />
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:text-gray-900" onClick={() => handleSort('phone')}>
                                    Contact <SortIcon column="phone" />
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:text-gray-900" onClick={() => handleSort('family')}>
                                    Family Unit <SortIcon column="family" />
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:text-gray-900" onClick={() => handleSort('status')}>
                                    Status <SortIcon column="status" />
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Loading directory...
                                    </td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No members found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr
                                        key={member.id}
                                        onClick={() => navigate(`/members/${member.id}`)}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8">
                                                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs overflow-hidden border border-primary-200">
                                                        {member.profileImage ? (
                                                            <img src={member.profileImage} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            member.name[0]
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-bold text-gray-900">{member.name}</p>
                                                    <p className="text-xs text-gray-500">{member.email || 'No email'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {member.phone || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {member.family ? member.family.name : <span className="text-gray-400 italic">Unassigned</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase
                                                ${getStatusColor(member.status)}`}>
                                                {member.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => navigate(`/members/${member.id}/edit`)}
                                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                {member.status === 'PENDING_APPROVAL' && (
                                                    <button
                                                        onClick={() => handleApprove(member.id)}
                                                        className="text-green-600 hover:text-green-700 transition-colors"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(member.id)}
                                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 011-1h2a1 1 0 011 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination UI */}
                {!loading && total > 0 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                            <div className="flex items-center gap-4">
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-bold text-gray-900">{(page - 1) * limit + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * limit, total)}</span> of <span className="font-bold text-gray-900">{total}</span> members
                                </p>
                                <select
                                    value={limit}
                                    onChange={(e) => {
                                        setLimit(parseInt(e.target.value));
                                        setPage(1);
                                    }}
                                    className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500/20"
                                >
                                    <option value={10}>10 per page</option>
                                    <option value={20}>20 per page</option>
                                    <option value={50}>50 per page</option>
                                    <option value={100}>100 per page</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="flex items-center gap-1">
                                    {[...Array(Math.ceil(total / limit))].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${page === i + 1
                                                ? 'bg-[#8B1E3F] text-white shadow-md'
                                                : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setPage(p => Math.min(Math.ceil(total / limit), p + 1))}
                                    disabled={page >= Math.ceil(total / limit)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
