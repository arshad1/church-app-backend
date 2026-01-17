
import { Request, Response } from 'express';
import * as eventService from '../services/event.service';

import * as notificationService from '../services/notification.service';

export const createEvent = async (req: Request, res: Response) => {
    try {
        const event = await eventService.createEvent(req.body);

        // Broadcast notification to all users
        const title = 'New Event: ' + event.title;
        const body = event.description ? event.description.substring(0, 100) + (event.description.length > 100 ? '...' : '') : 'Check out this new event in the app!';

        // Send asynchronously to avoid blocking the response
        notificationService.sendPushToAll(title, body, JSON.stringify({ eventId: event.id, type: 'EVENT' }))
            .catch(err => console.error('Failed to broadcast event notification:', err));

        res.status(201).json(event);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateEvent = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const event = await eventService.updateEvent(id, req.body);
        res.json(event);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const publishEvent = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const event = await eventService.publishEvent(id);
        res.json(event);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getEvents = async (req: Request, res: Response) => {
    try {
        const featured = req.query.featured === 'true';
        const events = await eventService.getEvents({ featured });
        res.json(events);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMobileEvents = async (req: Request, res: Response) => {
    try {
        const featured = req.query.featured === 'true';
        // Mobile users should only see PUBLISHED events
        const events = await eventService.getEvents({
            featured,
            status: 'PUBLISHED'
        });
        res.json(events);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const registerForEvent = async (req: Request, res: Response) => {
    try {
        const eventId = parseInt(req.params.id as string);
        const userId = (req.user as any).userId;
        const registration = await eventService.registerForEvent(eventId, userId);
        res.status(201).json(registration);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getEventRegistrations = async (req: Request, res: Response) => {
    try {
        const eventId = parseInt(req.params.id as string);
        const registrations = await eventService.getEventRegistrations(eventId);
        res.json(registrations);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
