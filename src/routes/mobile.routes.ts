import { Router } from 'express';
import * as mobileController from '../controllers/mobile.controller';
import * as contentController from '../controllers/content.controller';
import * as eventController from '../controllers/event.controller';
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

// Content - Read-only access for mobile app
router.get('/announcements', contentController.getAnnouncements);
router.get('/content/:type', contentController.getContent);

// Events - Read-only access for mobile app
router.get('/events', eventController.getMobileEvents);

// Gallery - Read-only access for mobile app
router.get('/gallery/categories', galleryController.getAllCategories);
router.get('/gallery/albums', galleryController.getAllAlbums);
router.get('/gallery/albums/:id', galleryController.getAlbumById);

export default router;
