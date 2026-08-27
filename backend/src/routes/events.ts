import { Router } from 'express';
import { createEvent, getEvents, getEventBySlug, updateEvent, deleteEvent } from '../controllers/EventController';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

// Public routes
/**
 * @openapi
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Event' } }
 */
router.get('/', getEvents);

/**
 * @openapi
 * /api/events/{slug}:
 *   get:
 *     summary: Get event by slug
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Single event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Event' }
 */
router.get('/:slug', getEventBySlug);

// Protected routes (Admin only)
/**
 * @openapi
 * /api/events:
 *   post:
 *     summary: Create an event
 *     tags: [Events]
 *     responses:
 *       201:
 *         description: Event created
 *         content:
 *           application/json:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Event' }
 */
router.post('/', authenticate, requirePermission('events'), createEvent);

/**
 * @openapi
 * /api/events/{id}:
 *   put:
 *     summary: Update an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Event' }
 */
router.put('/:id', authenticate, requirePermission('events'), updateEvent);

/**
 * @openapi
 * /api/events/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event deleted
 */
router.post('/:id/delete', authenticate, requirePermission('events'), deleteEvent);

export default router;
