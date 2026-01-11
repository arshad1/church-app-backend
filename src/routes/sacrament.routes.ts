import { Router } from 'express';
import * as sacramentController from '../controllers/sacrament.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, isAdmin);

router.get('/', sacramentController.getAllSacraments);
router.get('/member/:memberId', sacramentController.getSacramentsByMember);
router.post('/', sacramentController.createSacrament);
router.put('/:id', sacramentController.updateSacrament);
router.delete('/:id', sacramentController.deleteSacrament);

export default router;
