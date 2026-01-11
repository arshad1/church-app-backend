import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { familiesAPI, membersAPI } from '../services/api';

interface Member {
    id: number;
    name?: string;
    email: string;
    role: string;
    phone?: string;
    familyRole?: string;
    headOfFamily?: boolean;
    profileImage?: string;
}

const FAMILY_ROLES = ['HEAD', 'SPOUSE', 'FATHER', 'MOTHER', 'SON', 'DAUGHTER', 'GRANDFATHER', 'GRANDMOTHER', 'MEMBER'];

interface Family {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    members?: Member[];
    createdAt: string;
}

export default function FamilyDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [family, setFamily] = useState<Family | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');

    useEffect(() => {
        if (id) loadFamily();
    }, [id]);

    const loadFamily = async () => {
        try {
            setLoading(true);
            const res = await familiesAPI.getById(Number(id));
            setFamily(res.data);
        } catch (error) {
            console.error('Error loading family:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (memberId: number, role: string) => {
        try {
            // Optimistic update
            if (family && family.members) {
                const updatedMembers = family.members.map(m =>
                    m.id === memberId ? { ...m, familyRole: role } : m
                );
                setFamily({ ...family, members: updatedMembers });
            }

            await membersAPI.update(memberId, { familyRole: role });
            // No need to reload family if optimistic update works, but to be safe/consistent:
            // loadFamily();
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Failed to update role');
            loadFamily(); // Revert on error
        }
    };

    const handleRemoveMember = async (memberId: number) => {
        if (!window.confirm('Are you sure you want to remove this member from the family?')) return;
        try {
            await membersAPI.update(memberId, { familyId: null, familyRole: null });
            loadFamily(); // Reload to refresh list
        } catch (error) {
            console.error('Error removing member:', error);
            alert('Failed to remove member');
        }
    };

    const [showAddMember, setShowAddMember] = useState(false);
    // const [allMembers, setAllMembers] = useState<Member[]>([]); // Removed unused state
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [addingMember, setAddingMember] = useState(false);

    const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMembers(searchTerm);
        }, 500); // Bouncer delay of 500ms

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchMembers = async (term: string) => {
        try {
            const res = await membersAPI.getAll({ limit: 1000, search: term });

            // Filter out members who are already in this family
            const currentMemberIds = family?.members?.map(m => m.id) || [];
            const available = res.data.filter((m: any) => !currentMemberIds.includes(m.id));

            setFilteredMembers(available);
        } catch (error) {
            console.error('Error searching members:', error);
        }
    };

    const handleAddMemberClick = async () => {
        setShowAddMember(true);
        // Load initial list (empty search)
        setSearchTerm('');
    };

    const handleAddMemberSubmit = async () => {
        if (!selectedMemberId) return;
        setAddingMember(true);
        try {
            await membersAPI.update(Number(selectedMemberId), { familyId: Number(id) });
            setShowAddMember(false);
            setSelectedMemberId('');
            loadFamily();
        } catch (error) {
            console.error('Error adding member:', error);
            alert('Failed to add member to family');
        } finally {
            setAddingMember(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12 text-gray-500">Loading family details...</div>;
    }

    if (!family) {
        return <div className="text-center py-12 text-gray-500">Family not found</div>;
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/families')}
                    className="p-2 rounded-xl bg-primary-100/50 text-primary-700 hover:bg-primary-100 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">Family Details</h2>
                    <p className="text-sm text-gray-500 mt-1">View and manage family members</p>
                </div>
                <button
                    onClick={() => navigate(`/families/${id}/edit`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors font-bold text-gray-700 shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
                {/* Family Info Card */}
                <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 h-fit">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-950 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                            {family.name[0]}
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 leading-tight">{family.name}</h1>
                            <p className="text-sm text-gray-500">Created {new Date(family.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Address</p>
                            <p className="text-sm font-medium text-gray-900">{family.address || 'No address provided'}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Primary Phone</p>
                            <p className="text-sm font-medium text-gray-900">{family.phone || 'No phone provided'}</p>
                        </div>
                    </div>
                </div>

                {/* Members List */}
                {/* Tabs */}
                <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-1">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`pb-2 px-1 text-sm font-bold border-b-2 transition-all ${viewMode === 'list' ? 'border-primary-800 text-primary-800' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        List View
                    </button>
                    <button
                        onClick={() => setViewMode('tree')}
                        className={`pb-2 px-1 text-sm font-bold border-b-2 transition-all ${viewMode === 'tree' ? 'border-primary-800 text-primary-800' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Family Tree
                    </button>
                </div>

                {viewMode === 'list' && (
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Family Members</h3>
                                <span className="bg-primary-100 text-primary-800 text-xs font-bold px-2 py-1 rounded-lg mt-1 inline-block">
                                    {family.members?.length || 0} Total
                                </span>
                            </div>
                            <button
                                onClick={handleAddMemberClick}
                                className="bg-primary-800 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary-900/20 hover:bg-primary-900 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Member
                            </button>
                        </div>

                        {family.members && family.members.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {family.members.map((member) => (
                                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            {/* Profile Image */}
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                                                {member.profileImage ? (
                                                    <img src={member.profileImage} alt={member.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-gray-500 font-bold text-lg">{member.name?.[0] || member.email?.[0]?.toUpperCase() || '?'}</span>
                                                )}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-gray-900">{member.name || member.email}</p>
                                                    {member.headOfFamily && (
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 uppercase tracking-wide">
                                                            Head
                                                        </span>
                                                    )}
                                                    {!member.email && (
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 uppercase tracking-wide">
                                                            Family Only
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mb-1">{member.email || 'No login email'}</p>

                                                {/* Role Selector */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Role:</span>
                                                    <select
                                                        value={member.familyRole || ''}
                                                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                        onClick={(e) => e.stopPropagation()} // Prevent row click if any
                                                        className="bg-transparent text-xs font-semibold text-primary-700 border-none p-0 focus:ring-0 cursor-pointer hover:text-primary-900"
                                                    >
                                                        <option value="" className="text-gray-400">Select Role</option>
                                                        {FAMILY_ROLES.map(role => (
                                                            <option key={role} value={role}>{role}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => navigate(`/members/${member.id}`)}
                                                className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                                                title="View Member"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Remove from Family"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-400 italic">
                                No members linked to this family yet.
                                <br />
                                <span className="text-sm">Link members from their profile page.</span>
                            </div>
                        )}
                    </div>
                )}

                {viewMode === 'tree' && (
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[400px] flex items-center justify-center overflow-auto">
                        {/* Simple Tree Visualization */}
                        <div className="flex flex-col items-center gap-8">
                            {/* Head Level */}
                            <div className="flex gap-8 justify-center">
                                {family.members?.filter(m => m.familyRole === 'HEAD' || m.familyRole === 'FATHER' || m.familyRole === 'GRANDFATHER').map(m => (
                                    <div key={m.id} className="flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-full border-4 border-primary-100 p-0.5 bg-white shadow-sm overflow-hidden mb-2">
                                            {m.profileImage ? <img src={m.profileImage} className="w-full h-full object-cover rounded-full" /> : <div className="w-full h-full bg-primary-50 flex items-center justify-center text-primary-800 font-bold text-xl">{m.name?.[0]}</div>}
                                        </div>
                                        <span className="font-bold text-xs text-center text-gray-900">{m.name}</span>
                                        <span className="text-[10px] text-primary-600 font-medium uppercase tracking-wide">{m.familyRole}</span>
                                    </div>
                                ))}
                                {family.members?.filter(m => m.familyRole === 'SPOUSE' || m.familyRole === 'MOTHER' || m.familyRole === 'GRANDMOTHER').map(m => (
                                    <div key={m.id} className="flex flex-col items-center relative">
                                        <div className="absolute top-8 -left-6 w-4 h-0.5 bg-gray-300"></div> {/* Connector */}
                                        <div className="w-16 h-16 rounded-full border-4 border-pink-100 p-0.5 bg-white shadow-sm overflow-hidden mb-2">
                                            {m.profileImage ? <img src={m.profileImage} className="w-full h-full object-cover rounded-full" /> : <div className="w-full h-full bg-pink-50 flex items-center justify-center text-pink-800 font-bold text-xl">{m.name?.[0]}</div>}
                                        </div>
                                        <span className="font-bold text-xs text-center text-gray-900">{m.name}</span>
                                        <span className="text-[10px] text-pink-600 font-medium uppercase tracking-wide">{m.familyRole}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Connector Line Vertical */}
                            {(family.members?.some(m => ['SON', 'DAUGHTER', 'child'].includes(m.familyRole || '') || !m.familyRole)) && (
                                <div className="w-0.5 h-8 bg-gray-200"></div>
                            )}

                            {/* Children Level */}
                            <div className="flex gap-6 flex-wrap justify-center border-t-2 border-gray-100 pt-8 px-8 relative">
                                {family.members?.filter(m => !['HEAD', 'FATHER', 'GRANDFATHER', 'SPOUSE', 'MOTHER', 'GRANDMOTHER'].includes(m.familyRole || '')).map(m => (
                                    <div key={m.id} className="flex flex-col items-center relative">
                                        {/* Top vertical connector handled by flex layout visually for simplicity */}
                                        <div className="w-12 h-12 rounded-full border-2 border-gray-100 p-0.5 bg-white shadow-sm overflow-hidden mb-2">
                                            {m.profileImage ? <img src={m.profileImage} className="w-full h-full object-cover rounded-full" /> : <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-600 font-bold">{m.name?.[0]}</div>}
                                        </div>
                                        <span className="font-bold text-xs text-center text-gray-900">{m.name}</span>
                                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{m.familyRole || 'Member'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Member Modal */}
            {showAddMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddMember(false)} />
                    <div className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Add Family Member</h3>
                        <p className="text-sm text-gray-500 mb-6">Select a member to add to the <span className="font-bold text-primary-800">{family.name}</span> family.</p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Member</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by name or phone..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all pl-10"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="mt-2 max-h-60 overflow-y-auto border border-gray-100 rounded-xl bg-gray-50/50">
                                {filteredMembers.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">No members found.</div>
                                ) : (
                                    filteredMembers.map((m) => (
                                        <div
                                            key={m.id}
                                            onClick={() => setSelectedMemberId(m.id.toString())}
                                            className={`p-3 cursor-pointer hover:bg-primary-50 transition-colors flex items-center justify-between group ${selectedMemberId === m.id.toString() ? 'bg-primary-50 border-l-4 border-primary-600' : 'border-l-4 border-transparent'
                                                }`}
                                        >
                                            <div>
                                                <p className={`font-semibold text-sm ${selectedMemberId === m.id.toString() ? 'text-primary-900' : 'text-gray-700'}`}>
                                                    {m.name || m.email}
                                                </p>
                                                {m.phone && <p className="text-xs text-gray-500">{m.phone}</p>}
                                            </div>
                                            {selectedMemberId === m.id.toString() && (
                                                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Only members not currently in this family are shown.</p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddMember(false)}
                                className="px-5 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddMemberSubmit}
                                disabled={!selectedMemberId || addingMember}
                                className="px-5 py-2.5 rounded-xl bg-primary-800 text-white font-bold shadow-lg shadow-primary-900/20 hover:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {addingMember ? 'Adding...' : 'Add Member'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
