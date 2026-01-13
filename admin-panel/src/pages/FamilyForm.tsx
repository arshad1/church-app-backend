import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { familiesAPI } from '../services/api';

export default function FamilyForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        houseName: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isEdit) {
            loadFamily();
        }
    }, [id]);

    const loadFamily = async () => {
        try {
            setLoading(true);
            const res = await familiesAPI.getById(Number(id));
            const family = res.data;
            setFormData({
                name: family.name,
                address: family.address || '',
                phone: family.phone || '',
                houseName: family.houseName || '',
            });
        } catch (error) {
            setError('Failed to load family data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            setLoading(true);
            if (isEdit) {
                await familiesAPI.update(Number(id), formData);
                setSuccess('Family updated successfully');
            } else {
                await familiesAPI.create(formData);
                setSuccess('Family created successfully');
            }

            setTimeout(() => navigate('/families'), 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

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
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isEdit ? 'Edit Family' : 'Add New Family'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {isEdit ? 'Update family information' : 'Create a new family profile'}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-8 max-w-2xl mx-auto border border-gray-100">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Family Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. The Smiths"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            House Name / Unique ID <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            name="houseName"
                            value={formData.houseName}
                            onChange={handleChange}
                            placeholder="e.g. Thekkan House (Leave blank to auto-generate ID)"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1.5 ml-1">
                            Used to distinguish families with the same name. If left blank, a unique 6-digit ID will be generated.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/families')}
                            className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-700 to-primary-900 text-white font-bold shadow-lg shadow-primary-900/30 hover:shadow-primary-900/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-primary-800"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            {loading ? 'Saving...' : isEdit ? 'Update Family' : 'Create Family'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
