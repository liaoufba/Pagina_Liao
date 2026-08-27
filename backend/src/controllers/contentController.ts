import { Request, Response } from 'express';
import prisma from '../config/database';

// Get content by type
/**
 * @openapi
 * /api/content:
 *   get:
 *     summary: getContentByType operation
 *     tags: [Contents]
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
                    $ref: '#/components/schemas/Content'
 */
export const getContentByType = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { type } = req.params;

        const validTypes = ['notice', 'faq', 'video'];
        if (!validTypes.includes(type)) {
            res.status(400).json({
                success: false,
                error: 'Invalid content type. Must be: notice, faq, or video',
            });
            return;
        }

        const content = await prisma.content.findMany({
            where: {
                type,
                published: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: { content },
        });
    } catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch content',
        });
    }
};

// Get content by ID
/**
 * @openapi
 * /api/content:
 *   get:
 *     summary: getContentById operation
 *     tags: [Contents]
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
                    $ref: '#/components/schemas/Content'
 */
export const getContentById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        const content = await prisma.content.findUnique({
            where: { id: parseInt(id) },
        });

        if (!content) {
            res.status(404).json({
                success: false,
                error: 'Content not found',
            });
            return;
        }

        res.json({
            success: true,
            data: { content },
        });
    } catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch content',
        });
    }
};

// Create content (admin only)
/**
 * @openapi
 * /api/content:
 *   post:
 *     summary: createContent operation
 *     tags: [Contents]
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
                    $ref: '#/components/schemas/Content'
 */
export const createContent = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { type, title, description, content, url, published } = req.body;

        const validTypes = ['notice', 'faq', 'video'];
        if (!type || !validTypes.includes(type)) {
            res.status(400).json({
                success: false,
                error: 'Valid type is required (notice, faq, or video)',
            });
            return;
        }

        if (!title || !content) {
            res.status(400).json({
                success: false,
                error: 'Title and content are required',
            });
            return;
        }

        const newContent = await prisma.content.create({
            data: {
                type,
                title,
                description,
                content,
                url,
                published: published !== undefined ? published : true,
            },
        });

        res.status(201).json({
            success: true,
            data: { content: newContent },
            message: 'Content created successfully',
        });
    } catch (error) {
        console.error('Create content error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create content',
        });
    }
};

// Update content (admin only)
/**
 * @openapi
 * /api/content:
 *   put:
 *     summary: updateContent operation
 *     tags: [Contents]
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
                    $ref: '#/components/schemas/Content'
 */
export const updateContent = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { type, title, description, content, url, published } = req.body;

        const validTypes = ['notice', 'faq', 'video'];
        if (type && !validTypes.includes(type)) {
            res.status(400).json({
                success: false,
                error: 'Invalid type. Must be: notice, faq, or video',
            });
            return;
        }

        const updatedContent = await prisma.content.update({
            where: { id: parseInt(id) },
            data: {
                ...(type && { type }),
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(content && { content }),
                ...(url !== undefined && { url }),
                ...(published !== undefined && { published }),
            },
        });

        res.json({
            success: true,
            data: { content: updatedContent },
            message: 'Content updated successfully',
        });
    } catch (error: any) {
        console.error('Update content error:', error);

        if (error.code === 'P2025') {
            res.status(404).json({
                success: false,
                error: 'Content not found',
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: 'Failed to update content',
        });
    }
};

// Delete content (admin only)
/**
 * @openapi
 * /api/content:
 *   delete:
 *     summary: deleteContent operation
 *     tags: [Contents]
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
                    $ref: '#/components/schemas/Content'
 */
export const deleteContent = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        await prisma.content.delete({
            where: { id: parseInt(id) },
        });

        res.json({
            success: true,
            message: 'Content deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete content error:', error);

        if (error.code === 'P2025') {
            res.status(404).json({
                success: false,
                error: 'Content not found',
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: 'Failed to delete content',
        });
    }
};
