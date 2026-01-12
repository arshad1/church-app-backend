import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Routes are mounted at /api/admin/settings
router.use(authenticate, isAdmin);

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);

export default router;
