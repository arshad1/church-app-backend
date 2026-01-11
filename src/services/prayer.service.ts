import prisma from '../utils/prisma';

export const getAllPrayerRequests = async (filters?: {
    status?: string;
}) => {
    return prisma.prayerRequest.findMany({
        where: {
            status: filters?.status,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const acknowledgePrayerRequest = async (id: number) => {
    return prisma.prayerRequest.update({
        where: { id },
        data: { status: 'ACKNOWLEDGED' },
    });
};

export const updatePrayerRequestStatus = async (id: number, status: string) => {
    return prisma.prayerRequest.update({
        where: { id },
        data: { status },
    });
};

export const deletePrayerRequest = async (id: number) => {
    return prisma.prayerRequest.delete({
        where: { id },
    });
};
