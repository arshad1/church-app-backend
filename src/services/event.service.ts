
import prisma from '../utils/prisma';

export const createEvent = async (data: any) => {
    return prisma.event.create({
        data,
    });
};

export const getEvents = async () => {
    return prisma.event.findMany({
        orderBy: { date: 'asc' },
    });
};

export const registerForEvent = async (eventId: number, userId: number) => {
    const existing = await prisma.registration.findFirst({
        where: { eventId, userId },
    });
    if (existing) {
        throw new Error('Already registered');
    }
    return prisma.registration.create({
        data: {
            eventId,
            userId,
        },
    });
};

export const getEventRegistrations = async (eventId: number) => {
    return prisma.registration.findMany({
        where: { eventId },
        include: { user: { select: { id: true, name: true, email: true } } }
    })
}
