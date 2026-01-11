import { Router } from 'express';
import * as prayerController from '../controllers/prayer.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, isAdmin);

router.get('/', prayerController.getAllPrayerRequests);
router.put('/:id/acknowledge', prayerController.acknowledgePrayerRequest);
router.put('/:id/status', prayerController.updatePrayerRequestStatus);
router.delete('/:id', prayerController.deletePrayerRequest);

export default router;
