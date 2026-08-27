// Restart trigger (loading pooler URL)
import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import memberRoutes from './routes/members';
import tutorRoutes from './routes/tutors';
import contentRoutes from './routes/content';
import proselRoutes from './routes/prosel';
import projectRoutes from './routes/projects';
import articleRoutes from './routes/articles';
import partnerRoutes from './routes/partners';
import eventsRoutes from './routes/events';
import auditRoutes from './routes/audit';
import faqRoutes from './routes/faq';
console.log('[DEBUG] partnerRoutes imported type:', typeof partnerRoutes);
import { errorHandler } from './middleware/errorHandler';
import { getConfig, updateConfig } from './controllers/configController';
import { authenticate, requireAdmin } from './middleware/auth';
import { setupSwagger } from './config/swagger';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

setupSwagger(app);

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/prosel', proselRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/partners', (req, res, next) => {
    console.log(`[DEBUG] Request to /api/partners: ${req.method} ${req.url}`);
    next();
}, partnerRoutes);

console.log('[DEBUG] Registered routes including /api/partners');

// System Config Routes
app.get('/api/config/:key', getConfig);
app.put('/api/config/:key', authenticate, requireAdmin, updateConfig);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'LIAO Backend is running' });
});

// Root route to prevent 404 on main page
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'LIAO Backend API',
        endpoints: {
            auth: '/api/auth',
            members: '/api/members',
            health: '/health'
        }
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 LIAO Backend server running on http://localhost:${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
}).on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please kill the process using this port.`);
    } else {
        console.error('❌ Server failed to start:', err);
    }
});

export default app;
