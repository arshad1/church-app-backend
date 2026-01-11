import { Request, Response } from 'express';
import * as reportService from '../services/report.service';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const stats = await reportService.getDashboardStats();
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMemberGrowthReport = async (req: Request, res: Response) => {
    try {
        const months = req.query.months ? parseInt(req.query.months as string) : 12;
        const report = await reportService.getMemberGrowthReport(months);
        res.json(report);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMinistryParticipationReport = async (req: Request, res: Response) => {
    try {
        const report = await reportService.getMinistryParticipationReport();
        res.json(report);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getEventAttendanceReport = async (req: Request, res: Response) => {
    try {
        const report = await reportService.getEventAttendanceReport();
        res.json(report);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getSacramentReport = async (req: Request, res: Response) => {
    try {
        const report = await reportService.getSacramentReport();
        res.json(report);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
