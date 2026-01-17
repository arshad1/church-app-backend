import { useState, useEffect } from 'react';
import { membersAPI } from '../../services/api';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    familyId: number;
    houseId?: number | null;
    currentMemberIds: number[];
    familyName: string;
}

export default function AddMemberModal({ isOpen, onClose, onSuccess, familyId, houseId, currentMemberIds, familyName }: AddMemberModalProps) {
    const [viewState, setViewState] = useState<'search' | 'create'>('search');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [addingMember, setAddingMember] = useState(false);

    // New Member Form State
    const [newMemberData, setNewMemberData] = useState({
        name: '',
        email: '',
        phone: '',
        familyRole: 'MEMBER'
    });

    useEffect(() => {
        if (isOpen && viewState === 'search') {
            const timer = setTimeout(() => {
                fetchMembers(searchTerm);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [searchTerm, isOpen, viewState]);

    const fetchMembers = async (term: string) => {
        try {
            const res = await membersAPI.getAll({ limit: 1000, search: term });
            const available = res.data.filter((m: any) => !currentMemberIds.includes(m.id));
            setFilteredMembers(available);
        } catch (error) {
            console.error('Error searching members:', error);
        }
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
                membersAPI.update(Number(memberId), {
                    familyId,
                    houseId: houseId || null
                })
            ));
            onSuccess();
            onClose();
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
                familyId,
                houseId: houseId || null,
                status: 'ACTIVE'
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating member:', error);
            alert('Failed to create new member');
        } finally {
            setAddingMember(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Add Family Members</h3>
                    <p className="text-sm text-gray-500">
                        {houseId ? 'Adding to House' : `Manage members for`} <span className="font-bold text-primary-800">{familyName}</span>
                    </p>
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
                                onClick={onClose}
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
                                onClick={onClose}
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
    );
}
