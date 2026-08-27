import type { components } from '@liao/api-types';

export type Content = components["schemas"]["Content"] & {
    type: 'notice' | 'faq' | 'video';
};

export type Application = components["schemas"]["Application"] & {
    status: 'pending' | 'approved' | 'rejected';
};
