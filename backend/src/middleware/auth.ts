import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JWTPayload } from '../types';

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'No token provided. Authentication required.',
            });
            return;
        }

        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';

        const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

        (req as AuthRequest).user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            permissions: decoded.permissions || [],
        };

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Invalid or expired token.',
        });
    }
};

// Admin-only middleware
export const requireAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authReq = req as AuthRequest;

    if (!authReq.user || !['admin', 'master'].includes(authReq.user.role)) {
        res.status(403).json({
            success: false,
            error: 'Admin access required.',
        });
        return;
    }

    next();
};

/**
 * Permission-based middleware.
 * Master users always pass. Regular admins must have the resource in their permissions array.
 */
export const requirePermission = (resource: string) => (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
        res.status(401).json({ success: false, error: 'Não autenticado.' });
        return;
    }

    // Master has unrestricted access
    if (authReq.user.role === 'master') {
        return next();
    }

    // Check granular permission
    if (authReq.user.permissions && authReq.user.permissions.includes(resource)) {
        return next();
    }

    res.status(403).json({
        success: false,
        error: `Sem permissão para gerenciar "${resource}". Contate um Administrador Master.`,
    });
};
