import { Request, Response } from 'express';
import * as ministryService from '../services/ministry.service';

export const getAllMinistries = async (req: Request, res: Response) => {
    try {
        const ministries = await ministryService.getAllMinistries();
        res.json(ministries);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMinistryById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const ministry = await ministryService.getMinistryById(id);

        if (!ministry) {
            return res.status(404).json({ message: 'Ministry not found' });
        }

        res.json(ministry);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createMinistry = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Ministry name is required' });
        }

        const ministry = await ministryService.createMinistry({ name, description });
        res.status(201).json(ministry);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateMinistry = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const ministry = await ministryService.updateMinistry(id, req.body);
        res.json(ministry);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteMinistry = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await ministryService.deleteMinistry(id);
        res.json({ message: 'Ministry deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const assignLeader = async (req: Request, res: Response) => {
    try {
        const ministryId = parseInt(req.params.id as string);
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const member = await ministryService.assignLeader(ministryId, userId);
        res.json(member);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const addMember = async (req: Request, res: Response) => {
    try {
        const ministryId = parseInt(req.params.id as string);
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const member = await ministryService.addMember(ministryId, userId);
        res.status(201).json(member);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const removeMember = async (req: Request, res: Response) => {
    try {
        const ministryId = parseInt(req.params.id as string);
        const userId = parseInt(req.params.userId as string);

        await ministryService.removeMember(ministryId, userId);
        res.json({ message: 'Member removed successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
