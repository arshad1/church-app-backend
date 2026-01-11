import { Router } from 'express';
import * as ministryController from '../controllers/ministry.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, isAdmin);

router.get('/', ministryController.getAllMinistries);
router.get('/:id', ministryController.getMinistryById);
router.post('/', ministryController.createMinistry);
router.put('/:id', ministryController.updateMinistry);
router.delete('/:id', ministryController.deleteMinistry);
router.post('/:id/leader', ministryController.assignLeader);
router.post('/:id/members', ministryController.addMember);
router.delete('/:id/members/:userId', ministryController.removeMember);

export default router;
