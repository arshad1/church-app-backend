
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (email: string, password: string) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
        },
    });

    return user;
};

export const login = async (identifier: string, password: string) => {
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: identifier },
                { username: identifier }
            ]
        },
        include: {
            member: true
        }
    });
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: '180d',
    });

    return { user, token };
};
