import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ministriesAPI } from '../services/api';

interface Ministry {
    id: number;
    name: string;
    description?: string;
    members?: any[];
}

export default function Ministries() {
    const navigate = useNavigate();
    const [ministries, setMinistries] = useState<Ministry[]>([]);
    const [loading, setLoading] = useState(true);

    // Create Modal State
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', description: '' });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadMinistries();
    }, []);

    const loadMinistries = async () => {
        try {
            setLoading(true);
            const res = await ministriesAPI.getAll();
            setMinistries(res.data);
        } catch (error) {
            console.error('Error loading ministries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await ministriesAPI.create(createForm);
            loadMinistries();
            setShowCreate(false);
            setCreateForm({ name: '', description: '' });
        } catch (error) {
            console.error('Error creating ministry:', error);
            alert('Failed to create ministry');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Ministries</h2>
                    <p className="text-sm text-gray-500 mt-1">Church departments and groups</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="bg-gradient-to-r from-primary-600 to-primary-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 border border-primary-700/50"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Ministry
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading ministries...</div>
            ) : ministries.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-3xl border border-gray-100">
                    <p className="font-medium">No ministries found</p>
                    <p className="text-sm mt-1">Create a new ministry to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ministries.map((ministry) => (
                        <div
                            key={ministry.id}
                            onClick={() => navigate(`/ministries/${ministry.id}`)}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-primary-50 text-primary-700 rounded-xl group-hover:bg-primary-100 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <svg className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{ministry.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                                {ministry.description || 'No description provided.'}
                            </p>
                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Members</span>
                                <span className="bg-gray-100 text-gray-700 font-bold px-2 py-1 rounded-lg group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
                                    {ministry.members?.length || 0}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
                    <div className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Ministry</h3>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ministry Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Worship Team"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Ministry purpose and details..."
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="px-5 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-5 py-2.5 rounded-xl bg-primary-700 text-white font-bold shadow-lg shadow-primary-900/20 hover:bg-primary-800 transition-colors disabled:opacity-50"
                                >
                                    {creating ? 'Creating...' : 'Create Ministry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
