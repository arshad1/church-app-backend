
import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as userService from '../services/user.service';

export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any).userId;
        const user = await userService.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any).userId;
        const { email, password, role, ...updatableData } = req.body; // Prevent updating sensitive fields directly here
        const user = await userService.updateUser(userId, updatableData);
        const { password: _p, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const { search, sort, order, page, limit } = req.query;
        const result = await userService.getAllUsers({
            search: search as string,
            sort: sort as string,
            order: order as 'asc' | 'desc',
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 10,
        });

        const usersWithoutPassword = result.data.map(({ password, ...user }: any) => user);
        res.json({
            data: usersWithoutPassword,
            meta: result.meta
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id as string);
        await userService.deleteUser(userId);
        res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const bulkDeleteUsers = async (req: Request, res: Response) => {
    try {
        const { userIds } = req.body;
        await userService.deleteManyUsers(userIds);
        res.json({ message: 'Users deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { email, password, role, memberId, username } = req.body;
        if ((!email && !username) || !password) {
            return res.status(400).json({ message: 'Email/Username and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userService.createUser({
            username,
            email,
            password: hashedPassword,
            role: role || 'MEMBER',
            memberId: memberId ? Number(memberId) : undefined
        });

        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id as string);
        const { password, ...data } = req.body;

        // If password is included and not empty, hash it
        if (password) {
            data.password = await bcrypt.hash(password, 10);
        }

        const user = await userService.updateUser(userId, data);
        const { password: _p, ...userWithoutPassword } = user; // user might be null if fallthrough, but types say it's User or update result
        res.json(userWithoutPassword);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const resetMemberPassword = async (req: Request, res: Response) => {
    try {
        const memberId = parseInt(req.params.memberId as string);
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const user = await userService.getUserByMemberId(memberId);
        if (!user) {
            // Attempt to create user if not exists (auto-create logic)
            // But for reset, we usually expect it to exist.
            // Check if member exists first
            // For now, return 404
            return res.status(404).json({ message: 'User account not found for this member' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await userService.updateUser(user.id, { password: hashedPassword });

        res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
