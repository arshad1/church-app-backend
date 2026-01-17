import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { membersAPI, familiesAPI, uploadsAPI, housesAPI } from '../services/api';
import SearchableSelect from '../components/common/SearchableSelect';

interface Family {
    id: number;
    name: string;
    houseName?: string;
}

interface House {
    id: number;
    name: string;
}

export default function MemberForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        status: 'ACTIVE',
        familyId: '',
        houseId: '',
        spouseId: '',
        familyRole: 'MEMBER',
        profileImage: '',
        headOfFamily: false
    });

    const [families, setFamilies] = useState<Family[]>([]);
    const [houses, setHouses] = useState<House[]>([]);
    const [familyMembers, setFamilyMembers] = useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadFamilies();
        if (isEdit) {
            loadMember();
        }
    }, [id]);

    useEffect(() => {
        if (formData.familyId) {
            loadHouses(Number(formData.familyId));
            loadFamilyMembers(Number(formData.familyId));
        } else {
            setHouses([]);
            setFamilyMembers([]);
        }
    }, [formData.familyId]);

    const loadFamilies = async () => {
        try {
            const res = await familiesAPI.getAll();
            setFamilies(res.data);
        } catch (error) {
            console.error('Error loading families:', error);
        }
    };

    const loadHouses = async (familyId: number) => {
        try {
            const res = await housesAPI.getByFamily(familyId);
            setHouses(res.data);
        } catch (error) {
            console.error('Error loading houses:', error);
        }
    };

    const loadFamilyMembers = async (familyId: number) => {
        try {
            // Fetch members of the family to populate Spouse list
            const res = await membersAPI.getByFamily(familyId);
            setFamilyMembers(res.data);
        } catch (error) {
            console.error('Error loading family members:', error);
        }
    };

    const loadMember = async () => {
        try {
            setLoading(true);
            const res = await membersAPI.getById(Number(id));
            const member = res.data;
            setFormData({
                name: member.name || '',
                email: member.email || '',
                phone: member.phone || '',
                status: member.status || 'ACTIVE',
                familyId: member.family?.id?.toString() || '',
                houseId: member.houseId?.toString() || '',
                spouseId: member.spouseId?.toString() || '',
                familyRole: member.familyRole || 'MEMBER',
                profileImage: member.profileImage || '',
                headOfFamily: member.headOfFamily || false
            });
        } catch (error) {
            setError('Failed to load member profile');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleFamilyChange = (value: string | number) => {
        setFormData(prev => ({ ...prev, familyId: value.toString(), houseId: '', spouseId: '' }));
    };

    const handleHouseChange = (value: string | number) => {
        setFormData(prev => ({ ...prev, houseId: value.toString() }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const res = await uploadsAPI.upload(file);
            setFormData(prev => ({ ...prev, profileImage: res.data.url }));
        } catch (err: any) {
            setError('Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            setLoading(true);
            const payload = {
                ...formData,
                familyId: formData.familyId ? Number(formData.familyId) : null,
                houseId: formData.houseId ? Number(formData.houseId) : null,
                spouseId: formData.spouseId ? Number(formData.spouseId) : null,
            };

            if (isEdit) {
                await membersAPI.update(Number(id), payload);
                setSuccess('Directory profile updated successfully');
            } else {
                await membersAPI.create(payload);
                setSuccess('New member added to directory');
            }

            setTimeout(() => navigate('/members'), 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const familyOptions = families.map(f => ({
        id: f.id,
        label: f.name // Use just the name, or construct a label if houseName is crucial context: `${f.name} ${f.houseName ? `(${f.houseName})` : ''}`
    }));

    const houseOptions = houses.map(h => ({
        id: h.id,
        label: h.name
    }));

    return (
        <div className="max-w-4xl mx-auto space-y-8">
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
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                            {isEdit ? 'Edit Profile' : 'New Directory Profile'}
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">
                            Church member directory information
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    {/* Top Accent Bar */}
                    <div className="h-2 bg-gradient-to-r from-primary-600 via-primary-800 to-accent-600" />

                    <div className="p-8 space-y-10">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-4 bg-green-50 border border-green-100 text-green-600 rounded-2xl text-sm font-bold flex items-center gap-3">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {success}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Profile Image Column */}
                            <div className="space-y-4">
                                <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Photo</label>
                                <div className="relative group">
                                    <div className="w-full aspect-square rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-primary-300">
                                        {formData.profileImage ? (
                                            <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center p-6">
                                                <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Upload image</p>
                                            </div>
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Info Columns */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold text-gray-900"
                                            placeholder="Enter full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Contact Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium text-gray-900"
                                            placeholder="optional@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium text-gray-900"
                                            placeholder="+91 0000 0000"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <SearchableSelect
                                            label="Family"
                                            placeholder="Select Family"
                                            options={familyOptions}
                                            value={Number(formData.familyId)}
                                            onChange={handleFamilyChange}
                                        />
                                    </div>

                                    {formData.familyId && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <SearchableSelect
                                                label="House"
                                                placeholder="Select House (Optional)"
                                                options={houseOptions}
                                                value={Number(formData.houseId)}
                                                onChange={handleHouseChange}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Family Role</label>
                                        <select
                                            name="familyRole"
                                            value={formData.familyRole}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold text-gray-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1.25rem_center] bg-no-repeat"
                                        >
                                            <option value="HEAD">Head of Family</option>
                                            <option value="SPOUSE">Spouse</option>
                                            <option value="FATHER">Father</option>
                                            <option value="MOTHER">Mother</option>
                                            <option value="SON">Son</option>
                                            <option value="DAUGHTER">Daughter</option>
                                            <option value="MEMBER">Other Member</option>
                                        </select>
                                    </div>

                                    {formData.familyRole === 'SPOUSE' && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <SearchableSelect
                                                label="Spouse of"
                                                placeholder="Select Spouse"
                                                options={
                                                    // Filter members of same family, excluding self
                                                    familyMembers
                                                        .filter(m => String(m.id) !== String(id))
                                                        .map(m => ({ id: m.id, label: m.name }))
                                                }
                                                value={Number(formData.spouseId)}
                                                onChange={(val) => setFormData(prev => ({ ...prev, spouseId: val.toString() }))}
                                            />
                                        </div>
                                    )}

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Directory Status</label>
                                        <div className="flex gap-4">
                                            {['ACTIVE', 'PENDING_APPROVAL', 'INACTIVE'].map(status => (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, status }))}
                                                    className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.status === status
                                                        ? 'bg-primary-900 text-white border-primary-950 shadow-md'
                                                        : 'bg-white text-gray-400 border-gray-200 hover:border-primary-200'
                                                        }`}
                                                >
                                                    {status.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-8 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="headOfFamily"
                                id="headOfFamily"
                                checked={formData.headOfFamily}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor="headOfFamily" className="text-sm font-bold text-gray-600">Mark as Family Representative</label>
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/members')}
                                className="px-8 py-3.5 text-sm font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-10 py-3.5 bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-2xl text-sm font-black uppercase tracking-wider shadow-xl shadow-primary-900/20 hover:shadow-primary-900/40 hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                {isEdit ? 'Update Directory' : 'Save Profile'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
