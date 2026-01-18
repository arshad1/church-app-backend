import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { galleryAPI } from '../services/api';

interface Category {
    id: number;
    name: string;
    _count?: { albums: number };
}

interface Album {
    id: number;
    title: string;
    description?: string;
    coverImage?: string;
    date: string;
    categoryId: number;
    _count?: { images: number };
}

export default function Gallery() {
    const navigate = useNavigate();
    const [activeTab] = useState<'albums' | 'categories'>('albums');
    const [categories, setCategories] = useState<Category[]>([]);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
    // const [loading, setLoading] = useState(true);

    // Modals
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showAlbumModal, setShowAlbumModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Form Data
    const [categoryName, setCategoryName] = useState('');
    const [albumData, setAlbumData] = useState({ title: '', description: '', categoryId: '', date: new Date().toISOString().split('T')[0] });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (activeTab === 'albums') {
            loadAlbums();
        }
    }, [selectedCategory, activeTab]);

    const loadData = async () => {
        try {
            const catRes = await galleryAPI.getAllCategories();
            setCategories(catRes.data);
            await loadAlbums();
        } catch (error) {
            console.error('Error loading gallery data:', error);
        } finally {
            // setLoading(false);
        }
    };

    const loadAlbums = async () => {
        try {
            const res = await galleryAPI.getAllAlbums(selectedCategory === 'all' ? undefined : selectedCategory);
            setAlbums(res.data);
        } catch (error) {
            console.error('Error loading albums:', error);
        }
    };

    const handleCreateCategory = async () => {
        if (!categoryName) return;
        try {
            if (editingCategory) {
                await galleryAPI.updateCategory(editingCategory.id, categoryName);
            } else {
                await galleryAPI.createCategory(categoryName);
            }
            setShowCategoryModal(false);
            setCategoryName('');
            setEditingCategory(null);
            loadData();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category');
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm('Are you sure? This will delete all albums in this category.')) return;
        try {
            await galleryAPI.deleteCategory(id);
            loadData();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category');
        }
    };

    const handleCreateAlbum = async () => {
        if (!albumData.title || !albumData.categoryId) return;
        try {
            await galleryAPI.createAlbum({
                ...albumData,
                categoryId: Number(albumData.categoryId),
                date: new Date(albumData.date)
            });
            setShowAlbumModal(false);
            setAlbumData({ title: '', description: '', categoryId: '', date: new Date().toISOString().split('T')[0] });
            loadAlbums();
        } catch (error) {
            console.error('Error creating album:', error);
            alert('Failed to create album');
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
                    <p className="text-gray-500 mt-1">Manage photo albums and categories</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setEditingCategory(null);
                            setCategoryName('');
                            setShowCategoryModal(true);
                        }}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Manage Categories
                    </button>
                    <button
                        onClick={() => setShowAlbumModal(true)}
                        className="px-4 py-2 bg-primary-800 text-white font-bold rounded-xl hover:bg-primary-900 transition-colors shadow-lg shadow-primary-900/20"
                    >
                        + New Album
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === 'all'
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                        }`}
                >
                    All Albums
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat.id
                            ? 'bg-gray-900 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                            }`}
                    >
                        {cat.name} <span className="opacity-60 ml-1 text-xs">{cat._count?.albums || 0}</span>
                    </button>
                ))}
            </div>

            {/* Albums Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {albums.map(album => (
                    <div
                        key={album.id}
                        onClick={() => navigate(`/gallery/albums/${album.id}`)}
                        className="group bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                            {album.coverImage ? (
                                <img
                                    src={album.coverImage}
                                    alt={album.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-3 right-3 text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                                {album._count?.images || 0} Photos
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors truncate">{album.title}</h3>
                            <p className="text-xs text-gray-500 mt-1">{new Date(album.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCategoryModal(false)} />
                    <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-bold mb-4">{editingCategory ? 'Edit Category' : 'Manage Categories'}</h3>

                        {/* List Existing (if not editing) */}
                        {!editingCategory && (
                            <div className="mb-6 space-y-2 max-h-40 overflow-y-auto">
                                {categories.map(cat => (
                                    <div key={cat.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-sm">{cat.name}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEditingCategory(cat); setCategoryName(cat.name); }} className="text-blue-600 hover:text-blue-800 text-xs font-bold">Edit</button>
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700 text-xs font-bold">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    {editingCategory ? 'Edit Name' : 'New Category Name'}
                                </label>
                                <input
                                    type="text"
                                    value={categoryName}
                                    onChange={e => setCategoryName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                    placeholder="e.g. Youth Camp 2024"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }} className="px-4 py-2 text-gray-500 font-bold">Cancel</button>
                                <button onClick={handleCreateCategory} className="px-4 py-2 bg-primary-800 text-white font-bold rounded-xl">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Album Modal */}
            {showAlbumModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAlbumModal(false)} />
                    <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <h3 className="text-lg font-bold mb-6">Create New Album</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Album Title</label>
                                <input
                                    type="text"
                                    value={albumData.title}
                                    onChange={e => setAlbumData({ ...albumData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                    placeholder="Enter album title"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                <select
                                    value={albumData.categoryId}
                                    onChange={e => setAlbumData({ ...albumData, categoryId: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                                <input
                                    type="date"
                                    value={albumData.date}
                                    onChange={e => setAlbumData({ ...albumData, date: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description (Optional)</label>
                                <textarea
                                    value={albumData.description}
                                    onChange={e => setAlbumData({ ...albumData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none h-24 resize-none"
                                    placeholder="Enter description..."
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button onClick={() => setShowAlbumModal(false)} className="px-4 py-2 text-gray-500 font-bold">Cancel</button>
                                <button onClick={handleCreateAlbum} className="px-4 py-2 bg-primary-800 text-white font-bold rounded-xl">Create Album</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
