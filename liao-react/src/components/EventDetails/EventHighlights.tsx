import React, { useRef, useEffect, useState } from 'react';
import { IoSparkles as Sparkles, IoCheckmarkCircle as Check, IoChevronBack, IoChevronForward } from 'react-icons/io5';
import FadeInSection from './FadeInSection';

interface EventHighlightsProps {
    highlights: string[];
    isPast?: boolean;
}

const EventHighlights: React.FC<EventHighlightsProps> = ({ highlights, isPast = false }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Auto-scroll logic
    useEffect(() => {
        if (!highlights || highlights.length === 0 || isHovered) return;

        const intervalId = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                
                // If reached the end, scroll back to beginning, else scroll right
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    const scrollTo = scrollLeft + clientWidth * 0.8;
                    scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
                }
            }
        }, 3500); // 3.5 seconds per slide

        return () => clearInterval(intervalId);
    }, [highlights, isHovered]);

    if (!highlights || highlights.length === 0) return null;

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
            
            let scrollTo = direction === 'left' 
                ? scrollLeft - clientWidth * 0.8 
                : scrollLeft + clientWidth * 0.8;

            // Handle edge cases
            if (direction === 'right' && scrollLeft + clientWidth >= scrollWidth - 10) {
                scrollTo = 0; // go back to start
            } else if (direction === 'left' && scrollLeft <= 0) {
                scrollTo = scrollWidth; // go to end
            }
            
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <FadeInSection delay="delay-100">
            <div 
                className="py-12 relative group/carousel"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={() => setIsHovered(true)}
                onTouchEnd={() => {
                    // Resume auto-scroll after a short delay when touch ends
                    setTimeout(() => setIsHovered(false), 2000);
                }}
            >
                <div className="flex items-center justify-between gap-6 mb-12 px-2">
                    <div className="flex items-center gap-4">
                        <h3 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap">
                            {isPast ? 'Destaques do Evento' : 'O que esperar'}
                        </h3>
                        <div className="hidden sm:block h-px w-32 bg-gradient-to-r from-neutral-200 dark:from-white/20 to-transparent"></div>
                    </div>
                    
                    {/* Navigation Buttons - Visible on hover/desktop */}
                    <div className="flex gap-2">
                        <button 
                            onClick={() => scroll('left')}
                            className="p-3 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/10 hover:border-neutral-300 dark:hover:border-white/20 transition-all active:scale-90"
                            aria-label="Anterior"
                        >
                            <IoChevronBack size={20} />
                        </button>
                        <button 
                            onClick={() => scroll('right')}
                            className="p-3 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/10 hover:border-neutral-300 dark:hover:border-white/20 transition-all active:scale-90"
                            aria-label="Próximo"
                        >
                            <IoChevronForward size={20} />
                        </button>
                    </div>
                </div>

                {/* Carousel Container */}
                <div className="relative">

                    <div 
                        ref={scrollRef}
                        className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory no-scrollbar scroll-smooth px-1"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {highlights.map((highlight, idx) => (
                            <div 
                                key={idx} 
                                className="flex-none w-[75vw] sm:w-[280px] lg:w-[300px] snap-center group relative flex flex-col p-6 bg-neutral-100/80 dark:bg-neutral-900/40 backdrop-blur-xl border border-neutral-200 dark:border-white/5 hover:border-[var(--event-primary)]/30 transition-all duration-500 overflow-hidden"
                                style={{ borderRadius: 'var(--event-radius)' }}
                            >
                                {/* Decorative Background Glow */}
                                <div className="absolute -right-4 -top-4 w-20 h-20 bg-[var(--event-primary)]/10 blur-3xl rounded-full group-hover:bg-[var(--event-primary)]/20 transition-all duration-500"></div>
                                
                                <div className="relative z-10 flex flex-col h-full">
                                    <div 
                                        className="w-10 h-10 flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                                        style={{ 
                                            backgroundColor: `rgb(var(--event-primary-rgb) / 0.1)`, 
                                            color: `rgb(var(--event-primary-rgb) / 1)`,
                                            borderRadius: 'var(--event-radius-sm)',
                                            border: '1px solid rgb(var(--event-primary-rgb) / 0.2)'
                                        }}
                                    >
                                        <Sparkles size={20} />
                                    </div>
                                    
                                    <p className="text-base font-semibold text-neutral-750 group-hover:text-neutral-950 dark:text-neutral-300 dark:group-hover:text-white transition-colors duration-300 min-h-[60px]">
                                        {highlight}
                                    </p>
 
                                    <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-white/5 flex items-center gap-2 text-[var(--event-primary)] opacity-40 group-hover:opacity-100 transition-all duration-500">
                                        <Check size={16} />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] leading-none">
                                            {isPast ? 'Destaque' : 'Incluso'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <style>{`
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
            </div>
        </FadeInSection>
    );
};

export default EventHighlights;
