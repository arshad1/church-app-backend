
import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', eventController.getEvents);
router.post('/', authenticate, isAdmin, eventController.createEvent);
router.put('/:id', authenticate, isAdmin, eventController.updateEvent);
router.post('/:id/publish', authenticate, isAdmin, eventController.publishEvent);
router.post('/:id/register', authenticate, eventController.registerForEvent);
router.get('/:id/registrations', authenticate, isAdmin, eventController.getEventRegistrations);

export default router;
