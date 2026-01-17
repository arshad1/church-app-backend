import { Request, Response } from 'express';
import * as familyService from '../services/family.service';

export const getAllFamilies = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;

        const result = await familyService.getAllFamilies(page, limit, search);
        res.json(result);
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
        const { name, address, phone, houseName } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Family name is required' });
        }

        // Auto-generate houseName if not provided
        let finalHouseName = houseName;
        if (!finalHouseName) {
            // Generate random 6 digit string
            finalHouseName = Math.floor(100000 + Math.random() * 900000).toString();
        }

        const family = await familyService.createFamily({ name, address, phone, houseName: finalHouseName });
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

export const addRelatedFamily = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { relatedFamilyId } = req.body;

        if (!relatedFamilyId) {
            return res.status(400).json({ message: 'Related Family ID is required' });
        }

        if (id === parseInt(relatedFamilyId)) {
            return res.status(400).json({ message: 'Cannot link family to itself' });
        }

        const family = await familyService.addRelatedFamily(id, parseInt(relatedFamilyId));
        res.json(family);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const removeRelatedFamily = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const relatedFamilyId = parseInt(req.params.relatedFamilyId as string);

        const result = await familyService.removeRelatedFamily(id, relatedFamilyId);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
