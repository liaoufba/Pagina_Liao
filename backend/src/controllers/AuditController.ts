import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * GET /api/audit
 * Query params: resource, startDate, endDate, page (optional)
 */
export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const { resource, startDate, endDate, page = '1', limit = '50' } = req.query;

        const where: any = {};

        if (resource && typeof resource === 'string') {
            where.resource = resource;
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate as string);
            if (endDate) {
                // Include the full endDate day (set to end of day)
                const end = new Date(endDate as string);
                end.setHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }

        const pageNum = parseInt(page as string) || 1;
        const limitNum = Math.min(parseInt(limit as string) || 50, 200);
        const skip = (pageNum - 1) * limitNum;

        const [logs, total] = await Promise.all([
            (prisma as any).auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limitNum,
                skip,
                include: {
                    user: {
                        select: { id: true, name: true, email: true, role: true },
                    },
                },
            }),
            (prisma as any).auditLog.count({ where }),
        ]);

        res.json({
            success: true,
            data: logs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ success: false, error: 'Falha ao buscar histórico.' });
    }
};
