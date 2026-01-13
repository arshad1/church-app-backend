import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// User Routes
// Admin Routes for sending & history
router.post('/broadcast', isAdmin, notificationController.sendBroadcast); // Broadcast Push
router.put('/broadcast/:id', isAdmin, notificationController.updateBroadcast); // Update/Send Draft
router.get('/broadcasts', isAdmin, notificationController.getBroadcasts); // Get History
router.post('/send-user', isAdmin, notificationController.sendToUser); // Create & Send

// User Routes
router.get('/', notificationController.getMyNotifications);
router.post('/register-token', notificationController.registerToken);
router.put('/:id/read', notificationController.markRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;
