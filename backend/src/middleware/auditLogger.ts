import prisma from '../config/database';
import { AuthRequest } from '../types';
import { Request } from 'express';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditOptions {
    action: AuditAction;
    resource: string;
    resourceId?: number;
    details?: Record<string, any>;
}

/**
 * Logs an admin action to the AuditLog table.
 * Should be called after successful mutations in controllers.
 */
export const logAudit = async (
    req: Request,
    options: AuditOptions
): Promise<void> => {
    try {
        const user = (req as AuthRequest).user;
        if (!user) return;

        await (prisma as any).auditLog.create({
            data: {
                userId: user.id,
                userName: user.email,
                action: options.action,
                resource: options.resource,
                resourceId: options.resourceId || null,
                details: options.details ? JSON.stringify(options.details) : null,
            },
        });
    } catch (err) {
        // Audit failures should never break the main request
        console.error('[AUDIT] Failed to write audit log:', err);
    }
};
