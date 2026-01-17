import { Router } from 'express';
import * as houseController from '../controllers/house.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// House management routes
router.post('/', houseController.createHouse);
router.get('/family/:familyId', houseController.getHousesByFamily);
router.get('/:id', houseController.getHouseById);
router.put('/:id', houseController.updateHouse);
router.delete('/:id', houseController.deleteHouse);

export default router;
