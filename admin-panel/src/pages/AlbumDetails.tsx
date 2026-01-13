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

export default function AlbumDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [album, setAlbum] = useState<Album | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (id) loadAlbum();
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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadedUrls: string[] = [];
            // Upload files individually to get URLs (assuming uploadsAPI handles single file)
            // Parallel upload
            const uploadPromises = Array.from(files).map(file => uploadsAPI.upload(file));
            const responses = await Promise.all(uploadPromises);

            responses.forEach(res => {
                if (res.data && res.data.file && res.data.file.path) {
                    // Assuming API returns path relative to backend static serve
                    // Adjust URL construction based on your backend response
                    // If backend returns 'uploads/filename.jpg', and we serve static at BASE_URL/uploads
                    // We might need to prepend base URL or store relative path.
                    // Let's assume the upload API returns a usable URL or we construct it.
                    // Typically: http://localhost:5000/uploads/filename.jpg

                    // Note: uploadsAPI.upload typically returns { file: { filename, path, ... } }
                    // We need the full URL to store in DB or relative path. 
                    // Let's store full URL if possible or ensure backend handles it.
                    // For now, let's construct it assuming standard static serve
                    const fullUrl = `http://localhost:5000/${res.data.file.path.replace(/\\/g, '/')}`;
                    uploadedUrls.push(fullUrl);
                }
            });

            if (uploadedUrls.length > 0) {
                await galleryAPI.addImages(Number(id), uploadedUrls);
                await loadAlbum();
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Failed to upload images');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
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

            {/* Upload Section */}
            <div className="mb-8">
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center text-gray-500 hover:border-primary-500 hover:bg-primary-50/50 hover:text-primary-600 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                            <span className="font-bold animate-pulse">Uploading photos...</span>
                        </div>
                    ) : (
                        <>
                            <div className="p-3 bg-gray-100 rounded-full group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors mb-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </div>
                            <span className="font-bold">Click to upload photos</span>
                            <span className="text-xs mt-1 opacity-70">JPG, PNG supported</span>
                        </>
                    )}
                </button>
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

            {album.images.length === 0 && !uploading && (
                <div className="text-center py-12 text-gray-400 italic bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
                    No photos yet. Upload some memories!
                </div>
            )}
        </div>
    );
}
