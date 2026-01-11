import { useState, useEffect } from 'react';
import { ministriesAPI } from '../services/api';

interface Ministry {
    id: number;
    name: string;
    description?: string;
    members?: any[];
}

export default function Ministries() {
    const [ministries, setMinistries] = useState<Ministry[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Ministries</h2>
                    <p className="text-sm text-gray-500 mt-1">Church departments and groups</p>
                </div>
                <button
                    className="bg-gray-100 text-gray-400 px-5 py-2.5 rounded-xl font-bold cursor-not-allowed flex items-center gap-2 border border-gray-200"
                    disabled
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
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ministries.map((ministry) => (
                        <div key={ministry.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-accent-50 text-accent-700 rounded-xl">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{ministry.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                                {ministry.description || 'No description provided.'}
                            </p>
                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Members</span>
                                <span className="bg-gray-100 text-gray-700 font-bold px-2 py-1 rounded-lg">
                                    {ministry.members?.length || 0}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
