
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
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        // Special handling for Mobile Daily Verses
        if (req.baseUrl.includes('/mobile') && type === 'BIBLE_VERSE') {
            const { getSettings } = require('../services/settings.service');
            const settings = await getSettings();

            if (settings.showRandomVerse) {
                // Fetch all verses (or a large subset) to pick random
                // Optimization: In a real app with millions of rows, use COUNT based random offset.
                // For now, fetching first 1000 is likely sufficient for church scale.
                const allVerses = await contentService.getContentByType(type, 1, 1000);
                if (allVerses.data.length > 0) {
                    const randomIndex = Math.floor(Math.random() * allVerses.data.length);
                    // Return as array to match expected format
                    return res.json([allVerses.data[randomIndex]]);
                }
            }
        }

        const content = await contentService.getContentByType(type, page, limit);
        res.json(content);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateContent = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { title, body, mediaUrl } = req.body;
        const content = await contentService.updateContent(id, title, body, mediaUrl);
        res.json(content);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteContent = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await contentService.deleteContent(id);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
