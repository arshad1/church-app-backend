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
    houseName?: string;
    address?: string;
    phone?: string;
    members?: Member[];
    relatedFamilies?: { id: number; name: string; houseName?: string }[];
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

    // Related Families Logic
    const [showLinkFamily, setShowLinkFamily] = useState(false);
    const [familySearchTerm, setFamilySearchTerm] = useState('');
    const [searchedFamilies, setSearchedFamilies] = useState<Family[]>([]);
    const [linkingFamily, setLinkingFamily] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (showLinkFamily) searchFamilies(familySearchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [familySearchTerm, showLinkFamily]);

    const searchFamilies = async (term: string) => {
        try {
            const res = await familiesAPI.getAll(); // Ideally backend should support search param, but filtering client side for now as per existing pattern or if api supports it
            // Based on Families.tsx, it fetches all.
            const allFamilies = res.data;
            const filtered = allFamilies.filter((f: Family) =>
                f.id !== Number(id) && // Exclude self
                !family?.relatedFamilies?.some(rf => rf.id === f.id) && // Exclude already related
                (f.name.toLowerCase().includes(term.toLowerCase()) ||
                    f.houseName?.toLowerCase().includes(term.toLowerCase()))
            );
            setSearchedFamilies(filtered);
        } catch (error) {
            console.error('Error searching families:', error);
        }
    };

    const handleLinkFamily = async (relatedFamilyId: number) => {
        setLinkingFamily(true);
        try {
            await familiesAPI.addRelated(Number(id), relatedFamilyId);
            setShowLinkFamily(false);
            setFamilySearchTerm('');
            loadFamily();
        } catch (error) {
            console.error('Error linking family:', error);
            alert('Failed to link family');
        } finally {
            setLinkingFamily(false);
        }
    };

    const handleUnlinkFamily = async (relatedFamilyId: number) => {
        if (!window.confirm('Are you sure you want to unlink this family?')) return;
        try {
            await familiesAPI.removeRelated(Number(id), relatedFamilyId);
            loadFamily();
        } catch (error) {
            console.error('Error unlinking family:', error);
            alert('Failed to unlink family');
        }
    };

    const [showAddMember, setShowAddMember] = useState(false);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [viewState, setViewState] = useState<'search' | 'create'>('search');

    // New Member Form State
    const [newMemberData, setNewMemberData] = useState({
        name: '',
        email: '',
        phone: '',
        familyRole: 'MEMBER'
    });
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
        setViewState('search');
        setSearchTerm('');
        setSelectedMemberIds([]);
    };

    const toggleMemberSelection = (memberId: string) => {
        setSelectedMemberIds(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleAddMembersSubmit = async () => {
        if (selectedMemberIds.length === 0) return;
        setAddingMember(true);
        try {
            await Promise.all(selectedMemberIds.map(memberId =>
                membersAPI.update(Number(memberId), { familyId: Number(id) })
            ));
            setShowAddMember(false);
            setSelectedMemberIds([]);
            loadFamily();
        } catch (error) {
            console.error('Error adding members:', error);
            alert('Failed to add members to family');
        } finally {
            setAddingMember(false);
        }
    };

    const handleCreateMemberSubmit = async () => {
        if (!newMemberData.name) return;
        setAddingMember(true);
        try {
            await membersAPI.create({
                ...newMemberData,
                familyId: Number(id),
                status: 'ACTIVE'
            });
            setShowAddMember(false);
            setNewMemberData({ name: '', email: '', phone: '', familyRole: 'MEMBER' });
            loadFamily();
        } catch (error) {
            console.error('Error creating member:', error);
            alert('Failed to create new member');
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
                            {family.houseName && (
                                <p className="text-sm font-bold text-primary-700">{family.houseName}</p>
                            )}
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

                    {/* Related Families Section */}
                    <div className="mt-6 border-t border-gray-100 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Related Families</h3>
                            <button
                                onClick={() => setShowLinkFamily(true)}
                                className="text-primary-700 hover:text-primary-900 text-xs font-bold flex items-center gap-1"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Link
                            </button>
                        </div>

                        <div className="space-y-3">
                            {family.relatedFamilies && family.relatedFamilies.length > 0 ? (
                                family.relatedFamilies.map(rf => (
                                    <div key={rf.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between group">
                                        <div>
                                            <p
                                                className="text-sm font-bold text-gray-900 cursor-pointer hover:text-primary-700 hover:underline"
                                                onClick={() => navigate(`/families/${rf.id}`)}
                                            >
                                                {rf.name}
                                            </p>
                                            {rf.houseName && <p className="text-xs text-gray-500">{rf.houseName}</p>}
                                        </div>
                                        <button
                                            onClick={() => handleUnlinkFamily(rf.id)}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                            title="Unlink Family"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 italic">No related families linked.</p>
                            )}
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
                    <div className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Add Family Members</h3>
                            <p className="text-sm text-gray-500">Manage members for <span className="font-bold text-primary-800">{family.name}</span> family.</p>
                        </div>

                        {/* Tabs */}
                        <div className="flex bg-gray-100 p-1 rounded-xl mb-6 shrink-0">
                            <button
                                onClick={() => setViewState('search')}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${viewState === 'search' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Existing Members
                            </button>
                            <button
                                onClick={() => setViewState('create')}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${viewState === 'create' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                New Member
                            </button>
                        </div>

                        {viewState === 'search' ? (
                            <>
                                <div className="mb-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search by name or phone..."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all pl-10"
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            autoFocus
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="mt-2 text-xs text-gray-400 flex justify-between">
                                        <span>Select multiple members to add</span>
                                        <span className={selectedMemberIds.length > 0 ? 'text-primary-600 font-bold' : ''}>
                                            {selectedMemberIds.length} selected
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl bg-gray-50/50 min-h-0 mb-6">
                                    {filteredMembers.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500 text-sm">
                                            {searchTerm ? 'No matching members found.' : 'Search to find members.'}
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {filteredMembers.map((m) => {
                                                const isSelected = selectedMemberIds.includes(m.id.toString());
                                                return (
                                                    <div
                                                        key={m.id}
                                                        onClick={() => toggleMemberSelection(m.id.toString())}
                                                        className={`p-3 cursor-pointer hover:bg-white transition-colors flex items-center justify-between group ${isSelected ? 'bg-primary-50 hover:bg-primary-50' : ''
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-300 bg-white'}`}>
                                                                {isSelected && (
                                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className={`font-semibold text-sm ${isSelected ? 'text-primary-900' : 'text-gray-700'}`}>
                                                                    {m.name || m.email}
                                                                </p>
                                                                {m.phone && <p className="text-xs text-gray-500">{m.phone}</p>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => setShowAddMember(false)}
                                        className="px-5 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddMembersSubmit}
                                        disabled={selectedMemberIds.length === 0 || addingMember}
                                        className="px-5 py-2.5 rounded-xl bg-primary-800 text-white font-bold shadow-lg shadow-primary-900/20 hover:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {addingMember ? 'Adding...' : `Add ${selectedMemberIds.length > 0 ? selectedMemberIds.length : ''} Members`}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col h-full">
                                <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={newMemberData.name}
                                            onChange={e => setNewMemberData({ ...newMemberData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm font-semibold"
                                            placeholder="Enter full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email (Optional)</label>
                                        <input
                                            type="email"
                                            value={newMemberData.email}
                                            onChange={e => setNewMemberData({ ...newMemberData, email: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm font-semibold"
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone (Optional)</label>
                                        <input
                                            type="tel"
                                            value={newMemberData.phone}
                                            onChange={e => setNewMemberData({ ...newMemberData, phone: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm font-semibold"
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Family Role</label>
                                        <select
                                            value={newMemberData.familyRole}
                                            onChange={e => setNewMemberData({ ...newMemberData, familyRole: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm font-semibold"
                                        >
                                            <option value="HEAD">Head of Family</option>
                                            <option value="SPOUSE">Spouse</option>
                                            <option value="SON">Son</option>
                                            <option value="DAUGHTER">Daughter</option>
                                            <option value="MEMBER">Member</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => setShowAddMember(false)}
                                        className="px-5 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateMemberSubmit}
                                        disabled={!newMemberData.name || addingMember}
                                        className="px-5 py-2.5 rounded-xl bg-primary-800 text-white font-bold shadow-lg shadow-primary-900/20 hover:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {addingMember ? 'Creating...' : 'Create Member'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Link Family Modal */}
            {showLinkFamily && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLinkFamily(false)} />
                    <div className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Link Related Family</h3>
                            <p className="text-sm text-gray-500">Search for a family to link as related (e.g. cousins, siblings).</p>
                        </div>

                        <div className="mb-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search families..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all pl-10"
                                    onChange={(e) => setFamilySearchTerm(e.target.value)}
                                    autoFocus
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl bg-gray-50/50 min-h-[300px] mb-6">
                            {searchedFamilies.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    {familySearchTerm ? 'No matching families found.' : 'Search to find families.'}
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {searchedFamilies.map(f => (
                                        <div key={f.id} className="p-3 flex items-center justify-between hover:bg-white transition-colors">
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">{f.name}</p>
                                                {f.houseName && <p className="text-xs text-gray-500">{f.houseName}</p>}
                                                {f.address && <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{f.address}</p>}
                                            </div>
                                            <button
                                                onClick={() => handleLinkFamily(f.id)}
                                                disabled={linkingFamily}
                                                className="px-3 py-1.5 bg-primary-800 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-primary-900 transition-colors disabled:opacity-50"
                                            >
                                                {linkingFamily ? 'Linking...' : 'Link'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowLinkFamily(false)}
                                className="px-5 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
