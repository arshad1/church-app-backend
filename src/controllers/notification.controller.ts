import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';

export const getMyNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any).userId;
        const notifications = await notificationService.getUserNotifications(userId);
        res.json(notifications);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const registerToken = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any).userId;
        const { token, platform } = req.body;
        if (!token || !platform) {
            return res.status(400).json({ message: 'Token and platform are required' });
        }
        await notificationService.registerDeviceToken(userId, token, platform);
        res.json({ message: 'Device token registered' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Admin: Send notification to a specific user
 */
export const sendToUser = async (req: Request, res: Response) => {
    try {
        const { userId, title, body, type, data } = req.body;
        const notification = await notificationService.createNotification(userId, title, body, type, JSON.stringify(data));
        res.status(201).json(notification);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Admin: Send broadcast (Push Only for now, implies no DB record per user unless we batch create)
 * Or create a system-wide announcement triggered push.
 */
export const sendBroadcast = async (req: Request, res: Response) => {
    try {
        const { title, body, data, draft } = req.body;
        await notificationService.sendPushToAll(title, body, JSON.stringify(data), draft);
        res.json({ message: draft ? 'Draft saved' : 'Broadcast sent' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateBroadcast = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { title, body, data, sendNow } = req.body;
        await notificationService.updateBroadcast(id, title, body, JSON.stringify(data), sendNow);
        res.json({ message: sendNow ? 'Broadcast sent' : 'Draft updated' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const markRead = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const notification = await notificationService.markAsRead(id);
        res.json(notification);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteNotification = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await notificationService.deleteNotification(id);
        res.json({ message: 'Notification deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getBroadcasts = async (req: Request, res: Response) => {
    try {
        const history = await notificationService.getBroadcastHistory();
        res.json(history);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
