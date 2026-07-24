import React from 'react';
import { IoStatsChartOutline as StatsIcon, IoSparkles as SparklesIcon } from 'react-icons/io5';
import FadeInSection from './FadeInSection';

export interface EventStat {
    id: string;
    value: string;
    label: string;
    icon?: React.ReactNode;
    change?: string;
    description?: string;
    category?: string;
    accentColor?: string;
}

interface EventStatsProps {
    stats: EventStat[];
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    columns?: 2 | 3 | 4;
    className?: string;
}

export const StatCard: React.FC<{ stat: EventStat; accentColor?: string }> = ({ stat }) => {
    return (
        <div 
            className="group relative p-6 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200/90 dark:border-white/5 hover:border-[var(--event-primary,theme(colors.primary.500))]/40 hover:border-primary-500/40 transition-all duration-500 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1"
        >
            {/* Hover highlight */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--event-primary,theme(colors.primary.500))]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between">
                    {stat.icon ? (
                        <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-neutral-800/90 text-primary-600 dark:text-primary-400 flex items-center justify-center border border-primary-100 dark:border-neutral-700/60 transition-transform duration-300 group-hover:scale-110 shadow-xs">
                            {stat.icon}
                        </div>
                    ) : (
                        <div />
                    )}
                    {stat.change && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
                            {stat.change}
                        </span>
                    )}
                </div>

                <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-700 dark:from-white dark:via-white dark:to-neutral-300 group-hover:from-[var(--event-primary,theme(colors.primary.600))] group-hover:to-[var(--event-secondary,theme(colors.primary.400))] group-hover:from-primary-600 group-hover:to-primary-400 transition-all duration-500">
                    {stat.value}
                </div>
                
                <div className="text-xs md:text-sm font-semibold text-neutral-800 dark:text-neutral-200 leading-snug">
                    {stat.label}
                </div>

                {stat.description && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed pt-1 font-normal">
                        {stat.description}
                    </p>
                )}
            </div>

            <div className="relative z-10 pt-4 flex items-center justify-between mt-auto border-t border-neutral-100 dark:border-neutral-800/60">
                {stat.category ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        {stat.category}
                    </span>
                ) : <span />}
                <SparklesIcon size={14} className="text-neutral-400 dark:text-neutral-600 group-hover:text-[var(--event-primary,theme(colors.primary.500))] group-hover:text-primary-500 transition-colors duration-300" />
            </div>
        </div>
    );
};

const EventStats: React.FC<EventStatsProps> = ({ 
    stats, 
    title = "O Evento em Números", 
    subtitle = "Resultados e impacto alcançados nesta edição",
    icon,
    columns,
    className = ""
}) => {
    if (!stats || stats.length === 0) return null;

    const gridCols = columns 
        ? columns === 4 ? 'lg:grid-cols-4' : columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
        : (stats.length >= 4 ? 'lg:grid-cols-4' : stats.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2');

    return (
        <FadeInSection delay="delay-150">
            <div className={`my-12 p-8 md:p-10 rounded-3xl bg-neutral-200/50 dark:bg-white/[0.02] border border-neutral-300/70 dark:border-white/10 relative overflow-hidden backdrop-blur-xl shadow-lg ${className}`}>
                {/* Background glow accent */}
                <div 
                    className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none"
                    style={{ backgroundColor: 'var(--event-primary, #3b82f6)' }}
                ></div>
                <div 
                    className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none"
                    style={{ backgroundColor: 'var(--event-secondary, #8b5cf6)' }}
                ></div>

                {/* Section Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div 
                        className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner"
                        style={{ 
                            backgroundColor: 'rgb(var(--event-primary-rgb, 59 130 246) / 0.12)', 
                            borderColor: 'rgb(var(--event-primary-rgb, 59 130 246) / 0.3)',
                            color: 'var(--event-primary, #3b82f6)' 
                        }}
                    >
                        {icon || <StatsIcon size={20} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">{title}</h3>
                        <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{subtitle}</p>
                    </div>
                </div>

                {/* Modular Stats Grid */}
                <div className={`grid grid-cols-2 ${gridCols} gap-4 md:gap-6`}>
                    {stats.map((stat, idx) => (
                        <StatCard key={stat.id || idx} stat={stat} />
                    ))}
                </div>
            </div>
        </FadeInSection>
    );
};

export default EventStats;

