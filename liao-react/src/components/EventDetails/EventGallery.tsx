import React from 'react';
import FadeInSection from './FadeInSection';

interface EventGalleryProps {
    gallery: string[];
}

const EventGallery: React.FC<EventGalleryProps> = ({ gallery }) => {
    if (!gallery || gallery.length === 0) return null;

    return (
        <FadeInSection delay="delay-300">
            <div id="event-gallery-section" className="space-y-8 scroll-mt-24">
                <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6">Galeria do Evento</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {gallery.map((img, i) => (
                        <div 
                            key={i} 
                            className="aspect-square overflow-hidden border border-neutral-200 dark:border-white/10 group cursor-pointer bg-neutral-100 dark:bg-white/5"
                            style={{ borderRadius: 'var(--event-radius)' }}
                        >
                            <img 
                                src={img} 
                                alt={`Gallery ${i}`} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </FadeInSection>
    );
};

export default EventGallery;
