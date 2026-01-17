import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import * as memberService from '../services/member.service';
import * as familyService from '../services/family.service';

/**
 * Get the current user's deep profile including Family and Member details.
 */
export const getMyProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any).userId;
        const user: any = await userService.getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Exclude sensitive data
        const { password, ...userWithoutPassword } = user;

        // Filter members by houseId if the user belongs to a house
        if (user.member?.houseId && user.member.family?.members) {
            user.member.family.members = user.member.family.members.filter(
                (m: any) => m.houseId === user.member!.houseId
            );
        }

        res.json(userWithoutPassword);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get a public directory of members.
 * Filters out inactive members and limits sensitive personal info if needed.
 */
export const getDirectory = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;

        const members = await memberService.getAllMembers({
            status: 'ACTIVE',
            search: (search as string) || ''
        });

        // Map to a simplified directory view if needed, or return full object
        // For now, returning full object but ensuring only ACTIVE members are shown
        res.json(members);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

import * as houseService from '../services/house.service';

/**
 * Allow a user to add a member to their family.
 * Validates that the user has a member profile and a family.
 */
export const addFamilyMember = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any).userId;
        const user = await userService.getUserById(userId);

        if (!user || !user.memberId) {
            return res.status(400).json({ message: 'User profile not linked to a member' });
        }

        const member = await memberService.getMemberById(user.memberId);
        if (!member || !member.familyId) {
            return res.status(400).json({ message: 'You are not linked to a family' });
        }

        const { name, familyRole, phone, email, dob, gender, houseName, houseId, spouseId } = req.body;

        let targetHouseId = houseId;

        // Validation for House logic
        if (familyRole === 'HEAD') {
            if (!houseName) {
                return res.status(400).json({ message: 'House Name is required when adding a Family Head' });
            }
            // Create a new House for this Head
            const newHouse = await houseService.createHouse({
                name: houseName,
                familyId: member.familyId
            });
            targetHouseId = newHouse.id;
        } else {
            // If not HEAD, must be assigned to a House
            // If houseId is provided, use it.
            // If not, default to the current user's house (if they have one)
            if (!targetHouseId) {
                if (member.houseId) {
                    targetHouseId = member.houseId;
                } else {
                    // Fallback: If the family has only one house, assign to it?
                    // Or require houseId if multiple houses exist?
                    // For simplicity, let's try to find a default house or error
                    const houses = await houseService.getHousesByFamily(member.familyId);
                    if (houses.length === 1) {
                        targetHouseId = houses[0].id;
                    } else if (houses.length > 1) {
                        return res.status(400).json({ message: 'Multiple houses found. Please specify a House ID.' });
                    }
                    // If 0 houses, and not adding a HEAD, this is an issue.
                    // But maybe we assume legacy families might not have houses yet.
                    // We can proceed without houseId in that case (as schema allows nullable)
                }
            }
        }

        const newMember = await memberService.createMember({
            name,
            familyRole: familyRole || 'MEMBER', // Default to MEMBER
            phone,
            email,
            familyId: member.familyId,
            status: 'ACTIVE', // Or PENDING if approval needed
            dob: dob ? new Date(dob) : undefined,
            gender,
            houseId: targetHouseId,
            spouseId: spouseId ? parseInt(spouseId) : undefined
        });

        // If the new member is a HEAD, we should probably mark them as headOfFamily=true?
        // But the schema implies headOfFamily is per Member, and House implies grouping.
        // We can set headOfFamily flag for the member if role is HEAD
        if (familyRole === 'HEAD') {
            // Note: This service function might need to be updated to support house-level head vs family-level head?
            // The current schema has `headOfFamily` boolean on Member.
            // If we have multiple houses, we might have multiple heads (one per house).
            // So we can set `headOfFamily: true` for them.
            await memberService.updateMember(newMember.id, { headOfFamily: true });
        }

        res.status(201).json(newMember);

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Allow a user to update a family member's details.
 * Validates that the user belongs to the same family as the member being updated.
 */
