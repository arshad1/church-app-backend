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
        const user = await userService.getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Exclude sensitive data
        const { password, ...userWithoutPassword } = user;

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

        const { name, familyRole, phone, email, dob, gender } = req.body;

        const newMember = await memberService.createMember({
            name,
            familyRole: familyRole || 'MEMBER', // Default to MEMBER
            phone,
            email,
            familyId: member.familyId,
            status: 'ACTIVE', // Or PENDING if approval needed
            dob: dob ? new Date(dob) : undefined,
            gender
        });

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
