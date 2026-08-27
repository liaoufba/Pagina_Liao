import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AuthRequest, JWTPayload } from '../types';

// Login
/**
 * @openapi
 * /api/auth:
 *   post:
 *     summary: login operation
 *     tags: [Auth]
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
                    type: object
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Email and password are required',
            });
            return;
        }

        // Find user by email or name
        const user = await (prisma.user.findFirst as any)({
            where: {
                OR: [
                    { email },
                    { name: email }
                ]
            },
            select: {
                id: true, email: true, password: true,
                name: true, role: true, permissions: true,
            },
        });

        if (!user) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
            return;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
            return;
        }

        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
        const payload: JWTPayload = {
            id: user.id,
            email: user.email,
            role: user.role as any,
            permissions: (user as any).permissions || [],
        };

        const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    permissions: (user as any).permissions || [],
                },
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: `Login failed: ${(error as any).message}`,
        });
    }
};

// Register (admin only)
/**
 * @openapi
 * /api/auth:
 *   post:
 *     summary: register operation
 *     tags: [Auth]
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
                    type: object
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        // Enforce Master Admin permission
        const actingUser = (req as any).user;

        if (!actingUser || actingUser.role !== 'master') {
            res.status(403).json({
                success: false,
                error: 'Somente Administradores Master podem adicionar novos administradores.',
            });
            return;
        }

        const { email, password, name, permissions } = req.body;

        if (!email || !password || !name) {
            res.status(400).json({
                success: false,
                error: 'Email, password, and name are required',
            });
            return;
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            res.status(400).json({
                success: false,
                error: 'User with this email already exists',
            });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with optional granular permissions
        const user = await (prisma.user.create as any)({
            data: {
                email,
                password: hashedPassword,
                name,
                permissions: Array.isArray(permissions) ? permissions : [],
            },
        });

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    permissions: (user as any).permissions || [],
                },
            },
            message: 'Admin user created successfully',
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed',
        });
    }
};

// Get current user
/**
 * @openapi
 * /api/auth:
 *   get:
 *     summary: getCurrentUser operation
 *     tags: [Auth]
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
                    type: object
 */
export const getCurrentUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const authReq = req as AuthRequest;

        if (!authReq.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: authReq.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }

        res.json({
            success: true,
            data: { user },
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user information',
        });
    }
};


// Get all admins
/**
 * @openapi
 * /api/auth:
 *   get:
 *     summary: getAdmins operation
 *     tags: [Auth]
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
                    type: object
 */
export const getAdmins = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await (prisma.user.findMany as any)({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                permissions: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch admins',
        });
    }
};



// Delete admin
/**
 * @openapi
 * /api/auth:
 *   delete:
 *     summary: deleteUser operation
 *     tags: [Auth]
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
                    type: object
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const actingUser = (req as any).user;
        const actingUserId = actingUser.id;
        const targetUserId = parseInt(req.params.id);

        if (!actingUser) {
            res.status(403).json({ success: false, error: 'Unauthorized' });
            return;
        }

        const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
        if (!targetUser) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        const isActingMaster = actingUser.role === 'master';
        const isTargetMaster = targetUser.role === 'master';

        // SELF DELETION
        if (actingUserId === targetUserId) {
            if (isActingMaster) {
                // Check remaining masters
                const masterCount = await prisma.user.count({
                    where: { role: 'master' }
                });

                if (masterCount <= 2) {
                    res.status(403).json({
                        success: false,
                        error: 'Não é possível excluir. O sistema deve manter no mínimo 2 Administradores Master.'
                    });
                    return;
                }
            }
            // Allow deletion
        }
        // MASTER DELETING OTHERS
        else {
            if (!isActingMaster) {
                res.status(403).json({ success: false, error: 'Apenas Administradores Master podem excluir outros usuários.' });
                return;
            }

            if (isTargetMaster) {
                res.status(403).json({ success: false, error: 'Administradores Master não podem excluir uns aos outros.' });
                return;
            }
        }

        await prisma.user.delete({ where: { id: targetUserId } });

        res.json({ success: true, message: 'Administrador excluído com sucesso.' });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, error: 'Failed to delete user' });
    }
};
