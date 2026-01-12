
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
        const { search, sort, order } = req.query;
        const users = await userService.getAllUsers({
            search: search as string,
            sort: sort as string,
            order: order as 'asc' | 'desc'
        });
        const usersWithoutPassword = users.map(({ password, ...user }) => user);
        res.json(usersWithoutPassword);
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
        const { email, password, role, memberId } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userService.createUser({
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
