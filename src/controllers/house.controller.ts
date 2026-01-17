import { Request, Response } from 'express';
import * as houseService from '../services/house.service';
import * as memberService from '../services/member.service';

/**
 * Create a new house with optional head member
 */
export const createHouse = async (req: Request, res: Response) => {
    try {
        const { name, familyId, headMemberId, headMemberData } = req.body;

        if (!name || !familyId) {
            return res.status(400).json({ message: 'House name and family ID are required' });
        }

        // Create the house
        const house = await houseService.createHouse({ name, familyId });

        // If headMemberId is provided, update that member to be head and link to house
        if (headMemberId) {
            await memberService.updateMember(headMemberId, {
                houseId: house.id,
                headOfFamily: true,
                familyRole: 'HEAD'
            });
        }
        // If headMemberData is provided, create new member as head
        else if (headMemberData) {
            await memberService.createMember({
                ...headMemberData,
                familyId,
                houseId: house.id,
                headOfFamily: true,
                familyRole: 'HEAD',
                status: 'ACTIVE'
            });
        }

        // Fetch the house with members
        const houseWithMembers = await houseService.getHouseById(house.id);
        res.status(201).json(houseWithMembers);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get all houses for a family
 */
export const getHousesByFamily = async (req: Request, res: Response) => {
    try {
        const familyId = parseInt(req.params.familyId as string);
        const houses = await houseService.getHousesByFamily(familyId);
        res.json(houses);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get a single house by ID
 */
export const getHouseById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const house = await houseService.getHouseById(id);

        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }

        res.json(house);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Update house details
 */
export const updateHouse = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { name } = req.body;

        const house = await houseService.updateHouse(id, { name });
        res.json(house);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Delete a house
 */
export const deleteHouse = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);

        // Unlink all members from this house first
        await houseService.deleteHouse(id);

        res.json({ message: 'House deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
