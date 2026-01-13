import prisma from '../utils/prisma';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (Wrapped in try-catch to avoid crashing if config is missing)
try {
    if (!admin.apps.length) {
        // Check if service account is available via env or file
        // For now, we'll assume it's set up later or use default app credentials
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
        console.log('Firebase Admin Initialized');
    }
} catch (error) {
    console.warn('Failed to initialize Firebase Admin:', error);
}

export const registerDeviceToken = async (userId: number, token: string, platform: string) => {
    return prisma.deviceToken.upsert({
        where: { token },
        update: { userId, platform },
        create: { userId, token, platform }
    });
};

export const getUserNotifications = async (userId: number) => {
    return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
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
            data: data ? JSON.parse(data) : {}
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Sent push to user ${userId}: ${response.successCount} success, ${response.failureCount} failed`);

        // Optional: Cleanup invalid tokens based on response errors
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
};

export const sendPushToAll = async (title: string, body: string, data?: string) => {
    // NOTE: effective strategy for "All" depends on scale.
    // For < 1000 devices, fetching all tokens works.
    // For larger, use Firebase Topics ('all_members').
    // Here we'll toggle to Topic if needed, but let's implement Topic subscription logic later.
    // For now, let's assume Topic 'all' is subscribed by mobile app on login.
    try {
        const message: admin.messaging.Message = {
            topic: 'all',
            notification: { title, body },
            data: data ? JSON.parse(data) : {}
        };
        await admin.messaging().send(message);
    } catch (error) {
        console.error('Error sending broadcast push:', error);
    }
};
