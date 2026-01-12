import prisma from '../utils/prisma';

export const getAllSacraments = async (filters?: {
    type?: string;
    memberId?: number;
}) => {
    return prisma.sacrament.findMany({
        where: {
            type: filters?.type,
            memberId: filters?.memberId,
        },
        include: {
            member: {
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

export const getSacramentsByMember = async (memberId: number) => {
    return prisma.sacrament.findMany({
        where: { memberId },
        orderBy: { date: 'desc' },
    });
};

export const createSacrament = async (data: {
    type: string;
    date: Date;
    memberId: number;
    details?: string;
}) => {
    return prisma.sacrament.create({
        data,
        include: {
            member: {
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
