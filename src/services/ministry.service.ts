import prisma from '../utils/prisma';

export const getAllMinistries = async () => {
    return prisma.ministry.findMany({
        include: {
            members: {
                include: {
                    member: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            profileImage: true,
                        },
                    },
                },
            },
        },
    });
};

export const getMinistryById = async (id: number) => {
    return prisma.ministry.findUnique({
        where: { id },
        include: {
            members: {
                include: {
                    member: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            profileImage: true,
                        },
                    },
                },
            },
        },
    });
};

export const createMinistry = async (data: {
    name: string;
    description?: string;
    meetingSchedule?: string;
}) => {
    return prisma.ministry.create({
        data,
    });
};

export const updateMinistry = async (id: number, data: any) => {
    return prisma.ministry.update({
        where: { id },
        data,
    });
};

export const deleteMinistry = async (id: number) => {
    // First delete all ministry members
    await prisma.ministryMember.deleteMany({
        where: { ministryId: id },
    });

    // Then delete the ministry
    return prisma.ministry.delete({
        where: { id },
    });
};

export const assignLeader = async (ministryId: number, userId: number) => {
    // First, remove leader status from all members
    await prisma.ministryMember.updateMany({
        where: { ministryId },
        data: { role: 'MEMBER' },
    });

    // Check if user is already a member
    const existing = await prisma.ministryMember.findFirst({
        where: { ministryId, memberId: userId },
    });

    if (existing) {
        // Update existing member to leader
        return prisma.ministryMember.update({
            where: { id: existing.id },
            data: { role: 'LEADER' },
        });
    } else {
        // Add user as leader
        return prisma.ministryMember.create({
            data: {
                ministryId,
                memberId: userId,
                role: 'LEADER',
            },
        });
    }
};

export const addMember = async (ministryId: number, userId: number) => {
    // Check if already a member
    const existing = await prisma.ministryMember.findFirst({
        where: { ministryId, memberId: userId },
    });

    if (existing) {
        throw new Error('User is already a member of this ministry');
    }

    return prisma.ministryMember.create({
        data: {
            ministryId,
            memberId: userId,
            role: 'MEMBER',
        },
    });
};

export const removeMember = async (ministryId: number, userId: number) => {
    const member = await prisma.ministryMember.findFirst({
        where: { ministryId, memberId: userId },
    });

    if (!member) {
        throw new Error('Member not found in this ministry');
    }

    return prisma.ministryMember.delete({
        where: { id: member.id },
    });
};
