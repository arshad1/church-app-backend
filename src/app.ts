
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import eventRoutes from './routes/event.routes';
import contentRoutes from './routes/content.routes';
import memberRoutes from './routes/member.routes';
import familyRoutes from './routes/family.routes';
import ministryRoutes from './routes/ministry.routes';
import sacramentRoutes from './routes/sacrament.routes';
import prayerRoutes from './routes/prayer.routes';
import reportRoutes from './routes/report.routes';
import uploadRoutes from './routes/upload.routes';
import settingsRoutes from './routes/settings.routes';
import galleryRoutes from './routes/gallery.routes';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from './docs/swagger.json';

const app = express();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/auth', authRoutes);
app.use('/api/common', uploadRoutes); // Use a common prefix or just /api/upload
app.use('/api/users', userRoutes);
// ... others
app.use('/api/events', eventRoutes);
app.use('/api/content', contentRoutes);

// Admin API Routes
app.use('/api/admin/members', memberRoutes);
app.use('/api/admin/families', familyRoutes);
app.use('/api/admin/ministries', ministryRoutes);
app.use('/api/admin/sacraments', sacramentRoutes);
app.use('/api/admin/prayers', prayerRoutes);
app.use('/api/admin/reports', reportRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/admin/gallery', galleryRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Church Management System API');
});

// Serve React admin panel
// Determine the correct path based on whether we're in dev or production
const adminPanelPath = path.join(__dirname, __dirname.endsWith('dist') ? '../admin-panel/dist' : '../admin-panel/dist');

app.use('/admin', express.static(adminPanelPath));
app.get('/admin', (req, res) => {
    res.sendFile(path.join(adminPanelPath, 'index.html'));
});
app.get(/^\/admin\/.*/, (req, res) => {
    res.sendFile(path.join(adminPanelPath, 'index.html'));
});

export default app;
