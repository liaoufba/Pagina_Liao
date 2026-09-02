import { apiService } from '../services/api';

export type MediaFolder = 'events' | 'members' | 'tutors' | 'articles' | 'projects' | 'partners' | 'speakers' | 'carousel';

export const PENDING_MEDIA_PREFIX = 'pending-media:';

type PendingEntry = {
    file: File;
    folder: MediaFolder;
    previewUrl: string;
    refs: number;
    resolvedUrl?: string;
};

const pending = new Map<string, PendingEntry>();

function pendingId(value: string): string | null {
    if (!value.startsWith(PENDING_MEDIA_PREFIX)) return null;
    return value.slice(PENDING_MEDIA_PREFIX.length);
}

function getEntry(value: string): PendingEntry | undefined {
    const id = pendingId(value);
    return id ? pending.get(id) : undefined;
}

export function isPendingMedia(value: string): boolean {
    return typeof value === 'string' && value.startsWith(PENDING_MEDIA_PREFIX);
}

export function stashPendingMedia(file: File, folder: MediaFolder): string {
    const id = crypto.randomUUID();
    pending.set(id, {
        file,
        folder,
        previewUrl: URL.createObjectURL(file),
        refs: 0,
    });
    return `${PENDING_MEDIA_PREFIX}${id}`;
}

export function retainPendingMedia(value: string): void {
    const entry = getEntry(value);
    if (entry) entry.refs += 1;
}

export function releasePendingMedia(value: string): void {
    const id = pendingId(value);
    if (!id) return;
    const entry = pending.get(id);
    if (!entry) return;
    entry.refs -= 1;
    if (entry.refs > 0) return;
    URL.revokeObjectURL(entry.previewUrl);
    pending.delete(id);
}

export function peekPendingPreview(value: string): string | undefined {
    return getEntry(value)?.previewUrl;
}

export async function resolvePendingMedia(value: string): Promise<string> {
    if (!isPendingMedia(value)) return value;
    const entry = getEntry(value);
    if (!entry) {
        throw new Error('Arquivo pendente não encontrado. Selecione a imagem novamente.');
    }
    if (entry.resolvedUrl) return entry.resolvedUrl;

    const res = await apiService.uploadImage(entry.file, entry.folder) as { data?: { url?: string }; url?: string };
    const url = res?.data?.url || res?.url;
    if (!url) {
        throw new Error('Resposta de upload inválida.');
    }
    entry.resolvedUrl = url;
    return url;
}

export async function resolvePendingMediaTree<T>(data: T): Promise<T> {
    if (data == null) return data;
    if (typeof data === 'string') {
        return (await resolvePendingMedia(data)) as T;
    }
    if (Array.isArray(data)) {
        const next = await Promise.all(data.map((item) => resolvePendingMediaTree(item)));
        return next as T;
    }
    if (typeof data === 'object') {
        const entries = await Promise.all(
            Object.entries(data as Record<string, unknown>).map(async ([key, value]) => [
                key,
                await resolvePendingMediaTree(value),
            ])
        );
        return Object.fromEntries(entries) as T;
    }
    return data;
}
