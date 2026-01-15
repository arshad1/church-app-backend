import { Router } from 'express';
import * as mobileController from '../controllers/mobile.controller';
import * as galleryController from '../controllers/gallery.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All mobile routes require authentication
router.use(authenticate);

// Profile & Family
router.get('/profile', mobileController.getMyProfile);
router.post('/family/members', mobileController.addFamilyMember);
router.put('/family/members/:memberId', mobileController.updateFamilyMember);

// Directory
router.get('/directory', mobileController.getDirectory);

// Gallery
router.get('/gallery/categories', galleryController.getAllCategories);
router.get('/gallery/albums', galleryController.getAllAlbums);

export default router;
