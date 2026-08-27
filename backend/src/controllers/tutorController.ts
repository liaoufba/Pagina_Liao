import { Request, Response } from 'express';
import prisma from '../config/database';
import { logAudit } from '../middleware/auditLogger';

// Get all tutors
/**
 * @openapi
 * /api/tutors:
 *   get:
 *     summary: getAllTutors operation
 *     tags: [Tutors]
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
                    $ref: '#/components/schemas/Tutor'
 */
export const getAllTutors = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const tutors = await prisma.tutor.findMany({
            orderBy: { name: 'asc' },
        });

        res.json({
            success: true,
            data: { tutors },
        });
    } catch (error) {
        console.error('Get tutors error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tutors',
        });
    }
};

// Get tutor by ID
/**
 * @openapi
 * /api/tutors:
 *   get:
 *     summary: getTutorById operation
 *     tags: [Tutors]
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
                    $ref: '#/components/schemas/Tutor'
 */
export const getTutorById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        const tutor = await prisma.tutor.findUnique({
            where: { id: parseInt(id) },
        });

        if (!tutor) {
            res.status(404).json({
                success: false,
                error: 'Tutor not found',
            });
            return;
        }

        res.json({
            success: true,
            data: { tutor },
        });
    } catch (error) {
        console.error('Get tutor error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tutor',
        });
    }
};

// Create tutor (admin only)
/**
 * @openapi
 * /api/tutors:
 *   post:
 *     summary: createTutor operation
 *     tags: [Tutors]
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
                    $ref: '#/components/schemas/Tutor'
 */
export const createTutor = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { name, email, photo, subjects, bio, availability } = req.body;

        if (!name || !email || !subjects) {
            res.status(400).json({
                success: false,
                error: 'Name, email, and subjects are required',
            });
            return;
        }

        // Check current tutor count
        const tutorCount = await prisma.tutor.count();
        if (tutorCount >= 3) {
            res.status(400).json({
                success: false,
                error: 'Maximum of 3 tutors allowed. Please delete a tutor before adding a new one.',
            });
            return;
        }

        const tutor = await prisma.tutor.create({
            data: {
                name,
                email,
                photo,
                subjects: Array.isArray(subjects) ? subjects : [subjects],
                bio,
                availability,
            },
        });

        res.status(201).json({
            success: true,
            data: { tutor },
            message: 'Tutor created successfully',
        });
        logAudit(req, { action: 'CREATE', resource: 'tutors', resourceId: tutor.id, details: { name: tutor.name } });
    } catch (error: any) {
        console.error('Create tutor error:', error);

        if (error.code === 'P2002') {
            res.status(400).json({
                success: false,
                error: 'Tutor with this email already exists',
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: 'Failed to create tutor',
        });
    }
};

// Update tutor (admin only)
/**
 * @openapi
 * /api/tutors:
 *   put:
 *     summary: updateTutor operation
 *     tags: [Tutors]
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
                    $ref: '#/components/schemas/Tutor'
 */
export const updateTutor = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, email, photo, subjects, bio, availability } = req.body;

        const tutor = await prisma.tutor.update({
            where: { id: parseInt(id) },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(photo !== undefined && { photo }),
                ...(subjects && { subjects: Array.isArray(subjects) ? subjects : [subjects] }),
                ...(bio !== undefined && { bio }),
                ...(availability !== undefined && { availability }),
            },
        });

        res.json({
            success: true,
            data: { tutor },
            message: 'Tutor updated successfully',
        });
        logAudit(req, { action: 'UPDATE', resource: 'tutors', resourceId: tutor.id, details: { name: tutor.name } });
    } catch (error: any) {
        console.error('Update tutor error:', error);

        if (error.code === 'P2025') {
            res.status(404).json({
                success: false,
                error: 'Tutor not found',
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: 'Failed to update tutor',
        });
    }
};

// Delete tutor (admin only)
/**
 * @openapi
 * /api/tutors:
 *   delete:
 *     summary: deleteTutor operation
 *     tags: [Tutors]
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
                    $ref: '#/components/schemas/Tutor'
 */
export const deleteTutor = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        await prisma.tutor.delete({
            where: { id: parseInt(id) },
        });

        res.json({
            success: true,
            message: 'Tutor deleted successfully',
        });
        logAudit(req, { action: 'DELETE', resource: 'tutors', resourceId: parseInt(id) });
    } catch (error: any) {
        console.error('Delete tutor error:', error);

        if (error.code === 'P2025') {
            res.status(404).json({
                success: false,
                error: 'Tutor not found',
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: 'Failed to delete tutor',
        });
    }
};
