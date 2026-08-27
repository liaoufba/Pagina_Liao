import { Request, Response } from 'express';
import prisma from '../config/database';

// Get ProSel info (just returns latest application stats)
/**
 * @openapi
 * /api/prosel:
 *   get:
 *     summary: getProSelInfo operation
 *     tags: [Prosel]
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
export const getProSelInfo = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const totalApplications = await prisma.application.count();
        const pendingApplications = await prisma.application.count({
            where: { status: 'pending' },
        });
        const approvedApplications = await prisma.application.count({
            where: { status: 'approved' },
        });

        res.json({
            success: true,
            data: {
                totalApplications,
                pendingApplications,
                approvedApplications,
                isOpen: true, // You can make this dynamic based on dates
            },
        });
    } catch (error) {
        console.error('Get ProSel info error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ProSel information',
        });
    }
};

// Submit application
/**
 * @openapi
 * /api/prosel:
 *   get:
 *     summary: submitApplication operation
 *     tags: [Prosel]
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
export const submitApplication = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { name, email, phone, course, semester, motivation } = req.body;

        if (!name || !email || !course || !semester || !motivation) {
            res.status(400).json({
                success: false,
                error: 'Name, email, course, semester, and motivation are required',
            });
            return;
        }

        const application = await prisma.application.create({
            data: {
                name,
                email,
                phone,
                course,
                semester: parseInt(semester),
                motivation,
            },
        });

        res.status(201).json({
            success: true,
            data: { application },
            message: 'Application submitted successfully',
        });
    } catch (error) {
        console.error('Submit application error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit application',
        });
    }
};

// Get all applications (admin only)
/**
 * @openapi
 * /api/prosel:
 *   get:
 *     summary: getAllApplications operation
 *     tags: [Prosel]
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
export const getAllApplications = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const applications = await prisma.application.findMany({
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: { applications },
        });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch applications',
        });
    }
};

// Update application status (admin only)
/**
 * @openapi
 * /api/prosel:
 *   put:
 *     summary: updateApplicationStatus operation
 *     tags: [Prosel]
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
export const updateApplicationStatus = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!status || !validStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                error: 'Valid status is required (pending, approved, or rejected)',
            });
            return;
        }

        const application = await prisma.application.update({
            where: { id: parseInt(id) },
            data: { status },
        });

        res.json({
            success: true,
            data: { application },
            message: 'Application status updated successfully',
        });
    } catch (error: any) {
        console.error('Update application error:', error);

        if (error.code === 'P2025') {
            res.status(404).json({
                success: false,
                error: 'Application not found',
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: 'Failed to update application',
        });
    }
};
