import { Request, Response } from 'express';
import * as familyService from '../services/family.service';

/**
 * Get all families for directory view
 */
export const getAllFamilies = async (req: Request, res: Response) => {
    try {
        const families = await familyService.getAllFamilies();
        res.json(families);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
