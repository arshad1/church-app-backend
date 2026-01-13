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
    const family = await prisma.family.findUnique({
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
            relatedTo: {
                select: {
                    id: true,
                    name: true,
                    houseName: true,
                },
            },
            relatedBy: {
                select: {
                    id: true,
                    name: true,
                    houseName: true,
                },
            },
        },
    });

    if (!family) return null;

    // Merge relatedTo and relatedBy into a single relatedFamilies array
    const relatedFamilies = [
        ...family.relatedTo,
        ...family.relatedBy
    ];

    // Remove duplicates
    const uniqueRelatedFamilies = Array.from(new Map(relatedFamilies.map(item => [item.id, item])).values());

    return {
        ...family,
        relatedFamilies: uniqueRelatedFamilies
    };
};

export const addRelatedFamily = async (id: number, relatedFamilyId: number) => {
    // Check if they are already related (in either direction)
    const existingRelation = await prisma.family.findFirst({
        where: {
            OR: [
                { id, relatedTo: { some: { id: relatedFamilyId } } },
                { id: relatedFamilyId, relatedTo: { some: { id } } }
            ]
        }
    });

    if (existingRelation) {
        throw new Error('Families are already related');
    }

    return prisma.family.update({
        where: { id },
        data: {
            relatedTo: {
                connect: { id: relatedFamilyId }
            }
        }
    });
};

export const removeRelatedFamily = async (id: number, relatedFamilyId: number) => {
    // Try disconnecting relatedTo
    await prisma.family.update({
        where: { id },
        data: {
            relatedTo: {
                disconnect: { id: relatedFamilyId }
            }
        }
    });

    // Try disconnecting relatedBy (since we don't know the direction)
    await prisma.family.update({
        where: { id: relatedFamilyId },
        data: {
            relatedTo: {
                disconnect: { id }
            }
        }
    });

    return { message: 'Relation removed' };
};

export const createFamily = async (data: {
    name: string;
    address?: string;
    phone?: string;
    houseName?: string;
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
