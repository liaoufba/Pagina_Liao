import { Request, Response } from 'express';
import prisma from '../config/database';
import { logAudit } from '../middleware/auditLogger';

/**
 * @openapi
 * /api/articles:
 *   post:
 *     summary: createArticle operation
 *     tags: [Articles]
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
                    $ref: '#/components/schemas/Article'
 */
export const createArticle = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, content, images, tags, references, isPublished, authorId, authorName } = req.body;

        if (images && images.length > 5) {
            res.status(400).json({ success: false, error: 'Maximum of 5 images allowed per article.' });
            return;
        }

        const article = await prisma.article.create({
            data: {
                title,
                description,
                content,
                images: images || [],
                tags: tags || [],
                references: references || [],
                isPublished: isPublished !== undefined ? isPublished : true,
                authorId: authorId ? Number(authorId) : null,
                authorName: authorName || null,
            },
            include: {
                authorMember: true,
            },
        });

        res.status(201).json({ success: true, data: article });
        logAudit(req, { action: 'CREATE', resource: 'newsletter', resourceId: article.id, details: { title: article.title } });

    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ success: false, error: 'Failed to create article' });
    }
};

/**
 * @openapi
 * /api/articles:
 *   get:
 *     summary: getArticles operation
 *     tags: [Articles]
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
                    $ref: '#/components/schemas/Article'
 */
export const getArticles = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tag, search } = req.query;

        const where: any = {
            isPublished: true, // By default public view
        };

        // Admin might want to see all, but let's assume public logic mostly here for filtering.
        // Actually, for admin table we likely want all. Let's add an ?all=true param maybe?
        // Or just return all and filter in frontend for specific views, but for public we usually modify this query.
        // For simplicity, let's return ALL and filter on frontend or add simple param.

        if (req.query.publishedOnly === 'true') {
            where.isPublished = true;
        }

        if (tag) {
            where.tags = {
                has: String(tag),
            };
        }

        if (search) {
            where.OR = [
                { title: { contains: String(search), mode: 'insensitive' } },
                { description: { contains: String(search), mode: 'insensitive' } },
                { content: { contains: String(search), mode: 'insensitive' } },
            ];
        }

        const articles = await prisma.article.findMany({
            where,
            include: { authorMember: true },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ success: true, data: articles });
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch articles' });
    }
};

/**
 * @openapi
 * /api/articles:
 *   delete:
 *     summary: deleteArticle operation
 *     tags: [Articles]
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
                    $ref: '#/components/schemas/Article'
 */
export const deleteArticle = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.article.delete({
            where: { id: Number(id) },
        });
        res.json({ success: true, message: 'Article deleted successfully' });
        logAudit(req, { action: 'DELETE', resource: 'newsletter', resourceId: Number(id) });

    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ success: false, error: 'Failed to delete article' });
    }
};

/**
 * @openapi
 * /api/articles:
 *   put:
 *     summary: updateArticle operation
 *     tags: [Articles]
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
                    $ref: '#/components/schemas/Article'
 */
export const updateArticle = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, description, content, images, tags, references, isPublished, authorId, authorName } = req.body;

        if (images && images.length > 5) {
            res.status(400).json({ success: false, error: 'Maximum of 5 images allowed per article.' });
            return;
        }

        const article = await prisma.article.update({
            where: { id: Number(id) },
            data: {
                title,
                description,
                content,
                images,
                tags,
                references,
                isPublished,
                authorId: authorId ? Number(authorId) : null,
                authorName: authorName || null,
            },
            include: {
                authorMember: true,
            },
        });

        res.json({ success: true, data: article });
        logAudit(req, { action: 'UPDATE', resource: 'newsletter', resourceId: article.id, details: { title: article.title } });

    } catch (error) {
        console.error('Error updating article:', error);
        res.status(500).json({ success: false, error: 'Failed to update article' });
    }
};

/**
 * @openapi
 * /api/articles/{id}/like:
 *   post:
 *     summary: toggleLikeArticle operation
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [like, unlike]
 *     responses:
 *       200:
 *         description: Successful response
 */
export const toggleLikeArticle = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        if (action !== 'like' && action !== 'unlike') {
            res.status(400).json({ success: false, error: "Action must be 'like' or 'unlike'" });
            return;
        }

        const incrementValue = action === 'like' ? 1 : -1;

        let article = await prisma.article.update({
            where: { id: Number(id) },
            data: {
                likes: {
                    increment: incrementValue
                }
            },
            include: {
                authorMember: true
            }
        });

        if (article.likes < 0) {
            article = await prisma.article.update({
                where: { id: Number(id) },
                data: { likes: 0 },
                include: { authorMember: true }
            });
        }

        res.json({ success: true, data: article });
    } catch (error) {
        console.error('Error in toggleLikeArticle:', error);
        res.status(500).json({ success: false, error: 'Failed to toggle like on article' });
    }
};
