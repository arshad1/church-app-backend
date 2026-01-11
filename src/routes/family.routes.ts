import { Router } from 'express';
import * as familyController from '../controllers/family.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, isAdmin);

router.get('/', familyController.getAllFamilies);
router.get('/:id', familyController.getFamilyById);
router.post('/', familyController.createFamily);
router.put('/:id', familyController.updateFamily);
router.delete('/:id', familyController.deleteFamily);

export default router;
