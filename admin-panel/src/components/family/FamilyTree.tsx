import { useNavigate } from 'react-router-dom';

interface Member {
    id: number;
    name?: string;
    email: string;
    role: string;
    familyRole?: string;
    headOfFamily?: boolean;
    profileImage?: string;
}

interface House {
    id: number;
    name: string;
    members: Member[];
}

interface Family {
    id: number;
    name: string;
    members?: Member[];
    houses?: House[];
}

interface FamilyTreeProps {
    family: Family;
    unassignedMembers?: Member[];
}

const MemberNode = ({ member }: { member: Member }) => {
    const navigate = useNavigate();

    return (
        <div
            className="flex flex-col items-center bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer min-w-[120px]"
            onClick={() => navigate(`/members/${member.id}`)}
        >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 mb-2">
                {member.profileImage ? (
                    <img src={member.profileImage} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-gray-500 font-bold text-sm">{member.name?.[0] || member.email?.[0]?.toUpperCase()}</span>
                )}
            </div>
            <p className="text-xs font-bold text-gray-900 text-center truncate w-full">{member.name || member.email}</p>
            <p className="text-[10px] text-gray-500 text-center">{member.familyRole || 'Member'}</p>
            {member.headOfFamily && (
                <span className="mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-yellow-100 text-yellow-800 uppercase tracking-wide">
                    Head
                </span>
            )}
        </div>
    );
};

export default function FamilyTree({ family, unassignedMembers = [] }: FamilyTreeProps) {
    const hasHouses = family.houses && family.houses.length > 0;
    const hasUnassigned = unassignedMembers.length > 0;

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 overflow-auto">
            <div className="flex flex-col items-center">
                {/* Family Root Node */}
                <div className="flex flex-col items-center mb-8 relative z-10">
                    <div className="p-4 bg-primary-800 text-white rounded-2xl shadow-lg border-2 border-primary-900 text-center min-w-[200px]">
                        <h2 className="text-lg font-bold">{family.name}</h2>
                        <p className="text-xs text-primary-200 mt-1 uppercase tracking-wider">Family Root</p>
                    </div>
                    {/* Vertical line connecting Family to Children */}
                    {(hasHouses || hasUnassigned) && (
                        <div className="w-px h-8 bg-gray-300"></div>
                    )}
                </div>

                {/* Container for Houses and Unassigned */}
                <div className="flex gap-12 items-start justify-center relative">
                    {/* Top horizontal connector line */}
                    {(hasHouses || hasUnassigned) && (
                        <div className="absolute top-0 left-10 right-10 h-px bg-gray-300 -translate-y-8 hidden"></div>
                        // Note: implementing perfect CSS tree structure lines is tricky without fixed widths.
                        // Using a simplified layout for now with visual grouping.
                    )}

                    {/* Houses */}
                    {family.houses?.map((house) => (
                        <div key={house.id} className="flex flex-col items-center">
                            {/* Connector from top */}
                            <div className="hidden w-px h-8 bg-gray-300 -mt-8 mb-4"></div>

                            {/* House Node */}
                            <div className="p-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm text-center mb-6 min-w-[150px]">
                                <p className="text-sm font-bold text-gray-800">{house.name}</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">House</p>
                            </div>

                            {/* Members in House */}
                            {house.members.length > 0 ? (
                                <div className="flex flex-wrap justify-center gap-4 relative pt-4">
                                    {/* Connector line for members */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-gray-200"></div>
                                    <div className="absolute top-0 left-4 right-4 h-px bg-gray-200"></div>

                                    {house.members.map(member => (
                                        <div key={member.id} className="flex flex-col items-center relative pt-4">
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-gray-200"></div>
                                            <MemberNode member={member} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">No members</p>
                            )}
                        </div>
                    ))}

                    {/* Unassigned Group */}
                    {hasUnassigned && (
                        <div className="flex flex-col items-center">
                            <div className="p-3 bg-gray-50 border border-gray-200 dashed rounded-xl text-center mb-6 min-w-[150px]">
                                <p className="text-sm font-bold text-gray-500">Direct Members</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">(Unassigned)</p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-4 relative pt-4">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-gray-200"></div>
                                <div className="absolute top-0 left-4 right-4 h-px bg-gray-200"></div>

                                {unassignedMembers.map(member => (
                                    <div key={member.id} className="flex flex-col items-center relative pt-4">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-gray-200"></div>
                                        <MemberNode member={member} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
