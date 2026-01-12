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
    }, []);

    const loadSacraments = async () => {
        try {
            setLoading(true);
            const res = await sacramentsAPI.getAll();
            setSacraments(res.data);
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
            setMembers(res.data);
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
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Sacraments Log</h2>
                    <p className="text-sm text-gray-500 mt-1">Track and manage sacrament records</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="bg-gradient-to-r from-primary-600 to-primary-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2 border border-primary-700/50"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Record Sacrament
                </button>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4 mb-8 overflow-x-auto">
                <div className="flex-1 min-w-[220px] bg-gradient-to-br from-primary-700 to-primary-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden border border-white/10">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full" />
                    <p className="text-xs uppercase tracking-wider font-bold opacity-70">Total Records</p>
                    <p className="text-4xl font-black mt-2">{sacraments.length}</p>
                </div>
                <div className="flex-1 min-w-[220px] bg-white text-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <p className="text-xs uppercase tracking-wider font-bold text-gray-500">Baptisms</p>
                    <p className="text-4xl font-black mt-2 text-primary-600">
                        {sacraments.filter(s => s.type === 'BAPTISM').length}
                    </p>
                </div>
                <div className="flex-1 min-w-[220px] bg-white text-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <p className="text-xs uppercase tracking-wider font-bold text-gray-500">Marriages</p>
                    <p className="text-4xl font-black mt-2 text-rose-500">
                        {sacraments.filter(s => s.type === 'MARRIAGE').length}
                    </p>
                </div>
            </div>

            {/* Sacraments List */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading records...</div>
            ) : sacraments.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-3xl border border-gray-100">
                    <p className="font-medium">No sacrament records found</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 font-bold text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Sacrament</th>
                                <th className="px-6 py-4">Member</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sacraments.map((sacrament) => (
                                <tr key={sacrament.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-900 font-medium">
                                        {moment(sacrament.date).format('MMM D, YYYY')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide
                                            ${sacrament.type === 'BAPTISM' ? 'bg-primary-50 text-primary-700' :
                                                sacrament.type === 'MARRIAGE' ? 'bg-rose-50 text-rose-700' :
                                                    sacrament.type === 'FUNERAL' ? 'bg-gray-100 text-gray-700' :
                                                        'bg-yellow-50 text-yellow-800'}`}>
                                            {sacrament.type.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                                                {sacrament.member?.name?.[0]}
                                            </div>
                                            <span className="font-medium text-gray-900">{sacrament.member?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                        {sacrament.details || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                                                title="View Certificate (Coming Soon)"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(sacrament.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete Record"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

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
