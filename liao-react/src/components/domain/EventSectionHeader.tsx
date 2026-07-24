import React from 'react';

interface EventSectionHeaderProps {
    title: string;
    subtitle?: string;
    count: number;
    countSingularLabel?: string;
    countPluralLabel?: string;
    icon: React.ReactNode;
    type?: 'upcoming' | 'finished';
}

export const EventSectionHeader: React.FC<EventSectionHeaderProps> = ({
    title,
    subtitle,
    count,
    countSingularLabel = 'agendado',
    countPluralLabel = 'agendados',
    icon,
    type = 'upcoming'
}) => {
    const isUpcoming = type === 'upcoming';

    return (
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-sm ${
                    isUpcoming
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                }`}>
                    {icon}
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-3">
                        {title}
                        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                            isUpcoming
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
                        }`}>
                            {count} {count === 1 ? countSingularLabel : countPluralLabel}
                        </span>
                    </h2>
                    {subtitle && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventSectionHeader;
