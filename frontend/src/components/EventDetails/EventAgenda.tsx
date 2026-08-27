import React from 'react';
import { IoTimeOutline as Clock, IoPersonOutline as User } from 'react-icons/io5';
import type { AgendaItem } from '../../models/Event';
import FadeInSection from './FadeInSection';

interface EventAgendaProps {
    agenda: AgendaItem[];
    palette: string[];
}

const EventAgenda: React.FC<EventAgendaProps> = ({ agenda, palette }) => {
    if (!agenda || agenda.length === 0) return null;

    return (
        <FadeInSection delay="delay-200">
            <div className="py-12">
                <div className="flex items-center gap-6 mb-12">
                    <h3 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap">Programação</h3>
                    <div className="h-px w-full bg-gradient-to-r from-neutral-200 via-neutral-100 to-transparent dark:from-white/20 dark:via-white/5"></div>
                </div>

                <div className="relative space-y-4">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-[23px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[var(--event-primary)]/40 via-neutral-200 dark:via-white/10 to-transparent"></div>

                    {agenda.map((item, idx) => {
                        const itemColor = palette[idx % palette.length];
                        
                        return (
                            <div key={idx} className="relative pl-16 group">
                                <div 
                                    className="absolute left-4 top-8 w-5 h-5 rounded-full ring-4 ring-neutral-50 dark:ring-neutral-950 z-10 transition-all duration-500 group-hover:scale-125"
                                    style={{ 
                                        backgroundColor: itemColor,
                                        boxShadow: `0 0 15px 2px ${itemColor}40`
                                    }}
                                >
                                    <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: itemColor }}></div>
                                </div>

                                <div 
                                    className="bg-neutral-100/80 dark:bg-neutral-900/40 backdrop-blur-md border border-neutral-200 dark:border-white/5 p-6 md:p-8 hover:bg-neutral-200 dark:hover:bg-neutral-800/60 transition-all duration-300 group-hover:translate-x-1"
                                    style={{ borderRadius: 'var(--event-radius)' }}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div 
                                                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-tight"
                                                    style={{ 
                                                        backgroundColor: `${itemColor}15`,
                                                        color: itemColor,
                                                        border: `1px solid ${itemColor}30`
                                                    }}
                                                >
                                                    <Clock size={14} />
                                                    {item.time}
                                                </div>
                                                <div className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-white/20"></div>
                                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Sessão {idx + 1}</p>
                                            </div>

                                            <h4 className="text-xl md:text-2xl font-bold text-neutral-950 dark:text-white mb-2 group-hover:text-[var(--event-primary)] transition-colors">
                                                {item.title}
                                            </h4>
                                            
                                            {item.description && (
                                                <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed max-w-2xl">{item.description}</p>
                                            )}
                                        </div>

                                        {item.speakerName && (
                                            <div className="flex items-center gap-3 bg-neutral-200/50 dark:bg-white/5 px-5 py-3 rounded-2xl border border-neutral-300 dark:border-white/5 shrink-0 transition-colors group-hover:bg-neutral-300 dark:group-hover:bg-white/10 group-hover:border-[var(--event-primary)]/20">
                                                <div className="p-2 bg-neutral-50 dark:bg-neutral-950 rounded-lg">
                                                    <User size={18} className="text-neutral-500 dark:text-neutral-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-0.5">Palestrante</p>
                                                    <p className="text-sm font-bold text-neutral-950 dark:text-white">{item.speakerName}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </FadeInSection>
    );
};

export default EventAgenda;
