
import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * @openapi
 * /api/config:
 *   get:
 *     summary: getConfig operation
 *     tags: [Config]
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
export const getConfig = async (req: Request, res: Response): Promise<void> => {
    try {
        const { key } = req.params;
        const config = await prisma.systemConfig.findUnique({
            where: { key },
        });

        res.json({
            success: true,
            data: config ? config.value : null,
        });
    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch configuration' });
    }
};

/**
 * @openapi
 * /api/config:
 *   put:
 *     summary: updateConfig operation
 *     tags: [Config]
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
export const updateConfig = async (req: Request, res: Response): Promise<void> => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        if (!value) {
            res.status(400).json({ success: false, error: 'Value is required' });
            return;
        }

        const config = await prisma.systemConfig.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });

        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).json({ success: false, error: 'Failed to update configuration' });
    }
};
