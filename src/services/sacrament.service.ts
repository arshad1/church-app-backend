import prisma from '../utils/prisma';

export const getAllSacraments = async (filters?: {
    type?: string;
    userId?: number;
}) => {
    return prisma.sacrament.findMany({
        where: {
            type: filters?.type,
            userId: filters?.userId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: { date: 'desc' },
    });
};

export const getSacramentsByMember = async (userId: number) => {
    return prisma.sacrament.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
    });
};

export const createSacrament = async (data: {
    type: string;
    date: Date;
    userId: number;
    details?: string;
}) => {
    return prisma.sacrament.create({
        data,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
};

export const updateSacrament = async (id: number, data: any) => {
    return prisma.sacrament.update({
        where: { id },
        data,
    });
};

export const deleteSacrament = async (id: number) => {
    return prisma.sacrament.delete({
        where: { id },
    });
};
