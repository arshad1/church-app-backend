import prisma from '../utils/prisma';

export const createHouse = async (data: {
    name: string;
    familyId: number;
}) => {
    return prisma.house.create({
        data,
    });
};

export const getHouseById = async (id: number) => {
    return prisma.house.findUnique({
        where: { id },
        include: {
            members: true
        }
    });
};

export const getHousesByFamily = async (familyId: number) => {
    return prisma.house.findMany({
        where: { familyId },
        include: {
            members: true
        }
    });
};

export const updateHouse = async (id: number, data: { name?: string }) => {
    return prisma.house.update({
        where: { id },
        data
    });
};

export const deleteHouse = async (id: number) => {
    // First, unlink all members from this house
    await prisma.member.updateMany({
        where: { houseId: id },
        data: { houseId: null, headOfFamily: false }
    });

    // Then delete the house
    return prisma.house.delete({
        where: { id }
    });
};
