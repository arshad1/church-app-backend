
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
                                select: { id: true, name: true, familyRole: true, profileImage: true, dob: true, gender: true }
                            }
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

export const getAllUsers = async (params?: { search?: string; sort?: string; order?: 'asc' | 'desc' }) => {
    const { search, sort, order = 'desc' } = params || {};

    const where: any = {};
    if (search) {
        where.OR = [
            { email: { contains: search } },
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

    return prisma.user.findMany({
        where,
        include: {
            member: {
                select: {
                    name: true,
                    profileImage: true
                }
            }
        },
        orderBy
    });
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

export const createUser = async (data: { email: string; password: string; role: string; memberId?: number }) => {
    return prisma.user.create({
        data
    });
};

export const updateUserRole = async (userId: number, role: string) => {
    return prisma.user.update({
        where: { id: userId },
        data: { role }
    });
};
