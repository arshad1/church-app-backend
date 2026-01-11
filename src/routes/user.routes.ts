
import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Admin User Management Routes
import { isAdmin } from '../middleware/auth.middleware';

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);

// Admin Routes for Users
// Admin Routes for Users
router.get('/', authenticate, isAdmin, userController.getAllUsers);
router.post('/', authenticate, isAdmin, userController.createUser);
router.put('/:id', authenticate, isAdmin, userController.updateUser);
router.delete('/:id', authenticate, isAdmin, userController.deleteUser);
router.post('/delete-bulk', authenticate, isAdmin, userController.bulkDeleteUsers);
// router.put('/:id/role', authenticate, isAdmin, userController.updateUserRole); // Superseded by general update

export default router;
