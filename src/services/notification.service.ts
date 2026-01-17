import prisma from '../utils/prisma';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin Logic
let isFirebaseInitialized = false;

export const initializeFirebase = async () => {
    if (admin.apps.length) {
        return; // Already initialized
    }

    try {
        // Try to fetch from DB settings first
        const settings = await prisma.churchSettings.findFirst();

        if (settings?.firebaseConfig) {
            const serviceAccount = JSON.parse(settings.firebaseConfig);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin Initialized from Database Settings');
            isFirebaseInitialized = true;
            return;
        }

        // Fallback to environment/default
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
        console.log('Firebase Admin Initialized from Default Credentials');
        isFirebaseInitialized = true;

    } catch (error) {
        console.warn('Failed to initialize Firebase Admin:', error);
    }
};

// Call init on load (optional, or call lazily)
initializeFirebase();

export const reinitializeFirebase = async () => {
    if (admin.apps.length) {
        await Promise.all(admin.apps.map(app => app?.delete()));
    }
    await initializeFirebase();
};

export const registerDeviceToken = async (userId: number, token: string, platform: string) => {
    return prisma.deviceToken.upsert({
        where: { token },
        update: { userId, platform },
        create: { userId, token, platform }
    });
};

export const getUserNotifications = async (userId: number, limit: number = 50) => {
    return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
    });
};

export const markAsRead = async (id: number) => {
    return prisma.notification.update({
        where: { id },
        data: { isRead: true }
    });
};

export const createNotification = async (userId: number, title: string, body: string, type: string = 'GENERAL', data?: string) => {
    const notification = await prisma.notification.create({
        data: {
            userId,
            title,
            body,
            type,
            data
        }
    });

    // Send Push Notification asynchronously
    sendPushToUser(userId, title, body, data).catch(console.error);

    return notification;
};

export const deleteNotification = async (id: number) => {
    return prisma.notification.delete({
        where: { id }
    });
};

// --- Push Notification Helpers ---

// Helper to ensure all data values are strings (FCM requirement)
const sanitizeDataForFCM = (dataStr?: string): { [key: string]: string } => {
    if (!dataStr) return {};
    try {
        const parsed = JSON.parse(dataStr);
        const sanitized: { [key: string]: string } = {};
        for (const key in parsed) {
            sanitized[key] = String(parsed[key]);
        }
        return sanitized;
    } catch (e) {
        console.warn('Failed to parse push notification data:', e);
        return {};
    }
};

export const sendPushToUser = async (userId: number, title: string, body: string, data?: string) => {
    try {
        const tokens = await prisma.deviceToken.findMany({
            where: { userId },
            select: { token: true }
        });

        if (tokens.length === 0) return;

        const message: admin.messaging.MulticastMessage = {
            tokens: tokens.map(t => t.token),
            notification: {
                title,
                body
            },
            data: sanitizeDataForFCM(data)
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Sent push to user ${userId}: ${response.successCount} success, ${response.failureCount} failed`);

        // Optional: Cleanup invalid tokens based on response errors
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
};

export const sendPushToAll = async (title: string, body: string, data?: string, isDraft: boolean = false) => {
    // Save to History first
    const status = isDraft ? 'DRAFT' : 'SENT';
    const history = await prisma.notificationHistory.create({
        data: {
            title,
            body,
            type: 'BROADCAST',
            data,
            status
        }
    });

    if (isDraft) return history;

    try {
        const message: admin.messaging.Message = {
            topic: 'all',
            notification: { title, body },
            data: sanitizeDataForFCM(data)
        };
        await admin.messaging().send(message);
    } catch (error) {
        console.error('Error sending broadcast push:', error);
        // Used background job for retries in a real production app.
    }
    return history;
};

export const updateBroadcast = async (id: number, title: string, body: string, data?: string, sendNow: boolean = false) => {
    const status = sendNow ? 'SENT' : 'DRAFT';

    // Update the history record
    const history = await prisma.notificationHistory.update({
        where: { id },
        data: {
            title,
            body,
            data,
            status,
            sentAt: sendNow ? new Date() : undefined // Update timestamp if sending now
        }
    });

    if (sendNow) {
        try {
            const message: admin.messaging.Message = {
                topic: 'all',
                notification: { title, body },
                data: data ? JSON.parse(data) : {}
            };
            await admin.messaging().send(message);
        } catch (error) {
            console.error('Error sending broadcast push from draft:', error);
        }
    }

    return history;
};

export const getBroadcastHistory = async (limit: number = 50) => {
    return prisma.notificationHistory.findMany({
        orderBy: { sentAt: 'desc' },
        take: limit
    });
};
