
import { Request, Response } from 'express';
import * as contentService from '../services/content.service';

// Announcements
export const createAnnouncement = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any).userId;
        const { title, content } = req.body;
        const announcement = await contentService.createAnnouncement(userId, title, content);
        res.status(201).json(announcement);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAnnouncements = async (req: Request, res: Response) => {
    try {
        const announcements = await contentService.getAnnouncements();
        res.json(announcements);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Content
export const createContent = async (req: Request, res: Response) => {
    try {
        const { type, title, body, mediaUrl } = req.body;
        const content = await contentService.createContent(type, title, body, mediaUrl);
        res.status(201).json(content);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getContent = async (req: Request, res: Response) => {
    try {
        const type = (req.params.type as string).toUpperCase(); // Ensure uppercase for consistency
        const content = await contentService.getContentByType(type);
        res.json(content);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
