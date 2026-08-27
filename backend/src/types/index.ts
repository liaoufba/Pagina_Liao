import { Request } from 'express';

// Extend Express Request to include user from JWT
export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
        permissions: string[];
    };
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// Auth types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    permissions?: string[];
}

export interface JWTPayload {
    id: number;
    email: string;
    role: string;
    permissions: string[];
}
