
import { Request, Response } from 'express';
import * as eventService from '../services/event.service';

export const createEvent = async (req: Request, res: Response) => {
    try {
        const event = await eventService.createEvent(req.body);
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
        const events = await eventService.getEvents();
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
