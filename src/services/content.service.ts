
import prisma from '../utils/prisma';

// Announcements
export const createAnnouncement = async (userId: number, title: string, content: string) => {
    return prisma.announcement.create({
        data: {
            title,
            content,
            authorId: userId,
        },
    });
};

export const getAnnouncements = async (limit: number = 50) => {
    return prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
            author: {
                include: {
                    member: {
                        select: { name: true },
                    },
                },
            },
        },
    });
};

// Content (Devotions, Gallery, etc.)
export const createContent = async (type: string, title: string, body?: string, mediaUrl?: string) => {
    return prisma.content.create({
        data: {
            type,
            title,
            body,
            mediaUrl,
        },
    });
};

export const getContentByType = async (type: string, page: number = 1, limit: number = 20) => {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        prisma.content.findMany({
            where: { type },
            orderBy: { date: 'desc' },
            skip,
            take: limit,
        }),
        prisma.content.count({
            where: { type },
        }),
    ]);

    return {
        data,
        meta: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    };
};

export const updateContent = async (id: number, title: string, body?: string, mediaUrl?: string) => {
    return prisma.content.update({
        where: { id },
        data: {
            title,
            body,
            mediaUrl,
        },
    });
};

export const deleteContent = async (id: number) => {
    return prisma.content.delete({
        where: { id },
    });
};
