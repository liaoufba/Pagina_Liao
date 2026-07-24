import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import FadeInSection from './FadeInSection';
import { isHtmlEmbed, loadEmbedScripts, getEmbedSourceInfo, getEmbedHtml } from '../../utils/embed';

interface EventGalleryProps {
    gallery: string[];
}

const EmbedCard: React.FC<{ html: string; onClick?: () => void }> = React.memo(({ html, onClick }) => {
    const formattedHtml = getEmbedHtml(html);
    const containerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            loadEmbedScripts(formattedHtml, containerRef.current);
        }
    }, [formattedHtml]);

    return (
        <div 
            ref={containerRef}
            className="w-full h-full min-h-[320px] max-h-[500px] overflow-y-auto flex items-center justify-center p-2 bg-neutral-50 dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-white/10 shadow-sm relative group transition-all duration-300 hover:shadow-md [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:min-h-[280px] [&_iframe]:rounded-xl [&_iframe]:border-0 [&_blockquote]:max-w-full [&_blockquote]:m-0"
            style={{ borderRadius: 'var(--event-radius)' }}
        >
            <div 
                className="w-full h-full flex justify-center items-center"
                dangerouslySetInnerHTML={{ __html: formattedHtml }}
            />
            {onClick && (
                <button
                    onClick={onClick}
                    className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900/80 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 backdrop-blur-sm hover:bg-neutral-900"
                    title="Expandir Mídia"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4" />
                    </svg>
                    Expandir
                </button>
            )}
        </div>
    );
});

