import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';

const generateUniqueUsername = async (prefix: string = ''): Promise<string> => {
    let isUnique = false;
    let username = '';
    while (!isUnique) {
        // Generate a 6-digit random number
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        username = `${prefix}${randomNum}`;

        const existing = await prisma.user.findUnique({
            where: { username } as any
        });

        if (!existing) {
            isUnique = true;
        }
    }
    return username;
};

const createAppUserForMember = async (member: any) => {
    // Check if user already exists for this member
    const existingUser = await prisma.user.findFirst({
        where: { memberId: member.id }
    });

    if (existingUser) return;

    // determine unique username
    // if email exists, use email. If not, generate a 6-digit unique ID.
    let username = member.email;
    if (!username) {
        username = await generateUniqueUsername('MB');
    }

    // Default password
    const hashedPassword = await bcrypt.hash('welcome123', 10);

    try {
        await prisma.user.create({
            data: {
                username: username,
                email: member.email || null,
                password: hashedPassword,
                memberId: member.id,
                role: 'MEMBER'
            } as any
        });
    } catch (error) {
        console.error("Auto-creation of user failed", error);
        // checking if failure is due to email/username conflict
    }
};

export const getAllMembers = async (filters?: {
    status?: string;
    familyId?: number;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}) => {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder || 'desc';

    const where: any = {};

    // ... rest of logic

    // For sorting by family, we'd need a different approach in Prisma but for now let's handle basic fields
    const orderBy: any = {};
    if (sortBy === 'family') {
        orderBy.family = { name: sortOrder };
    } else {
        orderBy[sortBy] = sortOrder;
    }

    if (filters?.status && filters.status !== 'ALL') {
        where.status = filters.status;
    }

    if (filters?.familyId) {
        where.familyId = filters.familyId;
    }

    if (filters?.search) {
        where.OR = [
            { name: { contains: filters.search } },
            { email: { contains: filters.search } },
            { phone: { contains: filters.search } },
        ];
    }

    const [members, total] = await Promise.all([
        prisma.member.findMany({
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
            orderBy,
            skip,
            take: limit,
        }),
        prisma.member.count({ where })
    ]);

    return {
        data: members,
        meta: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
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
    spouseId?: number;
    headOfFamily?: boolean;
}) => {
    const member = await prisma.member.create({
        data,
    });

    if (member.headOfFamily || member.familyRole === 'HEAD') {
        await createAppUserForMember(member);
    }

    return member;
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
    const member = await prisma.member.update({
        where: { id: memberId },
        data: { headOfFamily: true },
    });

    await createAppUserForMember(member);

    return member;
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
