import { Router } from 'express';
import * as mobileController from '../controllers/mobile.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All mobile routes require authentication
router.use(authenticate);

// Profile & Family
router.get('/profile', mobileController.getMyProfile);
router.post('/family/members', mobileController.addFamilyMember);

// Directory
router.get('/directory', mobileController.getDirectory);

export default router;
