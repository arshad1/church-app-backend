import express from 'express';
import * as galleryController from '../controllers/gallery.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Categories
router.post('/categories', authenticate, galleryController.createCategory);
router.get('/categories', galleryController.getAllCategories);
router.put('/categories/:id', authenticate, galleryController.updateCategory);
router.delete('/categories/:id', authenticate, galleryController.deleteCategory);

// Albums
router.post('/albums', authenticate, galleryController.createAlbum);
router.get('/albums', galleryController.getAllAlbums);
router.get('/albums/:id', galleryController.getAlbumById);
router.put('/albums/:id', authenticate, galleryController.updateAlbum);
router.delete('/albums/:id', authenticate, galleryController.deleteAlbum);

// Images (Nested under albums for creation, direct for deletion)
router.post('/albums/:id/images', authenticate, galleryController.addImagesToAlbum);
router.delete('/images/:id', authenticate, galleryController.deleteImage);

export default router;