const EventGallery: React.FC<EventGalleryProps> = ({ gallery }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedIndex === null) return;
            if (e.key === 'Escape') setSelectedIndex(null);
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, gallery]);

    useEffect(() => {
        if (selectedIndex !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedIndex]);

    if (!gallery || gallery.length === 0) return null;

    const handlePrev = () => {
        if (selectedIndex === null) return;
        setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : gallery.length - 1));
    };

    const handleNext = () => {
        if (selectedIndex === null) return;
        setSelectedIndex((prev) => (prev! < gallery.length - 1 ? prev! + 1 : 0));
    };

    const activeItem = selectedIndex !== null ? gallery[selectedIndex] : null;
    const sourceInfo = activeItem ? getEmbedSourceInfo(activeItem) : null;

    return (
        <FadeInSection delay="delay-300">
            <div id="event-gallery-section" className="space-y-8 scroll-mt-24">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                        <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Galeria do Evento
                    </h3>
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                        {gallery.length} {gallery.length === 1 ? 'item' : 'itens'}
                    </span>
                </div>

                {/* Google Images style Masonry Grid */}
                <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6 [&>div]:break-inside-avoid">
                    {gallery.map((item, i) => {
                        const isEmbed = isHtmlEmbed(item);

                        if (isEmbed) {
                            return (
                                <div 
                                    key={i} 
                                    onClick={() => setSelectedIndex(i)}
                                    className="relative cursor-pointer group break-inside-avoid mb-6 rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-neutral-900/60 shadow-sm hover:shadow-xl transition-all duration-300"
                                    style={{ borderRadius: 'var(--event-radius)' }}
                                >
                                    <div className="w-full h-full pointer-events-none p-2 flex justify-center items-center [&_iframe]:w-full [&_iframe]:min-h-[300px] [&_iframe]:rounded-xl [&_iframe]:border-0 [&_blockquote]:max-w-full [&_blockquote]:m-0">
                                        <EmbedCard html={item} />
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px] z-10">
                                        <span className="bg-white/95 dark:bg-neutral-900/95 text-neutral-900 dark:text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                            <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                            </svg>
                                            Ampliar Mídia
                                        </span>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div 
                                key={i} 
                                onClick={() => setSelectedIndex(i)}
                                className="relative cursor-pointer group break-inside-avoid mb-6 rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 shadow-sm hover:shadow-xl transition-all duration-300"
                                style={{ borderRadius: 'var(--event-radius)' }}
                            >
                                <img 
                                    src={item} 
                                    alt={`Gallery ${i}`} 
                                    className="w-full h-auto max-h-[600px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] z-10">
                                    <span className="bg-white/95 dark:bg-neutral-900/95 text-neutral-900 dark:text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                        <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                        </svg>
                                        Ampliar Foto
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Lightbox Modal with Fixed Position Control Elements */}
                {selectedIndex !== null && activeItem && createPortal(
                    <div 
                        className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center overflow-hidden animate-fadeIn"
                        onClick={() => setSelectedIndex(null)}
                        style={{
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            backgroundColor: 'rgba(0, 0, 0, 0.90)'
                        }}
                    >
                        {/* CONSTANT TOP CONTROL BAR (Fixed at screen top: top-6 left-6 right-6) */}
                        <div className="absolute top-6 left-6 right-6 z-40 flex items-center justify-between pointer-events-auto">
                            <div>
                                {sourceInfo && (
                                    <a
                                        href={sourceInfo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-2xl border ${
                                            sourceInfo.type === 'instagram'
                                                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white border-transparent hover:opacity-95 hover:scale-105'
                                                : sourceInfo.type === 'youtube'
                                                ? 'bg-red-600 text-white border-transparent hover:bg-red-700 hover:scale-105'
                                                : 'bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md'
                                        }`}
                                    >
                                        {sourceInfo.type === 'instagram' && (
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                            </svg>
                                        )}
                                        <span>{sourceInfo.label}</span>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                )}
                            </div>

                            <button
                                onClick={() => setSelectedIndex(null)}
                                className="text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all font-semibold flex items-center gap-2 text-xs backdrop-blur-md border border-white/20 shadow-2xl hover:scale-105"
                                title="Fechar (Esc)"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Fechar (Esc)</span>
                            </button>
                        </div>

                        {/* CONSTANT SIDE NAVIGATION ARROWS (Fixed at screen left-8 and right-8) */}
                        {gallery.length > 1 && (
                            <button
                                onClick={handlePrev}
                                className="fixed left-4 sm:left-8 top-1/2 -translate-y-1/2 z-40 text-white bg-black/60 hover:bg-black/90 p-4 rounded-full transition-all border border-white/20 shadow-2xl hover:scale-110 backdrop-blur-md"
                                title="Anterior (Seta esquerda)"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}

                        {gallery.length > 1 && (
                            <button
                                onClick={handleNext}
                                className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-40 text-white bg-black/60 hover:bg-black/90 p-4 rounded-full transition-all border border-white/20 shadow-2xl hover:scale-110 backdrop-blur-md"
                                title="Próxima (Seta direita)"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}

                        {/* CONSTANT BOTTOM COUNTER (Fixed at screen bottom-6) */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 text-xs font-semibold text-white/90 bg-black/60 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md shadow-2xl">
                            {selectedIndex + 1} de {gallery.length}
                        </div>

                        {/* CENTERED MEDIA CONTAINER */}
                        <div 
                            className="w-full h-full flex items-center justify-center p-16 sm:p-24 overflow-hidden"
                            onClick={() => setSelectedIndex(null)}
                        >
                            <div 
                                className="max-w-4xl max-h-[80vh] w-auto h-auto flex items-center justify-center overflow-auto rounded-2xl bg-neutral-950/80 p-3 border border-white/15 shadow-2xl backdrop-blur-md"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {isHtmlEmbed(activeItem) ? (
                                    <div className="w-full flex justify-center max-h-[75vh] overflow-y-auto [&_iframe]:w-full [&_iframe]:min-h-[480px] [&_iframe]:max-h-[70vh] [&_iframe]:rounded-xl [&_iframe]:border-0 [&_blockquote]:max-w-full [&_blockquote]:m-0">
                                        <EmbedCard html={activeItem} />
                                    </div>
                                ) : (
                                    <img 
                                        src={activeItem} 
                                        alt={`Gallery item ${selectedIndex + 1}`} 
                                        className="max-h-[76vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                                    />
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </FadeInSection>
    );
};

export default EventGallery;
