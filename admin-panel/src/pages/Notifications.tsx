import { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';

export default function Notifications() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isDraftAction, setIsDraftAction] = useState(false);

    // History State
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await notificationsAPI.getHistory();
            setHistory(res.data);
        } catch (error) {
            console.error('Failed to fetch history', error);
        }
    };

    const handleEdit = (item: any) => {
        setTitle(item.title);
        setBody(item.body);
        setEditingId(item.id);
        // Scroll to form
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setTitle('');
        setBody('');
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (editingId) {
                // Update existing draft (Send Now or Update Draft)
                const sendNow = !isDraftAction;
                await notificationsAPI.updateBroadcast(editingId, title, body, {}, sendNow);
                alert(sendNow ? 'Broadcast sent successfully!' : 'Draft updated successfully!');
            } else {
                // Create new (Send Now or Save Draft)
                await notificationsAPI.broadcast(title, body, {}, isDraftAction);
                alert(isDraftAction ? 'Draft saved successfully!' : 'Broadcast sent successfully!');
            }

            setTitle('');
            setBody('');
            setEditingId(null);
            fetchHistory(); // Refresh list
        } catch (error) {
            console.error(error);
            alert('Failed to process request');
        } finally {
            setLoading(false);
            setIsDraftAction(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Push Notifications</h1>

            <div className="flex flex-col gap-8">
                {/* Broadcast History (Top) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Broadcast History</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                                    <th className="py-3 px-4 font-semibold">Date</th>
                                    <th className="py-3 px-4 font-semibold">Title</th>
                                    <th className="py-3 px-4 font-semibold">Body</th>
                                    <th className="py-3 px-4 font-semibold">Status</th>
                                    <th className="py-3 px-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-500">
                                            No broadcasts sent yet.
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((item: any) => (
                                        <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                                                {new Date(item.sentAt).toLocaleDateString()} {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                                                {item.title}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600 max-w-md truncate" title={item.body}>
                                                {item.body}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-md ${item.status === 'DRAFT'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {item.status || 'SENT'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {item.status === 'DRAFT' && (
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Send Broadcast Form (Bottom) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">
                            {editingId ? 'Edit Draft' : 'Send New Broadcast'}
                        </h2>
                        {editingId && (
                            <button
                                onClick={handleCancelEdit}
                                className="text-sm text-gray-500 hover:text-gray-700 underline"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mb-6">Send a push notification to all users who have the app installed.</p>

                    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g. Sunday Service Reminder"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                            <textarea
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 h-32"
                                placeholder="Enter your message here..."
                                required
                            />
                        </div>

                        <div className="pt-2 flex gap-4">
                            <button
                                type="submit"
                                onClick={() => setIsDraftAction(true)}
                                disabled={loading}
                                className="flex-1 md:flex-none px-8 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                {loading && isDraftAction ? 'Saving...' : 'Save Draft'}
                            </button>

                            <button
                                type="submit"
                                onClick={() => setIsDraftAction(false)}
                                disabled={loading}
                                className="flex-1 md:flex-none px-8 py-2 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                            >
                                {loading && !isDraftAction ? 'Sending...' : 'Send Broadcast'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
