
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

export const getAnnouncements = async () => {
    return prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
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

export const getContentByType = async (type: string) => {
    return prisma.content.findMany({
        where: { type },
        orderBy: { date: 'desc' },
    });
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
