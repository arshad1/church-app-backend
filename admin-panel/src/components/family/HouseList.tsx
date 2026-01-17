import { useNavigate } from 'react-router-dom';
import { membersAPI, housesAPI } from '../../services/api';

const FAMILY_ROLES = ['HEAD', 'SPOUSE', 'FATHER', 'MOTHER', 'SON', 'DAUGHTER', 'GRANDFATHER', 'GRANDMOTHER', 'MEMBER'];

interface Member {
    id: number;
    name?: string;
    email: string;
    role: string;
    phone?: string;
    familyRole?: string;
    headOfFamily?: boolean;
    profileImage?: string;
    houseId?: number | null;
}

interface House {
    id: number;
    name: string;
    members: Member[];
}

interface HouseListProps {
    houses?: House[];
    unassignedMembers?: Member[];
    onRefresh: () => void;
    onAddMember: (houseId?: number) => void;
    familyMembers?: Member[]; // Full list for checking
}

export default function HouseList({ houses = [], unassignedMembers = [], onRefresh, onAddMember }: HouseListProps) {
    const navigate = useNavigate();

    const handleRoleChange = async (memberId: number, role: string) => {
        try {
            await membersAPI.update(memberId, { familyRole: role });
            onRefresh();
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Failed to update role');
        }
    };

    const handleRemoveMember = async (memberId: number) => {
        if (!window.confirm('Are you sure you want to remove this member from the family?')) return;
        try {
            await membersAPI.update(memberId, { familyId: null, familyRole: null, houseId: null });
            onRefresh();
        } catch (error) {
            console.error('Error removing member:', error);
            alert('Failed to remove member');
        }
    };

    const handleDeleteHouse = async (houseId: number) => {
        if (!window.confirm('Are you sure you want to delete this house? Members will be unassigned.')) return;
        try {
            await housesAPI.delete(houseId);
            onRefresh();
        } catch (error) {
            console.error('Error deleting house:', error);
            alert('Failed to delete house');
        }
    };

    const renderMemberList = (members: Member[], title: string, houseId?: number) => (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                        <span className="bg-primary-100 text-primary-800 text-xs font-bold px-2 py-1 rounded-lg mt-1 inline-block">
                            {members.length} Members
                        </span>
                    </div>
                    {houseId && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDeleteHouse(houseId)}
                                className="text-red-400 hover:text-red-600 transition-colors bg-red-50 p-2 rounded-lg"
                                title="Delete House"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => onAddMember(houseId)}
                    className="bg-primary-800 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary-900/20 hover:bg-primary-900 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Member
                </button>
            </div>

            {members.length > 0 ? (
                <div className="divide-y divide-gray-100">
                    {members.map((member) => (
                        <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-4">
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
                                    </div>
                                    <p className="text-xs text-gray-500 mb-1">{member.email || 'No login email'}</p>

                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Role:</span>
                                        <select
                                            value={member.familyRole || ''}
                                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
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
                    No members linked to this {houseId ? 'house' : 'family'} yet.
                    <br />
                    <span className="text-sm">Add members using the button above.</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Render Houses */}
            {houses.map(house => renderMemberList(house.members, house.name, house.id))}

            {/* Render Unassigned Members */}
            {unassignedMembers.length > 0 && renderMemberList(unassignedMembers, 'Unassigned Members')}

            {/* Fallback if nothing exists */}
            {houses.length === 0 && unassignedMembers.length === 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                    <p className="text-gray-500 mb-4">No houses or members found.</p>
                    <p className="text-sm text-gray-400">Start by creating a house or adding members.</p>
                </div>
            )}
        </div>
    );
}
