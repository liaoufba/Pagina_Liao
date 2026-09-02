import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryUploadFolder } from '../services/cloudinaryMedia';

const ALLOWED_FOLDERS = ['events', 'members', 'tutors', 'articles', 'projects', 'partners', 'speakers', 'carousel'] as const;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);

function withAutoFormat(secureUrl: string): string {
    return secureUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
}

/**
 * @openapi
 * /api/uploads:
 *   post:
 *     summary: Upload an image to Cloudinary
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *     responses:
 *       200:
 *         description: Uploaded image URL
 */
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!process.env.CLOUDINARY_URL) {
            res.status(500).json({ success: false, error: 'Cloudinary não está configurado.' });
            return;
        }

        const file = req.file;
        if (!file) {
            res.status(400).json({ success: false, error: 'Selecione um arquivo de imagem.' });
            return;
        }
        if (!ALLOWED_MIME.has(file.mimetype)) {
            res.status(400).json({ success: false, error: 'Formato não suportado. Use JPG, PNG, WebP, GIF ou SVG.' });
            return;
        }

        const requestedFolder = String(req.body.folder || 'other');
        const folder = ALLOWED_FOLDERS.includes(requestedFolder as (typeof ALLOWED_FOLDERS)[number])
            ? requestedFolder
            : 'other';

        const result = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: cloudinaryUploadFolder(folder),
                    resource_type: 'image',
                    unique_filename: true,
                    overwrite: false,
                },
                (error, uploaded) => {
                    if (error || !uploaded) {
                        reject(error || new Error('Falha no upload.'));
                        return;
                    }
                    resolve(uploaded);
                }
            );
            stream.end(file.buffer);
        });

        res.json({
            success: true,
            data: {
                url: withAutoFormat(result.secure_url),
                publicId: result.public_id,
            },
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        const message = error instanceof Error ? error.message : 'Falha ao enviar imagem.';
        res.status(500).json({ success: false, error: message });
    }
};
