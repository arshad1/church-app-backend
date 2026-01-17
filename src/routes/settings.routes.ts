import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Routes are mounted at /api/admin/settings

// GET is open to allow fetching church name/logo for login page
router.get('/', settingsController.getSettings);

// Only update requires authentication
router.put('/', authenticate, isAdmin, settingsController.updateSettings);

export default router;
