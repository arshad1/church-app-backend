import { Request, Response } from 'express';
import * as memberService from '../services/member.service';

export const getAllMembers = async (req: Request, res: Response) => {
    try {
        const { status, familyId, search } = req.query;
        const members = await memberService.getAllMembers({
            status: status as string,
            familyId: familyId ? parseInt(familyId as string) : undefined,
            search: search as string,
        });

        res.json(members);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMemberById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const member = await memberService.getMemberById(id);

        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        res.json(member);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createMember = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, role, status, familyId, profileImage, familyRole, houseId } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const member = await memberService.createMember({
            name,
            email,
            phone,
            profileImage,
            status,
            familyId: familyId ? Number(familyId) : undefined,
            familyRole,
            houseId: houseId ? Number(houseId) : undefined,
            spouseId: req.body.spouseId ? Number(req.body.spouseId) : undefined
        });

        res.status(201).json(member);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateMember = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { ...updateData } = req.body;

        const member = await memberService.updateMember(id, updateData);
        res.json(member);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteMember = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await memberService.deleteMember(id);
        res.json({ message: 'Member deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const approveMember = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const member = await memberService.approveMember(id);
        res.json(member);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const linkToFamily = async (req: Request, res: Response) => {
    try {
        const memberId = parseInt(req.params.id as string);
        const { familyId } = req.body;

        if (!familyId) {
            return res.status(400).json({ message: 'Family ID is required' });
        }

        const member = await memberService.linkToFamily(memberId, familyId);
        res.json(member);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const setHeadOfFamily = async (req: Request, res: Response) => {
    try {
        const memberId = parseInt(req.params.id as string);
        const { familyId } = req.body;

        if (!familyId) {
            return res.status(400).json({ message: 'Family ID is required' });
        }

        const member = await memberService.setHeadOfFamily(memberId, familyId);
        res.json(member);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getMembersByFamily = async (req: Request, res: Response) => {
    try {
        const familyId = parseInt(req.params.familyId as string);
        const members = await memberService.getMembersByFamily(familyId);
        res.json(members);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const bulkDeleteMembers = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;
        await memberService.deleteManyMembers(ids);
        res.json({ message: 'Members deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
