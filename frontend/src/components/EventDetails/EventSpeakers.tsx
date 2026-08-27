import React, { useState, useEffect } from 'react';
import { 
    IoPersonOutline as User, 
    IoArrowForward as ArrowRight,
    IoOpenOutline as ExternalLink,
    IoSparkles as Sparkles,
    IoChevronUpOutline as ChevronUp,
    IoChevronDownOutline as ChevronDown
} from 'react-icons/io5';
import type { EventSpeaker, Member } from '../../models/Event';
import FadeInSection from './FadeInSection';

interface EventSpeakersProps {
    speakers: (EventSpeaker & { member?: Member | null })[];
    palette: string[];
}

const hexToRgb = (hex: string) => {
    let r = 0, g = 0, b = 0;
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
    }
    return `${r} ${g} ${b}`;
};

const EventSpeakers: React.FC<EventSpeakersProps> = ({ speakers, palette }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Sidebar vertical carousel limits
    const visibleCount = 3;

    useEffect(() => {
        if (speakers.length <= visibleCount || isPaused) return;
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % speakers.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [speakers.length, isPaused]);

    if (!speakers || speakers.length === 0) return null;

    const nextSlide = () => {
        setCurrentIndex(prev => (prev + 1) % speakers.length);
    };

    const prevSlide = () => {
        setCurrentIndex(prev => (prev - 1 + speakers.length) % speakers.length);
    };

    return (
        <FadeInSection delay="delay-400">
            <div 
                className="bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-6 backdrop-blur-md relative group"
                style={{ borderRadius: 'var(--event-radius-lg)' }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-neutral-905 dark:text-white flex items-center gap-3">
                        <User 
                            size={20} 
                            style={{ color: `rgb(var(--event-primary-rgb) / 1)` }} 
                        />
                        Palestrantes
                    </h3>
                    
                    {speakers.length > visibleCount && (
                        <div className="flex gap-1">
                            <button 
                                onClick={prevSlide}
                                className="p-1.5 rounded-lg bg-neutral-200 dark:bg-white/5 hover:bg-neutral-300 dark:hover:bg-white/10 border border-neutral-300 dark:border-white/10 text-neutral-800 dark:text-white transition-all active:scale-95"
                            >
                                <ChevronUp size={16} />
                            </button>
                            <button 
                                onClick={nextSlide}
                                className="p-1.5 rounded-lg bg-neutral-200 dark:bg-white/5 hover:bg-neutral-300 dark:hover:bg-white/10 border border-neutral-300 dark:border-white/10 text-neutral-800 dark:text-white transition-all active:scale-95"
                            >
                                <ChevronDown size={16} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="overflow-hidden relative" style={{ height: speakers.length > 2 ? '290px' : 'auto' }}>
                    <div 
                        className="flex flex-col transition-transform duration-700 ease-in-out gap-4"
                        style={{ 
                            transform: `translateY(-${currentIndex * (100 / speakers.length)}%)`,
                        }}
                    >
                        {speakers.map((speaker, i) => {
                            const speakerName = speaker.member?.name || speaker.name || 'Palestrante';
                            const speakerRole = speaker.member?.role || speaker.role || '';
                            const speakerPhoto = speaker.member?.photo || speaker.photo || '';
                            const speakerColor = palette[i % palette.length];
                            
                            return (
                                <div 
                                    key={i}
                                    className="w-full shrink-0"
                                >
                                    <div 
                                        onClick={() => {
                                            if (speaker.member) {
                                                window.open(`/members`, '_blank');
                                            } else if (speaker.link) {
                                                window.open(speaker.link, '_blank', 'noopener,noreferrer');
                                            }
                                        }}
                                        className={`group/card flex items-center gap-4 p-4 border transition-all ${
                                            speaker.member || speaker.link 
                                                ? 'cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-white/10 border-neutral-200 dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/20 shadow-md dark:shadow-lg dark:shadow-black/20' 
                                                : 'border-transparent bg-neutral-100 dark:bg-white/5 text-neutral-800 dark:text-white'
                                        }`}
                                        style={{ 
                                            '--hover-border': `rgb(${hexToRgb(speakerColor)} / 0.5)`,
                                            borderRadius: 'var(--event-radius)'
                                        } as any}
                                    >
                                        <div className="relative">
                                            <div 
                                                className="w-12 h-12 rounded-full overflow-hidden bg-neutral-800 border-2 border-neutral-700/50 transition-all group-hover/card:border-[var(--hover-border)]"
                                            >
                                                {speakerPhoto ? (
                                                    <img src={speakerPhoto} alt={speakerName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-neutral-500">
                                                        {speakerName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            {speaker.member && (
                                                <div 
                                                    className="absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-neutral-900"
                                                    style={{ backgroundColor: speakerColor }}
                                                >
                                                    <Sparkles size={8} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className="font-bold text-neutral-900 dark:text-white text-sm truncate">{speakerName}</h4>
                                                {speaker.member && (
                                                    <Sparkles 
                                                        size={10} 
                                                        style={{ color: speakerColor }}
                                                        className="opacity-50"
                                                    />
                                                )}
                                            </div>
                                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate leading-tight">{speakerRole}</p>
                                        </div>
                                        {(speaker.member || speaker.link) && (
                                            <div className="text-neutral-500 dark:text-neutral-600 group-hover/card:text-neutral-900 dark:group-hover/card:text-white transition-colors">
                                                {speaker.member ? <ArrowRight size={14} /> : <ExternalLink size={14} />}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </FadeInSection>
    );
};

export default EventSpeakers;
