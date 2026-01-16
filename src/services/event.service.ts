
import prisma from '../utils/prisma';

export const createEvent = async (data: any) => {
    return prisma.event.create({
        data,
    });
};

export const updateEvent = async (id: number, data: any) => {
    return prisma.event.update({
        where: { id },
        data,
    });
};

export const publishEvent = async (id: number) => {
    const event = await prisma.event.update({
        where: { id },
        data: { status: 'PUBLISHED' },
    });

    // Mock Notification
    console.log(`[NOTIFICATION] Alert: "${event.title}" is now LIVE! Watch here: ${event.liveUrl}`);

    return event;
};

export const getEvents = async (filters?: { featured?: boolean; status?: string }) => {
    const where: any = {};
    if (filters?.featured) {
        where.isFeatured = true;
    }
    if (filters?.status) {
        where.status = filters.status;
    }

    return prisma.event.findMany({
        where,
        orderBy: { date: 'asc' },
    });
};

export const registerForEvent = async (eventId: number, userId: number) => {
    // Find member associated with user
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { member: true }
    });

    if (!user || !user.member) {
        throw new Error('User must be a registered member to join events');
    }

    const memberId = user.member.id;

    const existing = await prisma.registration.findFirst({
        where: { eventId, memberId },
    });
    if (existing) {
        throw new Error('Already registered');
    }
    return prisma.registration.create({
        data: {
            eventId,
            memberId,
        },
    });
};

export const getEventRegistrations = async (eventId: number) => {
    return prisma.registration.findMany({
        where: { eventId },
        include: { member: { select: { id: true, name: true, email: true } } }
    })
}
