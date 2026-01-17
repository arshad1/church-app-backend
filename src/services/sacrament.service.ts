import prisma from '../utils/prisma';

export const getAllSacraments = async (filters: {
    type?: string;
    memberId?: number;
    page?: number;
    limit?: number;
    search?: string;
} = {}) => {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.type) where.type = filters.type;
    if (filters.memberId) where.memberId = filters.memberId;
    if (filters.search) {
        where.member = {
            name: {
                contains: filters.search,
            },
        };
    }

    const [data, total] = await Promise.all([
        prisma.sacrament.findMany({
            where,
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
            skip,
            take: limit,
        }),
        prisma.sacrament.count({ where }),
    ]);

    return {
        data,
        meta: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    };
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
