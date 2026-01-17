import prisma from '../utils/prisma';

export const getAllMembers = async (filters?: {
    status?: string;
    familyId?: number;
    search?: string;
}) => {
    const where: any = {
        status: filters?.status,
        familyId: filters?.familyId,
    };

    if (filters?.search) {
        where.OR = [
            { name: { contains: filters.search } },
            { email: { contains: filters.search } },
            { phone: { contains: filters.search } },
        ];
    }

    return prisma.member.findMany({
        where,
        include: {
            family: true,
            user: {
                select: { id: true, role: true, email: true }
            },
            sacraments: true,
            ministries: {
                include: {
                    ministry: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const getMemberById = async (id: number) => {
    return prisma.member.findUnique({
        where: { id },
        include: {
            family: {
                include: {
                    members: {
                        select: { id: true, name: true, email: true, familyRole: true, profileImage: true, dob: true, gender: true },
                    },
                },
            },
            user: {
                select: { id: true, role: true, email: true }
            },
            sacraments: true,
            ministries: {
                include: {
                    ministry: true,
                },
            },
            registrations: {
                include: {
                    event: true,
                },
            },
        },
    });
};

export const createMember = async (data: {
    name: string;
    email?: string;
    phone?: string;
    profileImage?: string;
    status?: string;
    familyId?: number;
    familyRole?: string;
    dob?: Date;
    gender?: string;
    houseId?: number;
}) => {
    return prisma.member.create({
        data,
    });
};

export const updateMember = async (id: number, data: any) => {
    return prisma.member.update({
        where: { id },
        data,
    });
};

export const deleteMember = async (id: number) => {
    // Soft delete by setting status to INACTIVE
    return prisma.member.update({
        where: { id },
        data: { status: 'INACTIVE' },
    });
};

export const approveMember = async (id: number) => {
    return prisma.member.update({
        where: { id },
        data: { status: 'ACTIVE' },
    });
};

export const linkToFamily = async (memberId: number, familyId: number) => {
    return prisma.member.update({
        where: { id: memberId },
        data: { familyId },
    });
};

export const setHeadOfFamily = async (memberId: number, familyId: number) => {
    // First, remove head status from all family members
    await prisma.member.updateMany({
        where: { familyId },
        data: { headOfFamily: false },
    });

    // Then set the new head
    return prisma.member.update({
        where: { id: memberId },
        data: { headOfFamily: true },
    });
};

export const getMembersByFamily = async (familyId: number) => {
    return prisma.member.findMany({
        where: { familyId },
        include: {
            sacraments: true,
            ministries: {
                include: {
                    ministry: true,
                },
            },
        },
    });
};

export const deleteManyMembers = async (ids: number[]) => {
    return prisma.member.updateMany({
        where: { id: { in: ids } },
        data: { status: 'INACTIVE' }
    });
};
