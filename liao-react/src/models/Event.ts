import type { components } from '@liao/api-types';
import type { Partner } from './Partner';

export type AgendaItem = components["schemas"]["AgendaItem"];
export type EventSpeaker = components["schemas"]["EventSpeaker"];
export type Member = components["schemas"]["Member"];

export interface EventMaterials {
    slidesUrl?: string;
    recordingUrl?: string;
    photosUrl?: string;
    certificatesUrl?: string;
}

export type EventApi = components["schemas"]["Event"] & {
    agenda: AgendaItem[];
    speakers: (EventSpeaker & { member?: Member | null })[];
    partners: Partner[];
    materials?: EventMaterials;
};

