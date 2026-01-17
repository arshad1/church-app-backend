import { useState } from 'react';
import { housesAPI } from '../../services/api';

interface AddHouseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    familyId: number;
    familyMembers?: any[];
}

export default function AddHouseModal({ isOpen, onClose, onSuccess, familyId, familyMembers = [] }: AddHouseModalProps) {
    const [newHouseData, setNewHouseData] = useState({
        name: '',
        headOption: 'new' as 'new' | 'existing',
        headMemberId: '',
        headMemberData: { name: '', email: '', phone: '' }
    });
    const [creatingHouse, setCreatingHouse] = useState(false);

    const handleCreateHouse = async () => {
        if (!newHouseData.name) {
            alert('House name is required');
            return;
        }

        setCreatingHouse(true);
        try {
            const payload: any = {
                name: newHouseData.name,
                familyId
            };

            if (newHouseData.headOption === 'existing' && newHouseData.headMemberId) {
                payload.headMemberId = Number(newHouseData.headMemberId);
            } else if (newHouseData.headOption === 'new' && newHouseData.headMemberData.name) {
                payload.headMemberData = newHouseData.headMemberData;
            }

            await housesAPI.create(payload);
            setNewHouseData({ name: '', headOption: 'new', headMemberId: '', headMemberData: { name: '', email: '', phone: '' } });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating house:', error);
            alert('Failed to create house');
        } finally {
            setCreatingHouse(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Add New House</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">House Name</label>
                        <input
                            type="text"
                            value={newHouseData.name}
                            onChange={e => setNewHouseData({ ...newHouseData, name: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                            placeholder="e.g., North House"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Head of House</label>
                        <div className="flex gap-2 mb-3">
                            <button
                                onClick={() => setNewHouseData({ ...newHouseData, headOption: 'new' })}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${newHouseData.headOption === 'new' ? 'bg-primary-800 text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                New Member
                            </button>
                            <button
                                onClick={() => setNewHouseData({ ...newHouseData, headOption: 'existing' })}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${newHouseData.headOption === 'existing' ? 'bg-primary-800 text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                Existing Member
                            </button>
                        </div>

                        {newHouseData.headOption === 'new' ? (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={newHouseData.headMemberData.name}
                                    onChange={e => setNewHouseData({ ...newHouseData, headMemberData: { ...newHouseData.headMemberData, name: e.target.value } })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
                                />
                                <input
                                    type="email"
                                    placeholder="Email (optional)"
                                    value={newHouseData.headMemberData.email}
                                    onChange={e => setNewHouseData({ ...newHouseData, headMemberData: { ...newHouseData.headMemberData, email: e.target.value } })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone (optional)"
                                    value={newHouseData.headMemberData.phone}
                                    onChange={e => setNewHouseData({ ...newHouseData, headMemberData: { ...newHouseData.headMemberData, phone: e.target.value } })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
                                />
                            </div>
                        ) : (
                            <select
                                value={newHouseData.headMemberId}
                                onChange={e => setNewHouseData({ ...newHouseData, headMemberId: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
                            >
                                <option value="">Select a member</option>
                                {familyMembers.map(m => (
                                    <option key={m.id} value={m.id}>{m.name || m.email}</option>
                                ))}
                            </select>
                        )}
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
                        onClick={handleCreateHouse}
                        disabled={!newHouseData.name || creatingHouse}
                        className="px-5 py-2.5 rounded-xl bg-primary-800 text-white font-bold shadow-lg shadow-primary-900/20 hover:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {creatingHouse ? 'Creating...' : 'Create House'}
                    </button>
                </div>
            </div>
        </div>
    );
}
