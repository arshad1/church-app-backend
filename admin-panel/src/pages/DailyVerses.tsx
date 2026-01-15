
import { useState, useEffect, useRef } from 'react';
import { contentAPI, uploadsAPI } from '../services/api';

interface Verse {
    id: number;
    title: string; // Reference e.g. "Jeremiah 29:11"
    body: string; // The verse text
    mediaUrl?: string; // Background image
    date: string;
}

export default function DailyVerses() {
    const [verses, setVerses] = useState<Verse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        mediaUrl: ''
    });

    // Upload State
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadVerses();
    }, []);

    const loadVerses = async () => {
        try {
            setLoading(true);
            const res = await contentAPI.getAll('BIBLE_VERSE');
            setVerses(res.data);
        } catch (error) {
            console.error('Error loading verses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        try {
            setUploading(true);
            const res = await uploadsAPI.upload(file);
            if (res.data && res.data.url) {
                setFormData(prev => ({ ...prev, mediaUrl: res.data.url }));
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.body) {
            alert('Please fill in Reference and Verse Text');
            return;
        }

        try {
            await contentAPI.create({
                type: 'BIBLE_VERSE',
                ...formData
            });
            setShowModal(false);
            setFormData({ title: '', body: '', mediaUrl: '' });
            loadVerses();
        } catch (error) {
            console.error('Error creating verse:', error);
            alert('Failed to create verse');
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Daily Verses</h1>
                    <p className="text-gray-500 mt-1">Manage Verse of the Day content</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-primary-800 text-white font-bold rounded-xl hover:bg-primary-900 transition-colors shadow-lg shadow-primary-900/20"
                >
                    + New Verse
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading verses...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {verses.map(verse => (
                        <div key={verse.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                            {/* Card Header / Image */}
                            <div className="h-48 relative bg-gray-100 flex items-center justify-center overflow-hidden">
                                {verse.mediaUrl ? (
                                    <>
                                        <img src={verse.mediaUrl} alt="Background" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40"></div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-primary-950 opacity-90"></div>
                                )}

                                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-80 mb-2">
                                        {new Date(verse.date).toLocaleDateString()}
                                    </span>
                                    <h3 className="font-bold text-xl">{verse.title}</h3>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1">
                                <p className="text-gray-600 italic font-serif leading-relaxed">
                                    "{verse.body}"
                                </p>
                            </div>
                        </div>
                    ))}

                    {verses.length === 0 && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                            <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <p>No verses added yet.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <h3 className="text-lg font-bold mb-6">Add Verse of the Day</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Scripture Reference</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                    placeholder="e.g. Jeremiah 29:11"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Verse Text</label>
                                <textarea
                                    value={formData.body}
                                    onChange={e => setFormData({ ...formData, body: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none h-32 resize-none font-serif"
                                    placeholder="For I know the plans I have for you..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Background Image (Optional)</label>
                                <div
                                    className="border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition-colors text-center"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {formData.mediaUrl ? (
                                        <div className="relative h-32 rounded-lg overflow-hidden">
                                            <img src={formData.mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs font-bold">
                                                Click to change
                                            </div>
                                        </div>
                                    ) : (
                                        uploading ? (
                                            <span className="text-sm text-gray-500">Uploading...</span>
                                        ) : (
                                            <div className="py-4">
                                                <span className="text-sm text-primary-600 font-bold block mb-1">Upload Image</span>
                                                <span className="text-xs text-gray-400">Recommended 16:9 or similar</span>
                                            </div>
                                        )
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500 font-bold">Cancel</button>
                                <button onClick={handleSubmit} className="px-4 py-2 bg-primary-800 text-white font-bold rounded-xl">Save Verse</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
