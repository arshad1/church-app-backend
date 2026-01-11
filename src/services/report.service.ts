import prisma from '../utils/prisma';

export const getDashboardStats = async () => {
    const [
        totalMembers,
        activeMembers,
        pendingMembers,
        totalFamilies,
        totalMinistries,
        totalEvents,
        upcomingEvents,
        pendingPrayerRequests,
    ] = await Promise.all([
        prisma.member.count(),
        prisma.member.count({ where: { status: 'ACTIVE' } }),
        prisma.member.count({ where: { status: 'PENDING_APPROVAL' } }),
        prisma.family.count(),
        prisma.ministry.count(),
        prisma.event.count(),
        prisma.event.count({
            where: {
                date: {
                    gte: new Date(),
                },
            },
        }),
        prisma.prayerRequest.count({ where: { status: 'PENDING' } }),
    ]);

    return {
        members: {
            total: totalMembers,
            active: activeMembers,
            pending: pendingMembers,
            inactive: totalMembers - activeMembers - pendingMembers,
        },
        families: totalFamilies,
        ministries: totalMinistries,
        events: {
            total: totalEvents,
            upcoming: upcomingEvents,
        },
        prayerRequests: {
            pending: pendingPrayerRequests,
        },
    };
};

export const getMemberGrowthReport = async (months: number = 12) => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const members = await prisma.member.findMany({
        where: {
            createdAt: {
                gte: startDate,
            },
        },
        select: {
            createdAt: true,
        },
    });

    // Group by month
    const growthByMonth: { [key: string]: number } = {};
    members.forEach((member) => {
        const monthKey = member.createdAt.toISOString().substring(0, 7); // YYYY-MM
        growthByMonth[monthKey] = (growthByMonth[monthKey] || 0) + 1;
    });

    return Object.entries(growthByMonth).map(([month, count]) => ({
        month,
        count,
    }));
};

export const getMinistryParticipationReport = async () => {
    const ministries = await prisma.ministry.findMany({
        include: {
            _count: {
                select: { members: true },
            },
        },
    });

    return ministries.map((ministry) => ({
        id: ministry.id,
        name: ministry.name,
        memberCount: ministry._count.members,
    }));
};

export const getEventAttendanceReport = async () => {
    const events = await prisma.event.findMany({
        where: {
            date: {
                lte: new Date(), // Past events
            },
        },
        include: {
            _count: {
                select: { registrations: true },
            },
        },
        orderBy: { date: 'desc' },
        take: 20, // Last 20 events
    });

    return events.map((event) => ({
        id: event.id,
        title: event.title,
        date: event.date,
        registrations: event._count.registrations,
    }));
};

export const getSacramentReport = async () => {
    const sacraments = await prisma.sacrament.groupBy({
        by: ['type'],
        _count: {
            type: true,
        },
    });

    return sacraments.map((s) => ({
        type: s.type,
        count: s._count.type,
    }));
};
