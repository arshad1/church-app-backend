import prisma from '../utils/prisma';

export const getChurchSettings = async () => {
    // Get the first (and should be only) settings record
    let settings = await prisma.churchSettings.findFirst();

    // If no settings exist, create default ones
    if (!settings) {
        settings = await prisma.churchSettings.create({
            data: {
                churchName: 'My Church',
            },
        });
    }

    return settings;
};

export const updateChurchSettings = async (data: {
    churchName?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logoUrl?: string;
    description?: string;
}) => {
    // Get existing settings
    const existing = await prisma.churchSettings.findFirst();

    if (existing) {
        // Update existing
        return prisma.churchSettings.update({
            where: { id: existing.id },
            data,
        });
    } else {
        // Create new
        return prisma.churchSettings.create({
            data: {
                churchName: data.churchName || 'My Church',
                ...data,
            },
        });
    }
};
