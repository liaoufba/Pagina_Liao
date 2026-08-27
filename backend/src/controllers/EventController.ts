import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { logAudit } from '../middleware/auditLogger';
import { AuthRequest } from '../types';

/**
 * @openapi
 * /api/events:
 *   post:
 *     summary: createEvent operation
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 */
export const createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, slug, description, coverImage, date, location, speakers, agenda, partners, gallery, highlights, palette, fontClass, borderRadius, subscribe, themeMode } = req.body;

        const event = await prisma.event.create({
            data: {
                title,
                slug,
                description,
                coverImage,
                date: new Date(date),
                location,
                gallery: gallery || [],
                highlights: highlights || [],
                palette: palette || [],
                fontClass,
                borderRadius,
                subscribe,
                themeMode,
                speakers: {
                    create: speakers?.map((s: any) => {
                        const name = typeof s === 'string' ? s : s.name;
                        const role = typeof s === 'string' ? '' : s.role;
                        const photo = typeof s === 'string' ? null : s.photo;
                        const company = typeof s === 'string' ? null : s.company;
                        const link = typeof s === 'string' ? null : s.link;
                        const memberId = typeof s === 'string' ? null : s.memberId;
                        
                        return {
                            memberId,
                            name,
                            role,
                            photo,
                            company,
                            link
                        };
                    }) || []
                },
                agenda: {
                    create: agenda?.map((a: any) => ({
                        time: a.time,
                        title: a.title,
                        description: a.description,
                        speakerName: a.speakerName
                    })) || []
                },
                partners: partners ? {
                    connect: partners.map((id: number) => ({ id }))
                } : undefined
            },
            include: {
                speakers: { include: { member: true } },
                agenda: true,
                partners: true
            }
        });

        res.status(201).json({ success: true, data: event });
        logAudit(req, { action: 'CREATE', resource: 'events', resourceId: event.id, details: { title: event.title, slug: event.slug } });

    } catch (error: any) {
        console.error('Error creating event:', error);
        if (error.code === 'P2002') {
             res.status(400).json({ success: false, error: 'Event with this slug already exists.' });
             return;
        }
        res.status(500).json({ success: false, error: 'Failed to create event' });
    }
};

/**
 * @openapi
 * /api/events:
 *   get:
 *     summary: getEvents operation
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 */
export const getEvents = async (req: Request, res: Response): Promise<void> => {
    try {
        const events = await prisma.event.findMany({
            orderBy: { date: 'desc' },
            include: {
                speakers: { include: { member: true } },
                agenda: true,
                partners: true
            }
        });

        res.json({ success: true, data: events });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch events' });
    }
};

/**
 * @openapi
 * /api/events/{slug}:
 *   get:
 *     summary: getEventBySlug operation
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 */
export const getEventBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const { slug } = req.params;
        const event = await prisma.event.findUnique({
            where: { slug },
            include: {
                speakers: { include: { member: true } },
                agenda: true,
                partners: true
            }
        });

        if (!event) {
            res.status(404).json({ success: false, error: 'Event not found' });
            return;
        }

        res.json({ success: true, data: event });
    } catch (error) {
        console.error('Error fetching event details:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch event details' });
    }
};

/**
 * @openapi
 * /api/events/{id}:
 *   put:
 *     summary: updateEvent operation
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 */
export const updateEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, slug, description, coverImage, date, location, speakers, agenda, partners, gallery, highlights, palette, fontClass, borderRadius, subscribe, themeMode } = req.body;

        const event = await prisma.event.update({
            where: { id: Number(id) },
            data: {
                title,
                slug,
                description,
                coverImage,
                date: date ? new Date(date) : undefined,
                location,
                gallery,
                highlights,
                palette,
                fontClass,
                borderRadius,
                subscribe,
                themeMode,
                speakers: speakers ? {
                    deleteMany: {}, // Clear old speakers and re-insert
                    create: speakers.map((s: any) => {
                        const name = typeof s === 'string' ? s : s.name;
                        const role = typeof s === 'string' ? '' : s.role;
                        const photo = typeof s === 'string' ? null : s.photo;
                        const company = typeof s === 'string' ? null : s.company;
                        const link = typeof s === 'string' ? null : s.link;
                        const memberId = typeof s === 'string' ? null : s.memberId;
                        
                        return {
                            memberId,
                            name,
                            role,
                            photo,
                            company,
                            link
                        };
                    })
                } : undefined,
                agenda: agenda ? {
                    deleteMany: {}, // Clear old agenda and re-insert
                    create: agenda.map((a: any) => ({
                        time: a.time,
                        title: a.title,
                        description: a.description,
                        speakerName: a.speakerName
                    }))
                } : undefined,
                partners: partners ? {
                    set: partners.map((id: number) => ({ id }))
                } : undefined
            },
            include: {
                speakers: { include: { member: true } },
                agenda: true,
                partners: true
            }
        });

        res.json({ success: true, data: event });
        logAudit(req, { action: 'UPDATE', resource: 'events', resourceId: event.id, details: { title: event.title } });

    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ success: false, error: 'Failed to update event' });
    }
};

/**
 * @openapi
 * /api/events/{id}:
 *   delete:
 *     summary: deleteEvent operation
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 */
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        const actingUser = (req as AuthRequest).user;

        if (!actingUser || actingUser.role !== 'master') {
            res.status(403).json({ 
                success: false, 
                error: 'Somente Administradores Master possuem permissão para excluir eventos definitivamente.' 
            });
            return;
        }

        if (!password) {
            res.status(400).json({ 
                success: false, 
                error: 'A confirmação de senha é obrigatória para esta operação de segurança.' 
            });
            return;
        }

        // Find current user to get hashed password
        const user = await prisma.user.findUnique({
            where: { id: actingUser.id }
        });

        if (!user) {
            res.status(404).json({ success: false, error: 'Usuário administrador não encontrado.' });
            return;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ 
                success: false, 
                error: 'Senha incorreta. A exclusão foi cancelada por motivos de segurança.' 
            });
            return;
        }

        await prisma.event.delete({
            where: { id: Number(id) },
        });

        res.json({ success: true, message: 'Event deleted successfully' });
        logAudit(req, { action: 'DELETE', resource: 'events', resourceId: Number(id) });

    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ success: false, error: 'Failed to delete event' });
    }
};