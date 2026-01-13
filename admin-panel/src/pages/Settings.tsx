import { useState, useEffect } from 'react';
import { settingsAPI, uploadsAPI } from '../services/api';
import { useSettings } from '../contexts/SettingsContext';

interface Settings {
    id: number;
    churchName: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logoUrl?: string;
    firebaseConfig?: string;
}

export default function Settings() {
    const { refreshSettings } = useSettings();
    const [settings, setSettings] = useState<Settings>({
        id: 0,
        churchName: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        website: '',
    });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const res = await settingsAPI.get();
            setSettings(res.data);
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await settingsAPI.update(settings);
            alert('Settings saved successfully!');
            refreshSettings(); // Sync UI
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        try {
            setUploading(true);
            const file = e.target.files[0];
            const res = await uploadsAPI.upload(file);
            setSettings(prev => ({ ...prev, logoUrl: res.data.url }));
        } catch (error) {
            console.error('Error uploading logo:', error);
            alert('Failed to upload logo');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="text-center py-12 text-gray-500">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Church Settings</h2>
            <p className="text-gray-500 mb-8">Manage your church profile and general configuration.</p>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Profile Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-50">General Info</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Logo</label>
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                                    {settings.logoUrl ? (
                                        <img src={settings.logoUrl} alt="Church Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors"
                                    />
                                    <p className="text-xs text-gray-400 mt-2">Recommended: 400x400px PNG or JPG</p>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Church Name</label>
                            <input
                                type="text"
                                required
                                value={settings.churchName}
                                onChange={e => setSettings({ ...settings, churchName: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                rows={3}
                                value={settings.description || ''}
                                onChange={e => setSettings({ ...settings, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-50">Contact Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                            <input
                                type="text"
                                value={settings.address || ''}
                                onChange={e => setSettings({ ...settings, address: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                            <input
                                type="text"
                                value={settings.phone || ''}
                                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={settings.email || ''}
                                onChange={e => setSettings({ ...settings, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Website</label>
                            <input
                                type="url"
                                value={settings.website || ''}
                                onChange={e => setSettings({ ...settings, website: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Firebase Configuration */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-50">Firebase Configuration</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Service Account JSON</label>
                            <p className="text-xs text-gray-400 mb-2">
                                Paste the content of your Firebase Service Account JSON file here.
                                (Project Settings {'>'} Service accounts {'>'} Generate new private key)
                            </p>
                            <textarea
                                rows={10}
                                value={settings.firebaseConfig || ''}
                                onChange={e => setSettings({ ...settings, firebaseConfig: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-mono text-xs"
                                placeholder='{ "type": "service_account", ... }'
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={uploading}
                        className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary-900/20 hover:bg-primary-700 transition-colors flex items-center gap-2"
                    >
                        {uploading ? 'Uploading...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
