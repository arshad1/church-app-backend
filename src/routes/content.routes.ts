
import { Router } from 'express';
import * as contentController from '../controllers/content.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Announcements
router.get('/announcements', contentController.getAnnouncements);
router.post('/announcements', authenticate, isAdmin, contentController.createAnnouncement);

// Content (Generic: /devotion, /gallery, etc. or just query param /?type=...)
// Using type parameter in path
router.get('/:type', contentController.getContent);
router.post('/', authenticate, isAdmin, contentController.createContent);
router.put('/:id', authenticate, isAdmin, contentController.updateContent);
router.delete('/:id', authenticate, isAdmin, contentController.deleteContent);

export default router;
