import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HouseList from '../components/family/HouseList';
import FamilyTreeD3 from '../components/family/FamilyTreeD3';
import AddHouseModal from '../components/family/AddHouseModal';
import AddMemberModal from '../components/family/AddMemberModal';
import { familiesAPI } from '../services/api';

interface Member {
    id: number;
    name?: string;
    email: string;
    role: string;
    phone?: string;
    familyRole?: string;
    headOfFamily?: boolean;
    profileImage?: string;
    spouse?: {
        id: number;
        name: string;
        profileImage?: string;
    };
}

interface Family {
    id: number;
    name: string;
    houseName?: string;
    address?: string;
    phone?: string;
    members?: Member[];
    houses?: { id: number; name: string; members: Member[] }[];
    relatedFamilies?: { id: number; name: string; houseName?: string }[];
    createdAt: string;
}

export default function FamilyDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [family, setFamily] = useState<Family | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');

    // Modals State
    const [showAddHouse, setShowAddHouse] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [targetHouseId, setTargetHouseId] = useState<number | null>(null);

    // Related Families Logic
    const [showLinkFamily, setShowLinkFamily] = useState(false);
    const [familySearchTerm, setFamilySearchTerm] = useState('');
    const [searchedFamilies, setSearchedFamilies] = useState<Family[]>([]);
    const [linkingFamily, setLinkingFamily] = useState(false);

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

    const handleAddMemberClick = (houseId?: number) => {
        setTargetHouseId(houseId || null);
        setShowAddMember(true);
    };

    // Related Families Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (showLinkFamily) searchFamilies(familySearchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [familySearchTerm, showLinkFamily]);

    const searchFamilies = async (term: string) => {
        try {
            const res = await familiesAPI.getAll();
            const allFamilies = res.data;
            const filtered = allFamilies.filter((f: Family) =>
                f.id !== Number(id) &&
                !family?.relatedFamilies?.some(rf => rf.id === f.id) &&
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

    if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
    if (!family) return <div className="text-center py-12 text-gray-500">Family not found</div>;

    // Separate unassigned members
    // API returns 'houses' array with members, and 'members' array for those without house (or all members for legacy)
    // We rely on the API structure. If `houses` exists, we use it. `members` on top level might contain all.
    // Based on `familyService`, `members` contains ones with `houseId: null`.
    const unassignedMembers = family.members || [];

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

                        {/* Add House Button */}
                        <button
                            onClick={() => setShowAddHouse(true)}
                            className="mt-4 w-full px-4 py-2 rounded-xl bg-primary-800 text-white font-bold shadow-lg hover:bg-primary-900 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add House
                        </button>
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

                {/* Main Content Area */}
                <div className="lg:col-span-2">
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
                        <HouseList
                            houses={family.houses}
                            unassignedMembers={unassignedMembers}
                            onRefresh={loadFamily}
                            onAddMember={handleAddMemberClick}
                        />
                    )}

                    {viewMode === 'tree' && (
                        <FamilyTreeD3 family={family} unassignedMembers={unassignedMembers} />
                    )}
                </div>
            </div>

            {/* Modals */}
            <AddHouseModal
                isOpen={showAddHouse}
                onClose={() => setShowAddHouse(false)}
                onSuccess={loadFamily}
                familyId={Number(id)}
                familyMembers={family.members} // All members to select head from
            />

            <AddMemberModal
                isOpen={showAddMember}
                onClose={() => setShowAddMember(false)}
                onSuccess={loadFamily}
                familyId={Number(id)}
                houseId={targetHouseId}
                currentMemberIds={family.members?.map(m => m.id) || []}
                familyName={family.name}
            />

            {/* Link Family Modal - Keeping inline for now or can be refactored too */}
            {showLinkFamily && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLinkFamily(false)} />
                    <div className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        {/* ... Link Family Content same as before ... */}
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Link Related Family</h3>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search families..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200"
                                onChange={(e) => setFamilySearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="max-h-[300px] overflow-auto mb-4">
                            {searchedFamilies.map(f => (
                                <div key={f.id} className="p-3 flex justify-between hover:bg-gray-50">
                                    <span>{f.name}</span>
                                    <button onClick={() => handleLinkFamily(f.id)} disabled={linkingFamily} className="text-primary-700 font-bold">Link</button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowLinkFamily(false)} className="w-full py-2 text-gray-500">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
