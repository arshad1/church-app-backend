import { Request, Response } from 'express';
import * as familyService from '../services/family.service';

export const getAllFamilies = async (req: Request, res: Response) => {
    try {
        const families = await familyService.getAllFamilies();
        res.json(families);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getFamilyById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const family = await familyService.getFamilyById(id);

        if (!family) {
            return res.status(404).json({ message: 'Family not found' });
        }

        res.json(family);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createFamily = async (req: Request, res: Response) => {
    try {
        const { name, address, phone } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Family name is required' });
        }

        const family = await familyService.createFamily({ name, address, phone });
        res.status(201).json(family);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateFamily = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const family = await familyService.updateFamily(id, req.body);
        res.json(family);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteFamily = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await familyService.deleteFamily(id);
        res.json({ message: 'Family deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
