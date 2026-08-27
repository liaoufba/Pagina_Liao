import { Request, Response } from 'express';
import prisma from '../config/database';
import { logAudit } from '../middleware/auditLogger';

// Get all partners
/**
 * @openapi
 * /api/partners:
 *   get:
 *     summary: getAllPartners operation
 *     tags: [Partners]
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
 *                     $ref: '#/components/schemas/Partner'
 */
export const getAllPartners = async (req: Request, res: Response) => {
    try {
        const partners = await prisma.partner.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                events: { select: { id: true, title: true, slug: true } },
            },
        });

        res.json({
            success: true,
            data: partners,
        });
    } catch (error) {
        console.error('Error fetching partners:', error);
        res.status(500).json({ error: 'Failed to fetch partners' });
    }
};

// Create a new partner
/**
 * @openapi
 * /api/partners:
 *   post:
 *     summary: createPartner operation
 *     tags: [Partners]
 *     responses:
 *       201:
 *         description: Partner created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Partner'
 */
export const createPartner = async (req: Request, res: Response) => {
    console.log('Creating partner:', req.body);
    try {
        const { name, imageUrl, websiteUrl, isLeaguePartner, eventIds } = req.body;

        if (!name || name.trim() === '') {
            res.status(400).json({ success: false, error: 'O nome da parceria é obrigatório' });
            return;
        }

        if (!imageUrl || imageUrl.trim() === '') {
            res.status(400).json({ success: false, error: 'A URL da logo é obrigatória' });
            return;
        }

        const partner = await prisma.partner.create({
            data: {
                name: name.trim(),
                imageUrl: imageUrl.trim(),
                websiteUrl: websiteUrl ? websiteUrl.trim() : null,
                isLeaguePartner: isLeaguePartner !== undefined ? isLeaguePartner : true,
                // Connect to specific events if provided (event-only partners)
                events: eventIds && Array.isArray(eventIds) && eventIds.length > 0
                    ? { connect: eventIds.map((id: number) => ({ id })) }
                    : undefined,
            } as any,
            include: { events: { select: { id: true, title: true, slug: true } } },
        });

        res.status(201).json({
            success: true,
            data: partner,
        });
        logAudit(req, { action: 'CREATE', resource: 'partners', resourceId: partner.id, details: { name: partner.name } });

    } catch (error) {
        console.error('Error creating partner:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao criar parceiro' });
    }
};

// Update a partner
/**
 * @openapi
 * /api/partners/{id}:
 *   put:
 *     summary: updatePartner operation
 *     tags: [Partners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *                   $ref: '#/components/schemas/Partner'
 */
export const updatePartner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, imageUrl, websiteUrl, isLeaguePartner, eventIds } = req.body;

        if (!name || name.trim() === '') {
            res.status(400).json({ success: false, error: 'O nome da parceria é obrigatório' });
            return;
        }

        if (!imageUrl || imageUrl.trim() === '') {
            res.status(400).json({ success: false, error: 'A URL da logo é obrigatória' });
            return;
        }

        const partner = await prisma.partner.update({
            where: {
                id: parseInt(id),
            },
            data: {
                name: name.trim(),
                imageUrl: imageUrl.trim(),
                websiteUrl: websiteUrl ? websiteUrl.trim() : null,
                isLeaguePartner: isLeaguePartner !== undefined ? !!isLeaguePartner : true,
                // If event-only partner, replace its event connections
                events: eventIds && Array.isArray(eventIds)
                    ? { set: eventIds.map((id: number) => ({ id })) }
                    : undefined,
            } as any,
            include: { events: { select: { id: true, title: true, slug: true } } },
        });

        res.json({
            success: true,
            data: partner,
        });
        logAudit(req, { action: 'UPDATE', resource: 'partners', resourceId: partner.id, details: { name: partner.name } });

    } catch (error: any) {
        console.error('Error updating partner:', error);
        if (error.code === 'P2025') {
            res.status(404).json({ success: false, error: 'Parceiro não encontrado' });
            return;
        }
        res.status(500).json({ success: false, error: 'Erro interno ao atualizar parceiro' });
    }
};

// Delete a partner
/**
 * @openapi
 * /api/partners/{id}:
 *   delete:
 *     summary: deletePartner operation
 *     tags: [Partners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *                 message:
 *                   type: string
 */
export const deletePartner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.partner.delete({
            where: {
                id: parseInt(id),
            },
        });

        res.json({
            success: true,
            message: 'Partner deleted successfully',
        });
        logAudit(req, { action: 'DELETE', resource: 'partners', resourceId: parseInt(id) });

    } catch (error: any) {
        console.error('Error deleting partner:', error);
        if (error.code === 'P2025') {
            res.status(404).json({ success: false, error: 'Parceiro não encontrado' });
            return;
        }
        res.status(500).json({ success: false, error: 'Erro interno ao deletar parceiro' });
    }
};
