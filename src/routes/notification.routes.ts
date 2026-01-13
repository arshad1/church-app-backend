import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// User Routes
router.get('/', notificationController.getMyNotifications);
router.post('/register-token', notificationController.registerToken);
router.put('/:id/read', notificationController.markRead);
router.delete('/:id', notificationController.deleteNotification);

// Admin Routes for sending
router.post('/send-user', isAdmin, notificationController.sendToUser); // Create & Send
router.post('/broadcast', isAdmin, notificationController.sendBroadcast); // Broadcast Push

export default router;
