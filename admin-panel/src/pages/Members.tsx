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
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
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

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedMembers.length} members?`)) {
            try {
                await membersAPI.deleteBulk(selectedMembers);
                setSelectedMembers([]);
                loadMembers();
            } catch (error) {
                console.error('Error bulk deleting members:', error);
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

    const toggleSelectAll = () => {
        if (selectedMembers.length === members.length) {
            setSelectedMembers([]);
        } else {
            setSelectedMembers(members.map(m => m.id));
        }
    };

    const toggleSelectMember = (id: number) => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Church Directory</h2>
                    <p className="text-sm text-gray-600 mt-1">Manage church members and directory profiles</p>
                </div>
                <button
                    onClick={() => navigate('/members/add')}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Member
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-4 flex-1 w-full md:w-auto">
                        <div className="relative flex-1 md:w-96">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Search by name, email or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20"
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING_APPROVAL">Pending</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                    {selectedMembers.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 011-1h2a1 1 0 011 1v3M4 7h16" />
                            </svg>
                            Delete Selected ({selectedMembers.length})
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedMembers.length === members.length && members.length > 0}
                                        onChange={toggleSelectAll}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('name')}>
                                    Member <SortIcon column="name" />
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('phone')}>
                                    Contact <SortIcon column="phone" />
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('family')}>
                                    Family Unit <SortIcon column="family" />
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('status')}>
                                    Status <SortIcon column="status" />
                                </th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                            Loading directory...
                                        </div>
                                    </td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No members found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr
                                        key={member.id}
                                        onClick={() => navigate(`/members/${member.id}`)}
                                        className={`hover:bg-gray-50/80 cursor-pointer transition-colors ${selectedMembers.includes(member.id) ? 'bg-primary-50/30' : ''}`}
                                    >
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedMembers.includes(member.id)}
                                                onChange={() => toggleSelectMember(member.id)}
                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold overflow-hidden border border-primary-200">
                                                    {member.profileImage ? (
                                                        <img src={member.profileImage} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        member.name[0]
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{member.name}</p>
                                                    <p className="text-xs text-gray-500">{member.email || 'No email'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{member.phone || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            {member.family ? (
                                                <span className="text-gray-700">{member.family.name}</span>
                                            ) : (
                                                <span className="text-gray-400 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(member.status)}`}>
                                                {member.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => navigate(`/members/${member.id}/edit`)}
                                                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="Edit Member"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                {member.status === 'PENDING_APPROVAL' && (
                                                    <button
                                                        onClick={() => handleApprove(member.id)}
                                                        className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Approve Member"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(member.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Member"
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
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                                Showing <span className="font-bold text-gray-900">{(page - 1) * limit + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * limit, total)}</span> of <span className="font-bold text-gray-900">{total}</span> members
                            </span>
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
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
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
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === i + 1 ? 'bg-primary-600 text-white shadow-md' : 'hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page >= Math.ceil(total / limit)}
                                className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
