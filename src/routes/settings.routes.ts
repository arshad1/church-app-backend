import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, isAdmin);

router.get('/', settingsController.getChurchSettings);
router.put('/', settingsController.updateChurchSettings);

export default router;
