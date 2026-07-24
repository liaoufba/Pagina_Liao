import React from 'react';
import type { EventApi } from '../../models/Event';
import EventCard from './EventCard';

interface EventGridProps {
    events: EventApi[];
    emptyState?: {
        icon?: React.ReactNode;
        title: string;
        description: string;
        variant?: 'emerald' | 'neutral';
    };
}

export const EventGrid: React.FC<EventGridProps> = ({ events, emptyState }) => {
    if (events.length === 0 && emptyState) {
        const isEmerald = emptyState.variant === 'emerald';
        return (
            <div className={`text-center py-12 px-6 rounded-2xl border border-dashed ${
                isEmerald 
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40'
                    : 'bg-white dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700'
            }`}>
                {emptyState.icon && (
                    <div className="flex justify-center mb-3">
                        {emptyState.icon}
                    </div>
                )}
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                    {emptyState.title}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-md mx-auto">
                    {emptyState.description}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
                <EventCard key={event.id} event={event} />
            ))}
        </div>
    );
};

export default EventGrid;
