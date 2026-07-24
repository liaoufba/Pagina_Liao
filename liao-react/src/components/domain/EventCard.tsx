import React from 'react';
import type { EventApi } from '../../models/Event';
import EventStatusBadge from './EventStatusBadge';
import MediaContentCard from './MediaContentCard';

export interface EventCardProps {
    event: EventApi;
    viewMode?: 'card' | 'list' | 'grid';
}

const EventCard: React.FC<EventCardProps> = ({ event, viewMode = 'card' }) => {
    const eventDate = new Date(event.date as string).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    let text = event.description;
    if (typeof event.description === 'string') {
        const trimmed = event.description.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
                const sanitized = trimmed.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
                const parsed = JSON.parse(sanitized);
                if (parsed?.presentation?.content) {
                    text = parsed.presentation.content;
                }
            } catch (e) {
                try {
                    const parsed = JSON.parse(trimmed);
                    if (parsed?.presentation?.content) {
                        text = parsed.presentation.content;
                    }
                } catch (e2) {}
            }
        }
    }

    return (
        <MediaContentCard
            to={`/events/${event.slug}`}
            image={event.coverImage}
            imageAlt={event.title}
            title={event.title}
            description={text}
            dateBadge={eventDate}
            topRightBadge={<EventStatusBadge date={event.date as string} />}
            location={event.location}
            actionLabel="Saber mais"
            hoverOverlayText="Ver detalhes"
            viewMode={viewMode}
        />
    );
};

export default EventCard;
