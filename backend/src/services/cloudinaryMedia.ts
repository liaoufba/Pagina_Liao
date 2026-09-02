import { v2 as cloudinary } from 'cloudinary';
import prisma from '../config/database';

const MIGRATED_PREFIXES = [
    'liao/events/',
    'liao/members/',
    'liao/tutors/',
    'liao/articles/',
    'liao/projects/',
    'liao/partners/',
    'liao/speakers/',
    'liao/carousel/',
    'liao/other/',
];

export function cloudinaryEnvFolder(): 'prod' | 'dev' {
    return process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
}

export function cloudinaryUploadFolder(kind: string): string {
    return `liao/${cloudinaryEnvFolder()}/${kind}`;
}

export function ownedPublicIdPrefixes(): string[] {
    if (process.env.NODE_ENV === 'production') {
        return [`liao/prod/`, ...MIGRATED_PREFIXES];
    }
    return ['liao/dev/'];
}

export function configuredCloudName(): string {
    const fromConfig = cloudinary.config().cloud_name;
    if (fromConfig) return fromConfig;
    const match = (process.env.CLOUDINARY_URL || '').match(/@([^/]+)/);
    return match?.[1] || '';
}

export function collectMediaUrls(value: unknown, depth = 0): string[] {
    if (value == null || depth > 6) return [];
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed || trimmed.startsWith('pending-media:') || trimmed.startsWith('<')) return [];
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image')) {
            return [trimmed];
        }
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            try {
                return collectMediaUrls(JSON.parse(trimmed), depth + 1);
            } catch {
                return [];
            }
        }
        return [];
    }
    if (Array.isArray(value)) {
        return value.flatMap((item) => collectMediaUrls(item, depth + 1));
    }
    if (typeof value === 'object') {
        return Object.values(value).flatMap((item) => collectMediaUrls(item, depth + 1));
    }
    return [];
}

export function parseCloudinaryPublicId(url: string): { cloud: string; publicId: string } | null {
    try {
        const parsed = new URL(url.trim());
        if (!parsed.hostname.endsWith('cloudinary.com')) return null;
        const parts = parsed.pathname.split('/').filter(Boolean);
        const uploadIdx = parts.indexOf('upload');
        if (uploadIdx < 1) return null;
        const cloud = parts[0];
        let index = uploadIdx + 1;
        while (index < parts.length) {
            const segment = parts[index];
            if (/^v\d+$/.test(segment)) {
                index += 1;
                break;
            }
            if (
                segment.includes(',') ||
                /^(c_|w_|h_|f_|q_|fl_|dpr_|e_|b_|l_|t_|ar_|g_|x_|y_|so_|du_)/.test(segment)
            ) {
                index += 1;
                continue;
            }
            break;
        }
        const publicIdWithExt = parts.slice(index).join('/');
        if (!publicIdWithExt) return null;
        const publicId = publicIdWithExt.replace(/\.[a-z0-9]+$/i, '');
        return { cloud, publicId };
    } catch {
        return null;
    }
}

export function isOwnedPublicId(publicId: string): boolean {
    return ownedPublicIdPrefixes().some((prefix) => publicId.startsWith(prefix));
}

export function ownedPublicIdsFromUrls(urls: Iterable<string>): Set<string> {
    const cloud = configuredCloudName();
    const ids = new Set<string>();
    for (const url of urls) {
        const parsed = parseCloudinaryPublicId(url);
        if (!parsed) continue;
        if (cloud && parsed.cloud !== cloud) continue;
        if (!isOwnedPublicId(parsed.publicId)) continue;
        ids.add(parsed.publicId);
    }
    return ids;
}

export async function loadReferencedPublicIds(): Promise<Set<string>> {
    const [events, speakers, members, tutors, articles, projects, partners, configs] = await Promise.all([
        prisma.event.findMany({ select: { coverImage: true, gallery: true } }),
        prisma.eventSpeaker.findMany({ select: { photo: true } }),
        prisma.member.findMany({ select: { photo: true } }),
        prisma.tutor.findMany({ select: { photo: true } }),
        prisma.article.findMany({ select: { images: true } }),
        prisma.project.findMany({ select: { images: true } }),
        prisma.partner.findMany({ select: { imageUrl: true } }),
        prisma.systemConfig.findMany({ select: { value: true } }),
    ]);

    return ownedPublicIdsFromUrls([
        ...collectMediaUrls(events),
        ...collectMediaUrls(speakers),
        ...collectMediaUrls(members),
        ...collectMediaUrls(tutors),
        ...collectMediaUrls(articles),
        ...collectMediaUrls(projects),
        ...collectMediaUrls(partners),
        ...collectMediaUrls(configs),
    ]);
}

async function destroyPublicId(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
    } catch (error) {
        console.error(`Failed to destroy Cloudinary asset ${publicId}:`, error);
    }
}

export async function destroyUnreferencedPublicIds(publicIds: Iterable<string>): Promise<void> {
    const referenced = await loadReferencedPublicIds();
    const jobs: Promise<void>[] = [];
    for (const publicId of publicIds) {
        if (!isOwnedPublicId(publicId)) continue;
        if (referenced.has(publicId)) continue;
        jobs.push(destroyPublicId(publicId));
    }
    await Promise.allSettled(jobs);
}

export async function destroyOwnedOrphans(oldUrls: Iterable<string>, newUrls: Iterable<string>): Promise<void> {
    const removed = ownedPublicIdsFromUrls(oldUrls);
    for (const id of ownedPublicIdsFromUrls(newUrls)) {
        removed.delete(id);
    }
    if (removed.size === 0) return;
    await destroyUnreferencedPublicIds(removed);
}

export async function cleanupReplacedMedia(previous: unknown, next: unknown): Promise<void> {
    await destroyOwnedOrphans(collectMediaUrls(previous), collectMediaUrls(next));
}
