import React from 'react';
import { IoShieldCheckmarkOutline as Shield } from 'react-icons/io5';
import type { Partner } from '../../models/Partner';
import FadeInSection from './FadeInSection';

interface EventPartnersProps {
    partners: Partner[];
}

const EventPartners: React.FC<EventPartnersProps> = ({ partners }) => {
    if (!partners || partners.length === 0) return null;

    return (
        <FadeInSection delay="delay-500">
            <div 
                className="bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-8 backdrop-blur-md"
                style={{ borderRadius: 'var(--event-radius-lg)' }}
            >
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-8 flex items-center gap-3">
                    <Shield 
                        size={24} 
                        style={{ color: `rgb(var(--event-primary-rgb) / 1)` }} 
                    />
                    Parceiros & Realização
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 items-center justify-items-center">
                    {partners.map((partner) => (
                        <a
                            key={partner.id}
                            href={partner.websiteUrl || '#'}
                            target={partner.websiteUrl ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            className={`group relative flex items-center justify-center p-6 bg-neutral-200/50 dark:bg-white/[0.03] border border-neutral-300 dark:border-white/5 hover:bg-neutral-300 dark:hover:bg-white/[0.08] hover:border-neutral-400 dark:hover:border-white/20 transition-all duration-500 w-full aspect-[16/10] ${
                                !partner.websiteUrl && 'pointer-events-none'
                            }`}
                            style={{ borderRadius: 'var(--event-radius)' }}
                            title={partner.name}
                        >
                            {/* Subtle background glow on hover */}
                            <div className="absolute inset-0 bg-neutral-300/10 dark:bg-white/5 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 rounded-full"></div>
                            
                            <img
                                src={partner.imageUrl}
                                alt={partner.name}
                                className="relative z-10 max-w-[85%] max-h-[70%] object-contain transition-all duration-700 
                                           filter dark:invert grayscale opacity-50
                                           group-hover:filter-none group-hover:opacity-100"
                            />
                            
                            {partner.websiteUrl && (
                                <div className="absolute bottom-2 right-2 w-1 h-1 rounded-full bg-neutral-400 dark:bg-white/20 group-hover:bg-[var(--event-primary)] transition-colors"></div>
                            )}
                        </a>
                    ))}
                </div>
            </div>
        </FadeInSection>
    );
};

export default EventPartners;
