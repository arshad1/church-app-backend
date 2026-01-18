
import { useState, useEffect, useRef } from 'react';
import { contentAPI, uploadsAPI, settingsAPI } from '../services/api';

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

    // Editing state
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form Data
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        mediaUrl: ''
    });

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit] = useState(9); // 9 for grid layout (3x3)
    const [total, setTotal] = useState(0);

    // Settings State
    const [showRandomVerse, setShowRandomVerse] = useState(false);

    // Upload State
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadVerses();
    }, [page, limit]);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await settingsAPI.get();
            setShowRandomVerse(res.data.showRandomVerse);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const toggleRandomVerse = async () => {
        try {
            const newValue = !showRandomVerse;
            await settingsAPI.update({ showRandomVerse: newValue });
            setShowRandomVerse(newValue);
        } catch (error) {
            console.error('Error updating settings:', error);
            alert('Failed to update settings');
        }
    };

    const loadVerses = async () => {
        try {
            setLoading(true);
            const res = await contentAPI.getAll('BIBLE_VERSE', { page, limit });
            // Handle both old array format (fallback) and new paginated format
            if (res.data.data) {
                setVerses(res.data.data);
                setTotal(res.data.meta.total);
            } else {
                setVerses(res.data);
                setTotal(res.data.length);
            }
        } catch (error) {
            console.error('Error loading verses:', error);
            // Handle error (e.g., toast)
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

    const handleEdit = (verse: Verse) => {
        setEditingId(verse.id);
        setFormData({
            title: verse.title,
            body: verse.body,
            mediaUrl: verse.mediaUrl || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this verse?')) return;

        try {
            await contentAPI.delete(id);
            loadVerses();
        } catch (error) {
            console.error('Error deleting verse:', error);
            alert('Failed to delete verse');
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.body) {
            alert('Please fill in Reference and Verse Text');
            return;
        }

        try {
            setSaving(true);
            if (editingId) {
                await contentAPI.update(editingId, {
                    type: 'BIBLE_VERSE',
                    ...formData
                });
            } else {
                await contentAPI.create({
                    type: 'BIBLE_VERSE',
                    ...formData
                });
            }
            setShowModal(false);
            setEditingId(null);
            setFormData({ title: '', body: '', mediaUrl: '' });
            loadVerses(); // Refresh list after edit or create
        } catch (error) {
            console.error('Error saving verse:', error);
            alert('Failed to save verse');
        } finally {
            setSaving(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ title: '', body: '', mediaUrl: '' });
    };

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Daily Verses</h1>
                    <p className="text-gray-500 mt-1">Manage Verse of the Day content</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Settings Toggle */}
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                        <span className="text-sm font-bold text-gray-600">Mobile: Random Verse</span>
                        <button
                            onClick={toggleRandomVerse}
                            className={`w-12 h-6 rounded-full transition-colors relative ${showRandomVerse ? 'bg-primary-600' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${showRandomVerse ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ title: '', body: '', mediaUrl: '' });
                            setShowModal(true);
                        }}
                        className="px-4 py-2 bg-primary-800 text-white font-bold rounded-xl hover:bg-primary-900 transition-colors shadow-lg shadow-primary-900/20"
                    >
                        + New Verse
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading verses...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {verses.map(verse => (
                        <div key={verse.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group relative">
                            {/* Action Buttons */}
                            <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(verse)}
                                    className="p-2 bg-white/90 text-primary-700 rounded-lg backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
                                    title="Edit"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(verse.id)}
                                    className="p-2 bg-white/90 text-red-600 rounded-lg backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
                                    title="Delete"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>

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
                                <p className="text-gray-600 italic font-serif leading-relaxed line-clamp-4">
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

            {/* Pagination */}
            {!loading && total > 0 && (
                <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                    <span className="text-sm text-gray-500">
                        Showing <span className="font-bold text-gray-900">{(page - 1) * limit + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * limit, total)}</span> of <span className="font-bold text-gray-900">{total}</span> verses
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(Math.min(5, Math.ceil(total / limit)))].map((_, i) => {
                                // Simple logic to show first 5 pages or so. Better implementation needed for many pages.
                                // For now, just showing page numbers 1-5 or less.
                                let pageNum = i + 1;
                                if (page > 3 && Math.ceil(total / limit) > 5) {
                                    pageNum = page - 2 + i;
                                    if (pageNum > Math.ceil(total / limit)) return null;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${page === pageNum ? 'bg-primary-600 text-white shadow-md' : 'hover:bg-gray-100 text-gray-600'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page >= Math.ceil(total / limit)}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal} />
                    <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <h3 className="text-lg font-bold mb-6">{editingId ? 'Edit Verse' : 'Add Verse of the Day'}</h3>

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
                                <button onClick={handleCloseModal} className="px-4 py-2 text-gray-500 font-bold">Cancel</button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving || uploading}
                                    className="px-4 py-2 bg-primary-800 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : (editingId ? 'Update Verse' : 'Save Verse')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
