import { Request, Response } from 'express';
import * as settingsService from '../services/settings.service';

export const getChurchSettings = async (req: Request, res: Response) => {
    try {
        const settings = await settingsService.getChurchSettings();
        res.json(settings);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateChurchSettings = async (req: Request, res: Response) => {
    try {
        const settings = await settingsService.updateChurchSettings(req.body);
        res.json(settings);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
