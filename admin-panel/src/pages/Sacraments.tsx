import { useState, useEffect } from 'react';
import { sacramentsAPI, membersAPI } from '../services/api';
import moment from 'moment';

interface Member {
    id: number;
    name: string;
    email: string;
}

interface Sacrament {
    id: number;
    type: string;
    date: string;
    details?: string;
    memberId: number;
    member?: Member;
}

const SACRAMENT_TYPES = [
    'BAPTISM',
    'CONFIRMATION',
    'EUCHARIST',
    'MARRIAGE',
    'HOLY_ORDERS',
    'ANOINTING_OF_THE_SICK',
    'FUNERAL'
];

export default function Sacraments() {
    const [sacraments, setSacraments] = useState<Sacrament[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Pagination & Search States
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');

    // Create Form States
    const [formData, setFormData] = useState({
        type: 'BAPTISM',
        date: moment().format('YYYY-MM-DD'),
        memberId: '',
        details: ''
    });
    const [creating, setCreating] = useState(false);

    // Member Search
    const [members, setMembers] = useState<Member[]>([]);
    const [memberSearch, setMemberSearch] = useState('');
    const [searchingMembers, setSearchingMembers] = useState(false);

    useEffect(() => {
        loadSacraments();
    }, [page, limit, search]);

    const loadSacraments = async () => {
        try {
            setLoading(true);
            const res = await sacramentsAPI.getAll({ page, limit, search });
            if (res.data.data) {
                setSacraments(res.data.data);
                setTotal(res.data.meta.total);
            } else {
                setSacraments(res.data);
                setTotal(res.data.length);
            }
        } catch (error) {
            console.error('Error loading sacraments:', error);
        } finally {
            setLoading(false);
        }
    };

    // Member Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (showCreate && memberSearch) {
                searchMembers(memberSearch);
            } else {
                setMembers([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [memberSearch, showCreate]);

    const searchMembers = async (term: string) => {
        if (!term) return;
        setSearchingMembers(true);
        try {
            const res = await membersAPI.getAll({ search: term, limit: 10 });
            setMembers(res.data.data || res.data);
        } catch (error) {
            console.error('Error searching members:', error);
        } finally {
            setSearchingMembers(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await sacramentsAPI.create({
                ...formData,
                memberId: Number(formData.memberId)
            });
            setShowCreate(false);
            setFormData({
                type: 'BAPTISM',
                date: moment().format('YYYY-MM-DD'),
                memberId: '',
                details: ''
            });
            setMemberSearch('');
            loadSacraments();
        } catch (error) {
            console.error('Error creating sacrament:', error);
            alert('Failed to create sacrament record');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this sacrament record?')) return;
        try {
            await sacramentsAPI.delete(id);
            loadSacraments();
        } catch (error) {
            console.error('Error deleting sacrament:', error);
            alert('Failed to delete sacrament record');
        }
    };



    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Sacraments Log</h2>
                    <p className="text-sm text-gray-500 mt-1">Track and manage sacrament records</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="bg-[#8B1E3F] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-900/20 hover:bg-[#701a35] transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Record Sacrament
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Records Card */}
                <div className="relative bg-[#8B1E3F] rounded-2xl p-6 shadow-sm overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold uppercase tracking-wider text-white/80 mb-2">Total Records</p>
                        <h3 className="text-4xl font-black">{total}</h3>
                    </div>
                </div>

                {/* Baptisms Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Baptisms</p>
                    <h3 className="text-4xl font-black text-[#8B1E3F]">
                        {/* Placeholder - would need backend aggregation */}
                        {sacraments.filter(s => s.type === 'BAPTISM').length}
                        <span className="text-xs text-gray-400 font-normal ml-2 align-middle opacity-50">(Visible)</span>
                    </h3>
                </div>

                {/* Marriages Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Marriages</p>
                    <h3 className="text-4xl font-black text-[#8B1E3F]">
                        {/* Placeholder - would need backend aggregation */}
                        {sacraments.filter(s => s.type === 'MARRIAGE').length}
                        <span className="text-xs text-gray-400 font-normal ml-2 align-middle opacity-50">(Visible)</span>
                    </h3>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {/* Search & Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
                    <div className="relative flex-1 w-full sm:max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by member name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Sacrament
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Member
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Details
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Loading records...
                                    </td>
                                </tr>
                            ) : sacraments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No records found
                                    </td>
                                </tr>
                            ) : (
                                sacraments.map((sacrament) => (
                                    <tr key={sacrament.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            {moment(sacrament.date).format('MMM D, YYYY')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase
                                                ${sacrament.type === 'BAPTISM' ? 'bg-pink-100 text-pink-800' :
                                                    sacrament.type === 'MARRIAGE' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                                {sacrament.type.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8">
                                                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                                                        {sacrament.member?.name.charAt(0)}
                                                    </div>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-bold text-gray-900">{sacrament.member?.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {sacrament.details || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-3">
                                                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sacrament.id)}
                                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

                {/* Pagination */}
                {/* Pagination */}
                {!loading && total > 0 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                            {/* Left Side: Showing Info & Page Size */}
                            <div className="flex items-center gap-4">
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-bold text-gray-900">{(page - 1) * limit + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * limit, total)}</span> of <span className="font-bold text-gray-900">{total}</span> records
                                </p>
                                <select
                                    value={limit}
                                    onChange={(e) => {
                                        setLimit(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500/20"
                                >
                                    <option value={10}>10 per page</option>
                                    <option value={20}>20 per page</option>
                                    <option value={50}>50 per page</option>
                                </select>
                            </div>

                            {/* Right Side: Pagination Controls */}
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
                                    {[...Array(Math.min(5, Math.ceil(total / limit)))].map((_, i) => {
                                        let pageNum = i + 1;
                                        if (page > 3 && Math.ceil(total / limit) > 5) {
                                            pageNum = page - 2 + i;
                                        }
                                        if (pageNum > Math.ceil(total / limit)) return null;

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${page === pageNum
                                                    ? 'bg-primary-600 text-white shadow-md'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
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

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
                    <div className="relative bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl overflow-visible">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Record Sacrament</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Member</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search member name..."
                                        value={memberSearch}
                                        onChange={e => {
                                            setMemberSearch(e.target.value);
                                            setFormData({ ...formData, memberId: '' });
                                        }}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                    />
                                    {formData.memberId ? (
                                        <div className="absolute right-3 top-3 text-green-600 flex items-center gap-1 text-sm font-bold bg-green-50 px-2 py-0.5 rounded-lg">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Selected
                                        </div>
                                    ) : searchingMembers ? (
                                        <div className="absolute right-3 top-3 text-gray-400 text-sm">Searching...</div>
                                    ) : null}

                                    {/* Dropdown results */}
                                    {memberSearch && !formData.memberId && members.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-10">
                                            {members.map(member => (
                                                <div
                                                    key={member.id}
                                                    onClick={() => {
                                                        setFormData({ ...formData, memberId: member.id.toString() });
                                                        setMemberSearch(member.name);
                                                        setMembers([]);
                                                    }}
                                                    className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                                                >
                                                    <span className="font-medium text-gray-900">{member.name}</span>
                                                    <span className="text-xs text-gray-500">{member.email}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sacrament Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 bg-white"
                                    >
                                        {SACRAMENT_TYPES.map(type => (
                                            <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Details / Notes</label>
                                <textarea
                                    rows={3}
                                    placeholder="Godparents, witnesses, location details..."
                                    value={formData.details}
                                    onChange={e => setFormData({ ...formData, details: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="px-5 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating || !formData.memberId}
                                    className="px-5 py-2.5 rounded-xl bg-primary-700 text-white font-bold shadow-lg shadow-primary-900/20 hover:bg-primary-800 transition-colors disabled:opacity-50"
                                >
                                    {creating ? 'Saving...' : 'Save Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
