import { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';

interface Event {
    id: number;
    title: string;
    date: string;
    location?: string;
    registrations?: any[];
}

export default function Events() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Events</h2>
                    <p className="text-sm text-gray-500 mt-1">Upcoming gatherings and services</p>
                </div>
                <button
                    className="bg-gray-100 text-gray-400 px-5 py-2.5 rounded-xl font-bold cursor-not-allowed flex items-center gap-2 border border-gray-200"
                    disabled
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Event
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading events...</div>
            ) : events.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-3xl border border-gray-100">
                    <p className="font-medium">No events found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-primary-50 text-primary-700 rounded-xl">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                                    </p>
                                    <p className="text-xl font-black text-gray-900 leading-none">
                                        {new Date(event.date).getDate()}
                                    </p>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h3>
                            <p className="text-sm text-gray-500 mb-4">{event.location || 'Location TBA'}</p>

                            <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Registrations</span>
                                <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded-lg">
                                    {event.registrations?.length || 0}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
