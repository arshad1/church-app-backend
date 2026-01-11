import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, isAdmin);

router.get('/dashboard', reportController.getDashboardStats);
router.get('/member-growth', reportController.getMemberGrowthReport);
router.get('/ministry-participation', reportController.getMinistryParticipationReport);
router.get('/event-attendance', reportController.getEventAttendanceReport);
router.get('/sacraments', reportController.getSacramentReport);

export default router;
