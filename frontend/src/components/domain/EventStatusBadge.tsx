import React from 'react';

interface EventStatusBadgeProps {
    date: string | Date;
    size?: 'sm' | 'md';
}

export const EventStatusBadge: React.FC<EventStatusBadgeProps> = ({ date, size = 'sm' }) => {
    const isFinished = new Date(date) < new Date();

    if (isFinished) {
        return (
            <span className={`bg-neutral-900/80 dark:bg-neutral-900/90 backdrop-blur-md text-neutral-300 rounded-full font-medium flex items-center gap-1.5 shadow-sm border border-neutral-700/50 ${
                size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'
            }`}>
                <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
                Realizado
            </span>
        );
    }

    return (
        <span className={`bg-emerald-600/90 dark:bg-emerald-500/90 backdrop-blur-md text-white rounded-full font-semibold flex items-center gap-1.5 shadow-sm border border-emerald-400/30 ${
            size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'
        }`}>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            Próximo
        </span>
    );
};

export default EventStatusBadge;
