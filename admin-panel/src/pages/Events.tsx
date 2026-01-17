import { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';
import moment from 'moment';

// Update Interface
interface Event {
    id: number;
    title: string;
    description?: string;
    date: string;
    location?: string;
    isLive: boolean;
    liveUrl?: string;
    status: 'DRAFT' | 'PUBLISHED';
    registrations?: any[];
    isFeatured: boolean; // Added
}

export default function Events() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'ALL' | 'LIVE' | 'FEATURED'>('ALL'); // Added FEATURED view if needed

    // Modal & Form States
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: moment().format('YYYY-MM-DDTHH:mm'),
        location: '',
        isLive: false,
        liveUrl: '',
        status: 'DRAFT',
        isFeatured: false // Added
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const res = await eventsAPI.getAll();
            setEvents(res.data);
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClick = () => {
        setEditingEvent(null);
        setFormData({
            title: '',
            description: '',
            date: moment().format('YYYY-MM-DDTHH:mm'),
            location: '',
            isLive: false,
            liveUrl: '',
            status: 'DRAFT',
            isFeatured: false
        });
        setShowModal(true);
    };

    const handleEditClick = (event: Event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description || '',
            date: moment(event.date).format('YYYY-MM-DDTHH:mm'),
            location: event.location || '',
            isLive: event.isLive,
            liveUrl: event.liveUrl || '',
            // Handle legacy events without status by defaulting to PUBLISHED
            status: event.status || 'PUBLISHED',
            isFeatured: event.isFeatured || false
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent, statusOverride?: string) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const dataToSubmit = {
                ...formData,
                date: new Date(formData.date).toISOString(),
                status: statusOverride || formData.status
            };

            if (editingEvent) {
                await eventsAPI.update(editingEvent.id, dataToSubmit);
            } else {
                await eventsAPI.create(dataToSubmit);
            }
            setShowModal(false);
            loadEvents();
        } catch (error) {
            console.error('Error saving event:', error);
            alert('Failed to save event');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePublish = async (id: number, title: string) => {
        if (!window.confirm(`Are you sure you want to publish "${title}"? This will notify all members.`)) return;
        try {
            await eventsAPI.publish(id);
            alert(`Event "${title}" published successfully! Members have been notified.`);
            loadEvents();
        } catch (error) {
            console.error('Error publishing event:', error);
            alert('Failed to publish event');
        }
    };

    const filteredEvents = view === 'ALL'
        ? events
        : view === 'LIVE' ? events.filter(e => e.isLive) : events.filter(e => e.isFeatured);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Events Management</h2>
                    <p className="text-sm text-gray-500 mt-1">Schedule services, meetings, and live streams</p>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-900/20 hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Event
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-100">
                <button
                    onClick={() => setView('ALL')}
                    className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${view === 'ALL' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    All Events
                </button>
                <button
                    onClick={() => setView('LIVE')}
                    className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${view === 'LIVE' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Live & Streamed
                </button>
                <button
                    onClick={() => setView('FEATURED')}
                    className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${view === 'FEATURED' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Featured
                </button>
            </div>

            {/* Events Grid */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading events...</div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-3xl border border-gray-100">
                    <p className="font-medium">No events found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                        <div key={event.id} className={`bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-shadow relative ${event.isFeatured ? 'border-yellow-200 bg-yellow-50/10' : 'border-gray-100'}`}>
                            {/* Badges */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                {event.isFeatured && (
                                    <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border border-yellow-200">
                                        FEATURED
                                    </span>
                                )}
                                {event.isLive && (
                                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border border-red-100 animate-pulse">
                                        LIVE
                                    </span>
                                )}
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border
                                    ${event.status === 'PUBLISHED' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                    {event.status || 'PUBLISHED'}
                                </span>
                            </div>

                            {/* Date & Title */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className="text-center bg-gray-50 rounded-xl p-2 min-w-[60px] border border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase">
                                        {moment(event.date).format('MMM')}
                                    </p>
                                    <p className="text-xl font-black text-gray-900 leading-none mt-0.5">
                                        {moment(event.date).format('DD')}
                                    </p>
                                </div>
                                <div className="flex-1 pt-1">
                                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 line-clamp-2">{event.title}</h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {event.location || 'Online'}
                                    </p>
                                </div>
                            </div>

                            {/* Additional Info */}
                            {event.isLive && event.liveUrl && (
                                <div className="mb-4 bg-red-50/50 p-2 rounded-lg border border-red-100/50">
                                    <a href={event.liveUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-red-600 flex items-center gap-1 hover:underline">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                        </svg>
                                        Watch Stream
                                    </a>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditClick(event)}
                                        className="text-xs font-bold text-gray-500 hover:text-primary-600 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button className="text-xs font-bold text-gray-500 hover:text-red-600 px-2 py-1 rounded hover:bg-gray-50 transition-colors">
                                        Delete
                                    </button>
                                </div>
                                {event.status === 'DRAFT' && (
                                    <button
                                        onClick={() => handlePublish(event.id, event.title)}
                                        className="text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                    >
                                        Publish
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                            {editingEvent ? 'Edit Event' : 'Create New Event'}
                        </h3>
                        <form onSubmit={(e) => handleSubmit(e)}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                        placeholder="e.g. Sunday Service"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                            placeholder="e.g. Main Sanctuary"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none"
                                    />
                                </div>

                                {/* Event Settings */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">

                                    {/* Featured Toggle */}
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            <div className={`w-8 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${formData.isFeatured ? 'bg-yellow-500' : 'bg-gray-300'}`} onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}>
                                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isFeatured ? 'translate-x-3' : 'translate-x-0'}`} />
                                            </div>
                                            Featured Event (Show on Home)
                                        </label>
                                    </div>

                                    {/* Live Event Settings */}
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            <div className={`w-8 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${formData.isLive ? 'bg-red-500' : 'bg-gray-300'}`} onClick={() => setFormData({ ...formData, isLive: !formData.isLive })}>
                                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isLive ? 'translate-x-3' : 'translate-x-0'}`} />
                                            </div>
                                            Is this a Live Event?
                                        </label>
                                    </div>

                                    {formData.isLive && (
                                        <div className="animate-fade-in pt-2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Stream URL (YouTube/Other)</label>
                                            <input
                                                type="url"
                                                value={formData.liveUrl}
                                                onChange={e => setFormData({ ...formData, liveUrl: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none bg-white"
                                                placeholder="https://youtube.com/watch?v=..."
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-5 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    {!editingEvent || editingEvent.status === 'DRAFT' ? (
                                        <>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="px-5 py-2.5 rounded-xl border-2 border-primary-100 text-primary-700 font-bold hover:bg-primary-50 hover:border-primary-200 transition-colors"
                                            >
                                                Save as Draft
                                            </button>
                                            <button
                                                type="button"
                                                disabled={submitting}
                                                onClick={(e) => handleSubmit(e, 'PUBLISHED')}
                                                className="px-5 py-2.5 rounded-xl bg-primary-600 text-white font-bold shadow-lg shadow-primary-900/20 hover:bg-primary-700 transition-colors"
                                            >
                                                Publish Now
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="px-5 py-2.5 rounded-xl bg-primary-600 text-white font-bold shadow-lg shadow-primary-900/20 hover:bg-primary-700 transition-colors"
                                        >
                                            Update Event
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
