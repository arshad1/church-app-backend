
import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await authService.register(email, password);
        // Exclude password from response
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const { user, token } = await authService.login(email, password);
        const { password: _, ...userData } = user;
        const userResponse = {
            ...userData,
            fullName: (user as any).member?.name,
            profilePic: (user as any).member?.profileImage
        };
        res.json({ user: userResponse, token });
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
};
