import { Request, Response } from 'express';
import * as sacramentService from '../services/sacrament.service';

export const getAllSacraments = async (req: Request, res: Response) => {
    try {
        const { type, userId } = req.query;
        const sacraments = await sacramentService.getAllSacraments({
            type: type as string,
            userId: userId ? parseInt(userId as string) : undefined,
        });
        res.json(sacraments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getSacramentsByMember = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.memberId as string);
        const sacraments = await sacramentService.getSacramentsByMember(userId);
        res.json(sacraments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createSacrament = async (req: Request, res: Response) => {
    try {
        const { type, date, userId, details } = req.body;

        if (!type || !date || !userId) {
            return res.status(400).json({
                message: 'Type, date, and userId are required'
            });
        }

        const sacrament = await sacramentService.createSacrament({
            type,
            date: new Date(date),
            userId,
            details,
        });
        res.status(201).json(sacrament);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateSacrament = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { date, ...otherData } = req.body;

        const updateData = {
            ...otherData,
            ...(date && { date: new Date(date) }),
        };

        const sacrament = await sacramentService.updateSacrament(id, updateData);
        res.json(sacrament);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteSacrament = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await sacramentService.deleteSacrament(id);
        res.json({ message: 'Sacrament deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
