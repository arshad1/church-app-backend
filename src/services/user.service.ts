
import prisma from '../utils/prisma';

export const getUserById = async (userId: number) => {
    return prisma.user.findUnique({
        where: { id: userId },
        include: {
            member: {
                include: {
                    family: {
                        include: {
                            members: {
                                where: { status: 'ACTIVE' },
                                select: { id: true, name: true, familyRole: true, profileImage: true, dob: true, gender: true, spouseId: true, houseId: true }
                            },
                            houses: true
                        }
                    },
                    sacraments: true,
                    ministries: {
                        include: {
                            ministry: true
                        }
                    }
                }
            }
        },
    });
};

export const updateUser = async (userId: number, data: any) => {
    return prisma.user.update({
        where: { id: userId },
        data
    });
};
// ... existing code ...

// ... existing code ...

export const getAllUsers = async (params?: {
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}) => {
    const { search, sort, order = 'desc', page = 1, limit = 10 } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
        where.OR = [
            { email: { contains: search } },
            { username: { contains: search } },
            { member: { name: { contains: search } } }
        ];
    }

    const orderBy: any = {};
    if (sort) {
        if (sort === 'name') {
            orderBy.member = { name: order };
        } else {
            orderBy[sort] = order;
        }
    } else {
        orderBy.createdAt = 'desc';
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            include: {
                member: {
                    select: {
                        name: true,
                        profileImage: true
                    }
                }
            },
            orderBy,
            skip,
            take: limit
        }),
        prisma.user.count({ where })
    ]);

    return {
        data: users,
        meta: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
};

export const deleteUser = async (userId: number) => {
    return prisma.user.delete({
        where: { id: userId }
    });
};

export const deleteManyUsers = async (userIds: number[]) => {
    return prisma.user.deleteMany({
        where: { id: { in: userIds } }
    });
};

export const getUserByMemberId = async (memberId: number) => {
    return prisma.user.findFirst({
        where: { memberId }
    });
};

export const createUser = async (data: { username?: string; email?: string; password: string; role: string; memberId?: number }) => {
    return prisma.user.create({
        data: data as any
    });
};

export const updateUserRole = async (userId: number, role: string) => {
    return prisma.user.update({
        where: { id: userId },
        data: { role }
    });
};
