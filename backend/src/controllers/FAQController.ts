import { Request, Response } from 'express';
import prisma from '../config/database';
import { logAudit } from '../middleware/auditLogger';
import { AuthRequest } from '../types';

export const getFAQsByEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { eventId } = req.params;
        const faqs = await prisma.fAQ.findMany({
            where: { eventId: Number(eventId) },
            orderBy: { order: 'asc' }
        });
        res.json({ success: true, data: faqs });
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch FAQs' });
    }
};

export const createFAQ = async (req: Request, res: Response): Promise<void> => {
    try {
        const { eventId, question, answer, order } = req.body;
        
        const faq = await prisma.fAQ.create({
            data: {
                eventId: Number(eventId),
                question,
                answer,
                order: order || 0
            }
        });

        res.json({ success: true, data: faq });
        logAudit(req, { 
            action: 'CREATE', 
            resource: 'faqs', 
            resourceId: faq.id, 
            details: { eventId, question } 
        });
    } catch (error) {
        console.error('Error creating FAQ:', error);
        res.status(500).json({ success: false, error: 'Failed to create FAQ' });
    }
};

export const updateFAQ = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { question, answer, order } = req.body;

        const faq = await prisma.fAQ.update({
            where: { id: Number(id) },
            data: { question, answer, order }
        });

        res.json({ success: true, data: faq });
        logAudit(req, { 
            action: 'UPDATE', 
            resource: 'faqs', 
            resourceId: faq.id, 
            details: { question } 
        });
    } catch (error) {
        console.error('Error updating FAQ:', error);
        res.status(500).json({ success: false, error: 'Failed to update FAQ' });
    }
};

export const deleteFAQ = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        await prisma.fAQ.delete({
            where: { id: Number(id) }
        });

        res.json({ success: true, message: 'FAQ deleted successfully' });
        logAudit(req, { 
            action: 'DELETE', 
            resource: 'faqs', 
            resourceId: Number(id) 
        });
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        res.status(500).json({ success: false, error: 'Failed to delete FAQ' });
    }
};
