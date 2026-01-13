import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { galleryAPI, uploadsAPI } from '../services/api';

interface Image {
    id: number;
    url: string;
    caption?: string;
    createdAt: string;
}

interface Album {
    id: number;
    title: string;
    description?: string;
    date: string;
    categoryId: number;
    category: { id: number; name: string };
    images: Image[];
}

interface UploadItem {
    id: string; // unique ID for tracking
    file: File;
    previewUrl: string;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    uploadedUrl?: string; // stored after successful upload
}

export default function AlbumDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [album, setAlbum] = useState<Album | null>(null);
    const [loading, setLoading] = useState(true);

    // Upload State
    const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (id) loadAlbum();

        // Cleanup object URLs on unmount
        return () => {
            uploadQueue.forEach(item => URL.revokeObjectURL(item.previewUrl));
        };
    }, [id]);

    const loadAlbum = async () => {
        try {
            setLoading(true);
            const res = await galleryAPI.getAlbumById(Number(id));
            setAlbum(res.data);
        } catch (error) {
            console.error('Error loading album:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const newItems: UploadItem[] = Array.from(files).map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            previewUrl: URL.createObjectURL(file),
            progress: 0,
            status: 'pending'
        }));

        setUploadQueue(prev => [...prev, ...newItems]);

        // Clear input so same files can be selected again if needed (though typically not)
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const processUploadQueue = async () => {
        if (isUploading || uploadQueue.filter(i => i.status === 'pending').length === 0) return;

        setIsUploading(true);
        const pendingItems = uploadQueue.filter(i => i.status === 'pending');
        const successfulUrls: string[] = [];

        // Upload one by one or in small batches. Let's do parallel but capped ? 
        // For simplicity and better progress visibility, let's do parallel all.

        const uploadPromises = pendingItems.map(async (item) => {
            try {
                // Update status to uploading
                setUploadQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'uploading' } : i));

                const res = await uploadsAPI.upload(item.file, (progress) => {
                    setUploadQueue(prev => prev.map(i => i.id === item.id ? { ...i, progress } : i));
                });

                // Backend returns { url: "http://..." }
                if (res.data && res.data.url) {
                    const fullUrl = res.data.url;

                    setUploadQueue(prev => prev.map(i => i.id === item.id ? {
                        ...i,
                        status: 'completed',
                        progress: 100,
                        uploadedUrl: fullUrl
                    } : i));
                    return fullUrl;
                } else {
                    console.error('Invalid response format:', res.data);
                    throw new Error('Invalid response');
                }
            } catch (error) {
                console.error(`Error uploading ${item.file.name}:`, error);
                setUploadQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', progress: 0 } : i));
                return null;
            }
        });

        const results = await Promise.all(uploadPromises);

        // Collect successful URLs
        results.forEach(url => {
            if (url) successfulUrls.push(url);
        });

        // Link with album
        if (successfulUrls.length > 0) {
            try {
                await galleryAPI.addImages(Number(id), successfulUrls);
                // Refresh album to show new images
                await loadAlbum();

                // Clear completed items from queue after a short delay
                setTimeout(() => {
                    setUploadQueue(prev => prev.filter(i => i.status !== 'completed'));
                }, 2000); // Keep them visible for 2 seconds to show success
            } catch (error) {
                console.error('Error linking images to album:', error);
                alert('Images uploaded but failed to link to album.');
            }
        }

        setIsUploading(false);
    };

    const removeQueueItem = (itemId: string) => {
        setUploadQueue(prev => {
            const item = prev.find(i => i.id === itemId);
            if (item) URL.revokeObjectURL(item.previewUrl);
            return prev.filter(i => i.id !== itemId);
        });
    };

    const handleDeleteImage = async (imageId: number) => {
        if (!window.confirm('Delete this image?')) return;
        try {
            await galleryAPI.deleteImage(imageId);
            loadAlbum();
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    const handleDeleteAlbum = async () => {
        if (!window.confirm('Are you sure you want to delete this album and all its photos?')) return;
        try {
            await galleryAPI.deleteAlbum(Number(id));
            navigate('/gallery');
        } catch (error) {
            console.error('Error deleting album:', error);
            alert('Failed to delete album');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading album...</div>;
    if (!album) return <div className="p-8 text-center text-gray-500">Album not found</div>;

    const pendingCount = uploadQueue.filter(i => i.status === 'pending').length;

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/gallery')} className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">{album.title}</h1>
                        <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                            {album.category.name}
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                        {new Date(album.date).toLocaleDateString()} • {album.images.length} Photos
                    </p>
                </div>
                <button onClick={handleDeleteAlbum} className="text-red-500 hover:text-red-700 text-sm font-bold px-4 py-2">
                    Delete Album
                </button>
            </div>

            {/* Description */}
            {album.description && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 mb-8 max-w-3xl">
                    <p className="text-gray-600 leading-relaxed">{album.description}</p>
                </div>
            )}

            {/* Upload Area */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Upload Photos</h3>
                    {pendingCount > 0 && !isUploading && (
                        <button
                            onClick={processUploadQueue}
                            className="px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-900/10"
                        >
                            Start Upload ({pendingCount} files)
                        </button>
                    )}
                </div>

                <div className="p-6">
                    {/* Queue Grid */}
                    {uploadQueue.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                            {uploadQueue.map(item => (
                                <div key={item.id} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group border border-gray-200">
                                    <img src={item.previewUrl} alt="preview" className="w-full h-full object-cover" />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-2">
                                        {item.status === 'uploading' && (
                                            <div className="w-full text-center">
                                                <div className="text-white text-xs font-bold mb-1">{item.progress}%</div>
                                                <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary-500 transition-all duration-300"
                                                        style={{ width: `${item.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {item.status === 'completed' && (
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                        {item.status === 'error' && (
                                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg" title="Upload failed">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </div>
                                        )}
                                        {item.status === 'pending' && !isUploading && (
                                            <button
                                                onClick={() => removeQueueItem(item.id)}
                                                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/80"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Add More Button */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-500 hover:text-primary-500 hover:bg-primary-50 transition-all"
                            >
                                <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-xs font-bold">Add More</span>
                            </button>
                        </div>
                    )}

                    {/* Empty State / Initial Dropzone */}
                    {uploadQueue.length === 0 && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="h-40 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:border-primary-500 hover:bg-primary-50/30 hover:text-primary-600 transition-all cursor-pointer"
                        >
                            <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-bold text-lg">Drop photos here or click to upload</span>
                            <span className="text-sm opacity-60 mt-1">Select multiple files at once</span>
                        </div>
                    )}

                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Images Grid */}
            <div className="columns-1 md:columns-3 lg:columns-4 gap-6 space-y-6">
                {album.images.map(image => (
                    <div key={image.id} className="relative group break-inside-avoid">
                        <img
                            src={image.url}
                            alt={image.caption || 'Album photo'}
                            className="w-full rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-3 backdrop-blur-[2px]">
                            <button
                                onClick={() => window.open(image.url, '_blank')}
                                className="p-2 bg-white/20 text-white rounded-xl hover:bg-white/40 transition-colors backdrop-blur-md"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                            </button>
                            <button
                                onClick={() => handleDeleteImage(image.id)}
                                className="p-2 bg-white/20 text-white rounded-xl hover:bg-red-500/80 transition-colors backdrop-blur-md"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {album.images.length === 0 && (
                <div className="text-center py-12 text-gray-400 italic">
                    Gallery is empty. Select photos above to start uploading.
                </div>
            )}
        </div>
    );
}