export const updateFamilyMember = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any).userId;
        const memberIdToUpdate = parseInt(req.params.memberId as string);

        const user = await userService.getUserById(userId);
        if (!user || !user.memberId) {
            return res.status(400).json({ message: 'User profile not linked to a member' });
        }

        const currentUserMember = await memberService.getMemberById(user.memberId);
        if (!currentUserMember || !currentUserMember.familyId) {
            return res.status(400).json({ message: 'You are not linked to a family' });
        }

        const memberToUpdate = await memberService.getMemberById(memberIdToUpdate);
        if (!memberToUpdate) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Check if the member belongs to the same family
        if (memberToUpdate.familyId !== currentUserMember.familyId) {
            return res.status(403).json({ message: 'You can only update members of your own family' });
        }

        const { name, phone, firstName, lastName, mobile, dob, relationship, gender } = req.body;

        // Construct update data - map PRD fields to schema fields if necessary
        // Assuming schema uses name, phone, familyRole, dob
        const updateData: any = {};

        if (name) {
            updateData.name = name;
        } else if (firstName || lastName) {
            updateData.name = `${firstName || ''} ${lastName || ''}`.trim();
        }

        if (phone) updateData.phone = phone;
        else if (mobile) updateData.phone = mobile;

        if (dob) updateData.dob = new Date(dob);
        if (relationship) updateData.familyRole = relationship;
        if (gender) updateData.gender = gender;
        if (req.body.profileImage) updateData.profileImage = req.body.profileImage;
        if (req.body.spouseId) updateData.spouseId = parseInt(req.body.spouseId);

        const updatedMember = await memberService.updateMember(memberIdToUpdate, updateData);

        res.json({ success: true, message: 'Family member updated successfully', member: updatedMember });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Allow a user to delete (soft delete) a family member.
 * Checks for family ownership.
 */
export const deleteFamilyMember = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any).userId;
        const memberIdToDelete = parseInt(req.params.memberId as string);

        const user = await userService.getUserById(userId);
        if (!user || !user.memberId) {
            return res.status(400).json({ message: 'User profile not linked to a member' });
        }

        const currentUserMember = await memberService.getMemberById(user.memberId);
        if (!currentUserMember || !currentUserMember.familyId) {
            return res.status(400).json({ message: 'You are not linked to a family' });
        }

        const memberToDelete = await memberService.getMemberById(memberIdToDelete);
        if (!memberToDelete) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Check if the member belongs to the same family
        if (memberToDelete.familyId !== currentUserMember.familyId) {
            return res.status(403).json({ message: 'You can only delete members of your own family' });
        }

        // Prevent deleting oneself via this endpoint (optional safety)
        if (memberToDelete.id === currentUserMember.id) {
            return res.status(400).json({ message: 'You cannot delete your own profile from here.' });
        }

        await memberService.deleteMember(memberIdToDelete);

        res.json({ success: true, message: 'Family member removed successfully' });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Allow a user to update their own family details (Name, Address, Phone, House Name).
 */
export const updateMyFamily = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any).userId;
        const user = await userService.getUserById(userId);

        if (!user || !user.memberId) {
            return res.status(400).json({ message: 'User profile not linked to a member' });
        }

        const member = await memberService.getMemberById(user.memberId);
        if (!member || !member.familyId) {
            return res.status(403).json({ message: 'You are not linked to a family' });
        }

        const { name, address, phone, houseName } = req.body;
        const updateData: any = {};

        if (name) updateData.name = name;
        if (address) updateData.address = address;
        if (phone) updateData.phone = phone;
        if (houseName) updateData.houseName = houseName;

        const updatedFamily = await familyService.updateFamily(member.familyId, updateData);

        res.json({ success: true, message: 'Family details updated', family: updatedFamily });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
