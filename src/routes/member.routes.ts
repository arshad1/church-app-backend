import { Router } from 'express';
import * as memberController from '../controllers/member.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, isAdmin);

router.get('/', memberController.getAllMembers);
router.get('/:id', memberController.getMemberById);
router.post('/', memberController.createMember);
router.put('/:id', memberController.updateMember);
router.delete('/:id', memberController.deleteMember);
router.post('/delete-bulk', memberController.bulkDeleteMembers);
router.post('/:id/approve', memberController.approveMember);
router.post('/:id/family', memberController.linkToFamily);
router.post('/:id/set-head', memberController.setHeadOfFamily);
router.get('/family/:familyId', memberController.getMembersByFamily);

export default router;
