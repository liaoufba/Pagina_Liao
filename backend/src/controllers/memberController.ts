import { Request, Response } from 'express';
import prisma from '../config/database';
import { logAudit } from '../middleware/auditLogger';

/**
 * @openapi
 * /api/members:
 *   get:
 *     summary: getMembers operation
 *     tags: [Members]
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
                    $ref: '#/components/schemas/Member'
 */
export const getMembers = async (req: Request, res: Response): Promise<void> => {
    try {
        const members = await prisma.member.findMany({
            orderBy: { name: 'asc' },
        });
        res.json({ success: true, data: members });
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch members' });
    }
};

/**
 * @openapi
 * /api/members:
 *   get:
 *     summary: getMemberById operation
 *     tags: [Members]
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
                    $ref: '#/components/schemas/Member'
 */
export const getMemberById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const member = await prisma.member.findUnique({
            where: { id: Number(id) },
        });

        if (!member) {
            res.status(404).json({ success: false, error: 'Member not found' });
            return;
        }

        res.json({ success: true, data: member });
    } catch (error) {
        console.error('Error fetching member:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch member' });
    }
};

// Restricted Director Roles
const RESTRICTED_ROLES = [
    'Diretor Geral',
    'Vice Diretor',
    'Dir. Secretaria Geral',
    'Dir. Acadêmica',
    'Dir. Relações Públicas',
    'Dir. Extensão',
    'Dir. Científico'
];

/**
 * @openapi
 * /api/members:
 *   post:
 *     summary: createMember operation
 *     tags: [Members]
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
                    $ref: '#/components/schemas/Member'
 */
export const createMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, role, photo, bio, course, isFounder, linkedin, github, year, isActive } = req.body;

        // 1. Validation for Restricted Roles (Directors)
        if (RESTRICTED_ROLES.includes(role) && isActive !== false) {
            // Check if role is already taken by an active member
            const existingDirector = await prisma.member.findFirst({
                where: {
                    role: role,
                    isActive: true, // Only active members hold the seat
                }
            });

            if (existingDirector) {
                res.status(400).json({
                    success: false,
                    error: `O cargo de ${role} já está ocupado por ${existingDirector.name}.`,
                });
                return;
            }
        }

        // 2. Validation for Founding Members limit
        if (isFounder) {
            const founderCount = await prisma.member.count({
                where: { isFounder: true },
            });

            if (founderCount >= 17) {
                res.status(400).json({
                    success: false,
                    error: 'Limit of 17 Founding Members reached. Cannot add another founder.',
                });
                return;
            }
        }

        const member = await prisma.member.create({
            data: {
                name,
                email,
                role: role || 'member',
                photo,
                bio,
                course,
                isFounder: isFounder || false,
                linkedin,
                github,
                year,
                isActive: isActive !== undefined ? isActive : true,
            },
        });

        res.status(201).json({ success: true, data: member });
        logAudit(req, { action: 'CREATE', resource: 'members', resourceId: member.id, details: { name: member.name, role: member.role } });

    } catch (error) {
        console.error('Error creating member:', error);
        res.status(500).json({ success: false, error: 'Failed to create member' });
    }
};

/**
 * @openapi
 * /api/members:
 *   put:
 *     summary: updateMember operation
 *     tags: [Members]
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
                    $ref: '#/components/schemas/Member'
 */
export const updateMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, email, role, photo, bio, course, isFounder, linkedin, github, year, isActive } = req.body;

        const memberId = Number(id);

        // 1. Validation for Restricted Roles (Directors)
        if (RESTRICTED_ROLES.includes(role) && isActive !== false) {
            // Check if role is taken by SOMEONE ELSE who is active
            const existingDirector = await prisma.member.findFirst({
                where: {
                    role: role,
                    isActive: true,
                    id: { not: memberId } // Exclude current member
                }
            });

            if (existingDirector) {
                res.status(400).json({
                    success: false,
                    error: `O cargo de ${role} já está ocupado por ${existingDirector.name}.`,
                });
                return;
            }
        }

        // 2. Validation for Founding Members limit if checking the box
        if (isFounder) {
            // Check if this member is ALREADY a founder (no change needed)
            const currentMember = await prisma.member.findUnique({
                where: { id: memberId },
                select: { isFounder: true }
            });

            if (currentMember && !currentMember.isFounder) {
                // If they were NOT a founder and we are making them one, check limit
                const founderCount = await prisma.member.count({
                    where: { isFounder: true },
                });

                if (founderCount >= 17) {
                    res.status(400).json({
                        success: false,
                        error: 'Limit of 17 Founding Members reached. Cannot add another founder.',
                    });
                    return;
                }
            }
        }

        const member = await prisma.member.update({
            where: { id: memberId },
            data: {
                name,
                email,
                role,
                photo,
                bio,
                course,
                isFounder,
                linkedin,
                github,
                year,
                isActive,
            },
        });

        res.json({ success: true, data: member });
        logAudit(req, { action: 'UPDATE', resource: 'members', resourceId: member.id, details: { name: member.name, role: member.role } });

    } catch (error) {
        console.error('Error updating member:', error);
        res.status(500).json({ success: false, error: 'Failed to update member' });
    }
};

/**
 * @openapi
 * /api/members:
 *   delete:
 *     summary: deleteMember operation
 *     tags: [Members]
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
                    $ref: '#/components/schemas/Member'
 */
export const deleteMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.member.delete({
            where: { id: Number(id) },
        });

        res.json({ success: true, message: 'Member deleted successfully' });
        logAudit(req, { action: 'DELETE', resource: 'members', resourceId: Number(id) });

    } catch (error) {
        console.error('Error deleting member:', error);
        res.status(500).json({ success: false, error: 'Failed to delete member' });
    }
};
