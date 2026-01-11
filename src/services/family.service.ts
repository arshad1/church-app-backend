import prisma from '../utils/prisma';

export const getAllFamilies = async () => {
    return prisma.family.findMany({
        include: {
            members: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    profileImage: true,
                    familyRole: true,
                    status: true,
                    headOfFamily: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const getFamilyById = async (id: number) => {
    return prisma.family.findUnique({
        where: { id },
        include: {
            members: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    profileImage: true,
                    familyRole: true,
                    status: true,
                    headOfFamily: true,
                    sacraments: true,
                },
            },
        },
    });
};

export const createFamily = async (data: {
    name: string;
    address?: string;
    phone?: string;
}) => {
    return prisma.family.create({
        data,
    });
};

export const updateFamily = async (id: number, data: any) => {
    return prisma.family.update({
        where: { id },
        data,
    });
};

export const deleteFamily = async (id: number) => {
    // First, unlink all members from this family
    await prisma.member.updateMany({
        where: { familyId: id },
        data: { familyId: null, headOfFamily: false },
    });

    // Then delete the family
    return prisma.family.delete({
        where: { id },
    });
};
