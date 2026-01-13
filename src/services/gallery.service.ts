import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Categories
export const createCategory = async (name: string) => {
    return prisma.galleryCategory.create({
        data: { name },
    });
};

export const getAllCategories = async () => {
    return prisma.galleryCategory.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { albums: true }
            }
        }
    });
};

export const updateCategory = async (id: number, name: string) => {
    return prisma.galleryCategory.update({
        where: { id },
        data: { name },
    });
};

export const deleteCategory = async (id: number) => {
    return prisma.galleryCategory.delete({
        where: { id },
    });
};

// Albums
export const createAlbum = async (data: { title: string; description?: string; categoryId: number; coverImage?: string; date?: Date }) => {
    return prisma.galleryAlbum.create({
        data,
    });
};

export const getAllAlbums = async (categoryId?: number) => {
    const where = categoryId ? { categoryId } : {};
    return prisma.galleryAlbum.findMany({
        where,
        orderBy: { date: 'desc' },
        include: {
            category: true,
            _count: {
                select: { images: true }
            }
        }
    });
};

export const getAlbumById = async (id: number) => {
    return prisma.galleryAlbum.findUnique({
        where: { id },
        include: {
            category: true,
            images: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });
};

export const updateAlbum = async (id: number, data: { title?: string; description?: string; categoryId?: number; coverImage?: string; date?: Date }) => {
    return prisma.galleryAlbum.update({
        where: { id },
        data,
    });
};

export const deleteAlbum = async (id: number) => {
    return prisma.galleryAlbum.delete({
        where: { id },
    });
};

// Images
export const addImagesToAlbum = async (albumId: number, imageUrls: string[]) => {
    const data = imageUrls.map(url => ({
        albumId,
        url,
    }));

    // Create images
    await prisma.galleryImage.createMany({
        data,
    });

    // Update album cover if needed (if it doesn't have one, use the first image)
    const album = await prisma.galleryAlbum.findUnique({ where: { id: albumId } });
    if (!album?.coverImage && imageUrls.length > 0) {
        await prisma.galleryAlbum.update({
            where: { id: albumId },
            data: { coverImage: imageUrls[0] }
        });
    }

    return prisma.galleryImage.findMany({
        where: { albumId },
        orderBy: { createdAt: 'desc' }
    });
};

export const deleteImage = async (id: number) => {
    // Before deleting, check if this was the cover image
    const image = await prisma.galleryImage.findUnique({ where: { id } });
    if (image) {
        const album = await prisma.galleryAlbum.findUnique({ where: { id: image.albumId } });
        if (album?.coverImage === image.url) {
            // Find another image to set as cover
            const otherImage = await prisma.galleryImage.findFirst({
                where: { albumId: image.albumId, id: { not: id } }
            });
            await prisma.galleryAlbum.update({
                where: { id: image.albumId },
                data: { coverImage: otherImage ? otherImage.url : null }
            });
        }
    }

    return prisma.galleryImage.delete({
        where: { id },
    });
};
