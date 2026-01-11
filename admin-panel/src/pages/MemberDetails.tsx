import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { membersAPI } from '../services/api';

interface Sacrament {
    id: number;
    type: string;
    date: string;
    details?: string;
}

interface MinistryMember {
    ministry: {
        id: number;
        name: string;
        description?: string;
    };
    isLeader: boolean;
}

interface EventRegistration {
    event: {
        id: number;
        title: string;
        date: string;
        location?: string;
    };
    status: string;
    registeredAt: string;
}

interface Member {
    id: number;
    name?: string;
    email?: string;
    phone?: string;
    status: string;
    profileImage?: string;
    family?: {
        id: number;
        name: string;
        address?: string;
        phone?: string;
    };
    sacraments?: Sacrament[];
    ministryMembers?: MinistryMember[];
    eventRegistrations?: EventRegistration[];
    user?: {
        role: string;
        email: string;
    };
    createdAt: string;
}

export default function MemberDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [member, setMember] = useState<Member | null>(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState('overview');

    useEffect(() => {
        if (id) loadMember(id);
    }, [id]);

    const loadMember = async (memberId: string) => {
        try {
            setLoading(true);
            const res = await membersAPI.getById(Number(memberId));
            setMember(res.data);
        } catch (error) {
            console.error('Error loading member:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDING_APPROVAL': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'INACTIVE': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status: string): string => {
        switch (status) {
            case 'ACTIVE': return 'Active';
            case 'PENDING_APPROVAL': return 'Pending';
            case 'INACTIVE': return 'Inactive';
            default: return status;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh] text-gray-500 font-medium">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mr-3" />
                Accessing directory archives...
            </div>
        );
    }

    if (!member) {
        return (
            <div className="text-center mt-12 bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-black text-gray-900">Profile Not Found</h3>
                <p className="text-gray-500 mt-2 font-medium">This directory record does not exist or has been removed.</p>
                <button
                    onClick={() => navigate('/members')}
                    className="mt-8 px-8 py-3 bg-primary-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary-900/20"
                >
                    Return to Directory
                </button>
            </div>
        );
    }

    const appRole = member.user?.role || 'DIRECTORY ONLY';

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/members')}
                        className="p-2 rounded-xl bg-white text-gray-400 hover:text-primary-600 shadow-sm border border-gray-100 transition-all hover:scale-110"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Profile Details</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Directory ID: #{member.id}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/members/${id}/edit`)}
                    className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-2xl hover:border-primary-500 hover:text-primary-600 transition-all font-black text-xs uppercase tracking-widest text-gray-600 shadow-sm hover:shadow-md"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modify Records
                </button>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 p-10 border border-gray-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <svg className="w-64 h-64 text-primary-900" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-start relative z-10">
                    <div className="flex-shrink-0">
                        <div className="w-44 h-44 rounded-3xl bg-gray-50 border-4 border-white shadow-2xl overflow-hidden group">
                            {member.profileImage ? (
                                <img src={member.profileImage} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-800 to-black text-white text-6xl font-black">
                                    {member.name?.[0]}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-4">
                                <h1 className="text-4xl font-black text-gray-900 leading-none">{member.name}</h1>
                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${getStatusColor(member.status)}`}>
                                    {getStatusLabel(member.status)}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-primary-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-primary-900/20">
                                    {appRole}
                                </span>
                                <span className="text-gray-400 font-bold text-lg">/</span>
                                <span className="text-gray-500 font-bold text-sm tracking-tight">{member.email || 'NO CONTACT MAIL'}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6 border-t border-gray-100">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Member Since</p>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-black text-gray-900">{formatDate(member.createdAt)}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Direct Phone</p>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span className="font-black text-gray-900">{member.phone || 'N/A'}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Family Unit</p>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className="font-black text-gray-900">{member.family?.name || 'Unassigned'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-gray-100/50 p-2 rounded-2xl inline-flex gap-2">
                {[
                    { id: 'overview', label: 'Summary', icon: 'M4 6h16M4 12h16M4 18h7' },
                    { id: 'sacraments', label: 'Sacraments', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
                    { id: 'ministries', label: 'Ministries', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                    { id: 'events', label: 'Registrations', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setTabValue(tab.id)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${tabValue === tab.id
                            ? 'bg-white text-primary-900 shadow-sm'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                        </svg>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {tabValue === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* More detailed info cards could go here */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-black text-gray-900 mb-6">Family Registry</h3>
                            {member.family ? (
                                <div className="space-y-6">
                                    <div
                                        onClick={() => navigate(`/families/${member.family?.id}`)}
                                        className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary-300 transition-all cursor-pointer group"
                                    >
                                        <p className="text-2xl font-black text-primary-900">{member.family.name}</p>
                                        <p className="text-sm text-gray-500 mt-1 font-medium">{member.family.address || 'No address registered'}</p>
                                        <div className="mt-4 flex items-center gap-2 text-primary-600 font-black text-[10px] uppercase tracking-widest">
                                            View Family Circle
                                            <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <p className="text-gray-400 font-bold">This member is not yet linked to a family unit.</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-black text-gray-900 mb-6">Technical Metadata</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">App Access Role</span>
                                    <span className="text-sm font-black text-accent-700">{appRole}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Profile Status</span>
                                    <span className="text-sm font-black text-primary-800">{member.status}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Internal Hash ID</span>
                                    <span className="text-sm font-black text-gray-600">M-{member.id.toString().padStart(5, '0')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {tabValue === 'sacraments' && (
                    <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                        {member.sacraments && member.sacraments.length > 0 ? (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Holy Sacrament</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date Observed</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ecclesiastical Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {member.sacraments.map((s) => (
                                        <tr key={s.id} className="hover:bg-primary-50/20 transition-colors">
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-primary-50 text-primary-800 border border-primary-100 rounded-lg font-black text-xs uppercase tracking-widest">{s.type}</span>
                                            </td>
                                            <td className="px-8 py-6 font-bold text-gray-900">{formatDate(s.date)}</td>
                                            <td className="px-8 py-6 text-sm text-gray-500 italic font-medium">{s.details || 'Canonical records verified'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-20 text-center text-gray-300 font-black uppercase tracking-[0.3em] text-sm">
                                No sacramental records found
                            </div>
                        )}
                    </div>
                )}

                {tabValue === 'ministries' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {member.ministryMembers && member.ministryMembers.length > 0 ? (
                            member.ministryMembers.map((mm, i) => (
                                <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-xl font-black text-gray-900 leading-tight">{mm.ministry.name}</h4>
                                        {mm.isLeader && (
                                            <span className="px-2 py-1 bg-accent-600 text-white text-[9px] font-black uppercase tracking-widest rounded shadow-sm">Leader</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{mm.ministry.description || 'Dedicated ministry service'}</p>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                                <p className="text-gray-400 font-black uppercase tracking-[0.2em]">No active ministry affiliations</p>
                            </div>
                        )}
                    </div>
                )}

                {tabValue === 'events' && (
                    <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                        {member.eventRegistrations && member.eventRegistrations.length > 0 ? (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Council Gathering</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Event Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {member.eventRegistrations.map((r, i) => (
                                        <tr key={i} className="hover:bg-primary-50/20 transition-colors">
                                            <td className="px-8 py-6 font-black text-primary-900">{r.event.title}</td>
                                            <td className="px-8 py-6 font-bold text-gray-700">{formatDate(r.event.date)}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${r.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-20 text-center text-gray-300 font-black uppercase tracking-[0.3em] text-sm">
                                No event registrations recorded
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
