import { Request, Response } from 'express';
import * as prayerService from '../services/prayer.service';

export const getAllPrayerRequests = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        const requests = await prayerService.getAllPrayerRequests({
            status: status as string,
        });
        res.json(requests);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const acknowledgePrayerRequest = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const request = await prayerService.acknowledgePrayerRequest(id);
        res.json(request);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updatePrayerRequestStatus = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const request = await prayerService.updatePrayerRequestStatus(id, status);
        res.json(request);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deletePrayerRequest = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await prayerService.deletePrayerRequest(id);
        res.json({ message: 'Prayer request deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
