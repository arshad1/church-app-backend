import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ministriesAPI, membersAPI } from '../services/api';

interface Member {
    id: number;
    name: string;
    email: string;
    profileImage?: string;
    phone?: string;
}

interface MinistryMember {
    id: number;
    role: 'LEADER' | 'MEMBER';
    member: Member;
}

interface Ministry {
    id: number;
    name: string;
    description?: string;
    meetingSchedule?: string;
    members?: MinistryMember[];
    createdAt: string;
}

export default function MinistryDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [ministry, setMinistry] = useState<Ministry | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showAddMember, setShowAddMember] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    // Add member states
    const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [addingMember, setAddingMember] = useState(false);

    // Edit ministry states
    const [editForm, setEditForm] = useState({ name: '', description: '', meetingSchedule: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id) loadMinistry();
    }, [id]);

    const loadMinistry = async () => {
        try {
            setLoading(true);
            const res = await ministriesAPI.getById(Number(id));
            setMinistry(res.data);
            setEditForm({
                name: res.data.name,
                description: res.data.description || '',
                meetingSchedule: res.data.meetingSchedule || ''
            });
        } catch (error) {
            console.error('Error loading ministry:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignLeader = async (memberId: number) => {
        try {
            await ministriesAPI.assignLeader(Number(id), memberId);
            loadMinistry();
        } catch (error) {
            console.error('Error assigning leader:', error);
            alert('Failed to assign leader');
        }
    };

    const handleRemoveMember = async (memberId: number) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;
        try {
            await ministriesAPI.removeMember(Number(id), memberId);
            loadMinistry();
        } catch (error) {
            console.error('Error removing member:', error);
            alert('Failed to remove member');
        }
    };

    // Add Member Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (showAddMember) fetchMembers(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, showAddMember]);

    const fetchMembers = async (term: string) => {
        try {
            const res = await membersAPI.getAll({ limit: 50, search: term });
            // Filter out existing members
            const currentMemberIds = ministry?.members?.map(m => m.member.id) || [];
            const membersList = res.data.data || res.data;
            const available = membersList.filter((m: any) => !currentMemberIds.includes(m.id));
            setFilteredMembers(available);
        } catch (error) {
            console.error('Error searching members:', error);
        }
    };

    const handleAddMemberSubmit = async () => {
        if (!selectedMemberId) return;
        setAddingMember(true);
        try {
            await ministriesAPI.addMember(Number(id), Number(selectedMemberId));
            setShowAddMember(false);
            setSelectedMemberId('');
            loadMinistry();
        } catch (error) {
            console.error('Error adding member:', error);
            alert('Failed to add member');
        } finally {
            setAddingMember(false);
        }
    };

    // Edit Logic
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await ministriesAPI.update(Number(id), editForm);
            loadMinistry();
            setShowEdit(false);
        } catch (error) {
            console.error('Error updating ministry:', error);
            alert('Failed to update ministry');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12 text-gray-500">Loading details...</div>;
    }

    if (!ministry) {
        return <div className="text-center py-12 text-gray-500">Ministry not found</div>;
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/ministries')}
                    className="p-2 rounded-xl bg-primary-100/50 text-primary-700 hover:bg-primary-100 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">Ministry Details</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage ministry members and information</p>
                </div>
                <button
                    onClick={() => setShowEdit(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors font-bold text-gray-700 shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Info
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Info Card */}
                <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 h-fit">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                            {ministry.name[0]}
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 leading-tight">{ministry.name}</h1>
                            <p className="text-sm text-gray-500">Created {ministry.createdAt ? new Date(ministry.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Description</p>
                            <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">
                                {ministry.description || 'No description provided'}
                            </p>
                        </div>
                        {ministry.meetingSchedule && (
                            <div className="pt-4 border-t border-gray-200/50">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Meeting Schedule</p>
                                <div className="flex items-center gap-2 text-sm font-bold text-primary-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {ministry.meetingSchedule}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Members List */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Ministry Members</h3>
                            <span className="bg-primary-100 text-primary-800 text-xs font-bold px-2 py-1 rounded-lg mt-1 inline-block">
                                {ministry.members?.length || 0} Total
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                setShowAddMember(true);
                                setSearchTerm('');
                            }}
                            className="bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary-900/20 hover:bg-primary-800 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Member
                        </button>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {(!ministry.members || ministry.members.length === 0) ? (
                            <div className="p-8 text-center text-gray-400 italic">
                                No members in this ministry yet.
                            </div>
                        ) : (
                            ministry.members.map((mm) => (
                                <div key={mm.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                                            {mm.member.profileImage ? (
                                                <img src={mm.member.profileImage} alt={mm.member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-gray-500 font-bold">{mm.member.name?.[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-gray-900">{mm.member.name || mm.member.email}</p>
                                                {mm.role === 'LEADER' && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 uppercase tracking-wide">
                                                        Leader
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">{mm.member.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {mm.role !== 'LEADER' && (
                                            <button
                                                onClick={() => handleAssignLeader(mm.member.id)}
                                                className="text-xs font-bold text-primary-700 hover:text-primary-900 px-2 py-1 rounded hover:bg-primary-50 transition-colors"
                                            >
                                                Make Leader
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleRemoveMember(mm.member.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Remove from Ministry"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEdit(false)} />
                    <div className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Edit Ministry</h3>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Schedule</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Every Sunday after service"
                                    value={editForm.meetingSchedule}
                                    onChange={e => setEditForm({ ...editForm, meetingSchedule: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEdit(false)}
                                    className="px-5 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2.5 rounded-xl bg-primary-700 text-white font-bold hover:bg-primary-800 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Member Modal (Reused Logic mainly) */}
            {showAddMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddMember(false)} />
                    <div className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Add Member</h3>
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Search members..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500"
                            />
                            <div className="mt-2 max-h-60 overflow-y-auto border border-gray-100 rounded-xl bg-gray-50">
                                {filteredMembers.map(m => (
                                    <div
                                        key={m.id}
                                        onClick={() => setSelectedMemberId(m.id.toString())}
                                        className={`p-3 cursor-pointer hover:bg-primary-50 flex justify-between items-center ${selectedMemberId === m.id.toString() ? 'bg-primary-50 ring-1 ring-primary-500' : ''}`}
                                    >
                                        <span className="font-medium text-gray-900">{m.name || m.email}</span>
                                        {selectedMemberId === m.id.toString() && (
                                            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddMember(false)}
                                className="px-5 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddMemberSubmit}
                                disabled={!selectedMemberId || addingMember}
                                className="px-5 py-2.5 rounded-xl bg-primary-700 text-white font-bold hover:bg-primary-800 disabled:opacity-50"
                            >
                                {addingMember ? 'Adding...' : 'Add Selected'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
