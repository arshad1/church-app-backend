import prisma from '../utils/prisma';

export const getSettings = async () => {
    let settings = await prisma.churchSettings.findFirst();

    if (!settings) {
        settings = await prisma.churchSettings.create({
            data: {
                churchName: 'My Church',
                description: 'Welcome to our church management system.',
            },
        });
    }

    // Runtime fix: specific check to upgrade http to https for logoUrl to avoid Mixed Content errors
    if (settings && settings.logoUrl && settings.logoUrl.startsWith('http://')) {
        settings.logoUrl = settings.logoUrl.replace('http://', 'https://');
    }

    return settings;
};

export const updateSettings = async (data: any) => {
    const settings = await getSettings();
    const { id, ...updateData } = data; // Remove ID from payload
    return prisma.churchSettings.update({
        where: { id: settings.id },
        data: updateData,
    });
};
