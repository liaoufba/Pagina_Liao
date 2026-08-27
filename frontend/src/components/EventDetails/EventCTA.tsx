import React from 'react';
import { Link } from 'react-router-dom';
import { 
    IoNotificationsOutline as Bell, 
    IoCheckmarkDoneCircleOutline as CheckmarkIcon,
    IoDocumentTextOutline as DocumentIcon,
    IoVideocamOutline as VideoIcon,
    IoImagesOutline as PhotosIcon,
    IoRibbonOutline as CertificateIcon,
    IoCalendarOutline as CalendarIcon
} from 'react-icons/io5';
import type { EventApi } from '../../models/Event';
import FadeInSection from './FadeInSection';

interface EventCTAProps {
    event: EventApi;
}

const EventCTA: React.FC<EventCTAProps> = ({ event }) => {
    const isPast = event.date ? new Date(event.date as string) < new Date() : false;
    const materials = event.materials;

    const handleAddToCalendar = () => {
        if (!event) return;

        // Extract clean description text
        let cleanDescription = event.description || "";
        if (cleanDescription.trim().startsWith('{')) {
            try {
                const sanitized = cleanDescription.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
                const parsed = JSON.parse(sanitized);
                cleanDescription = parsed?.presentation?.content || "";
            } catch (e) {
                console.warn("FAQ: Failed to parse structured content for calendar", e);
            }
        }

        // Add event link to the details
        const eventLink = window.location.href;
        const detailsText = `${cleanDescription}\n\nSaiba mais em: ${eventLink}`;

        const startDate = new Date(event.date as string);
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

        const formatGCalDate = (date: Date) => {
            return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
        };

        const title = encodeURIComponent(event.title);
        const details = encodeURIComponent(detailsText);
        const location = encodeURIComponent(event.location || "");
        const dates = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;

        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
        
        window.open(googleCalendarUrl, '_blank', 'noopener,noreferrer');
    };

    if (isPast) {
        return (
            <FadeInSection delay="delay-500">
                <div 
                    className="relative overflow-hidden p-8 border border-neutral-200 dark:border-white/10 shadow-xl dark:shadow-2xl"
                    style={{ borderRadius: 'var(--event-radius-lg)' }}
                >
                    <div 
                        className="absolute inset-0 backdrop-blur-xl opacity-80"
                        style={{ 
                            background: `linear-gradient(to bottom right, rgb(var(--event-primary-rgb) / 0.15), rgb(var(--event-secondary-rgb) / 0.15))` 
                        }}
                    ></div>
                    <div className="relative z-10 text-center space-y-6">
                        <div 
                            className="w-16 h-16 mx-auto bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center backdrop-blur-sm border border-emerald-500/30"
                            style={{ borderRadius: 'var(--event-radius)' }}
                        >
                            <CheckmarkIcon size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Evento Concluído</h3>
                            <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
                                Este evento já foi realizado. Confira os materiais disponíveis ou veja a nossa agenda para os próximos eventos.
                            </p>
                        </div>

                        {materials && (materials.slidesUrl || materials.recordingUrl || materials.photosUrl || materials.certificatesUrl) && (
                            <div className="space-y-3 pt-2">
                                {materials.recordingUrl && (
                                    <a
                                        href={materials.recordingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3.5 px-4 font-bold text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                                        style={{ 
                                            background: 'linear-gradient(135deg, var(--event-primary), var(--event-secondary))',
                                            borderRadius: 'var(--event-radius-sm)' 
                                        }}
                                    >
                                        <VideoIcon size={18} /> Assistir à Gravação
                                    </a>
                                )}
                                {materials.slidesUrl && (
                                    <a
                                        href={materials.slidesUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3 px-4 text-sm font-semibold bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/20 border border-neutral-200 dark:border-white/10 transition-all flex items-center justify-center gap-2"
                                        style={{ borderRadius: 'var(--event-radius-sm)' }}
                                    >
                                        <DocumentIcon size={18} /> Baixar Presentation/Slides
                                    </a>
                                )}
                                {materials.photosUrl && (
                                    <a
                                        href={materials.photosUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3 px-4 text-sm font-semibold bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/20 border border-neutral-200 dark:border-white/10 transition-all flex items-center justify-center gap-2"
                                        style={{ borderRadius: 'var(--event-radius-sm)' }}
                                    >
                                        <PhotosIcon size={18} /> Álbum Completo de Fotos
                                    </a>
                                )}
                                {materials.certificatesUrl && (
                                    <a
                                        href={materials.certificatesUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3 px-4 text-sm font-semibold bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/20 border border-neutral-200 dark:border-white/10 transition-all flex items-center justify-center gap-2"
                                        style={{ borderRadius: 'var(--event-radius-sm)' }}
                                    >
                                        <CertificateIcon size={18} /> Emitir/Ver Certificados
                                    </a>
                                )}
                            </div>
                        )}

                        <Link 
                            to="/events?tab=next"
                            className="w-full py-3.5 px-4 font-bold text-neutral-800 dark:text-white bg-neutral-200/60 dark:bg-white/10 hover:bg-neutral-300 dark:hover:bg-white/20 border border-neutral-300/60 dark:border-white/15 transition-all flex items-center justify-center gap-2 text-sm"
                            style={{ borderRadius: 'var(--event-radius-sm)' }}
                        >
                            <CalendarIcon size={18} /> Ver Próximos Eventos
                        </Link>
                    </div>
                </div>
            </FadeInSection>
        );
    }

    return (
        <FadeInSection delay="delay-500">
            <div 
                className="relative overflow-hidden p-8 border border-neutral-200 dark:border-white/10 shadow-xl dark:shadow-2xl"
                style={{ borderRadius: 'var(--event-radius-lg)' }}
            >
                <div 
                    className="absolute inset-0 backdrop-blur-xl"
                    style={{ 
                        background: `linear-gradient(to bottom right, rgb(var(--event-primary-rgb) / 0.2), rgb(var(--event-secondary-rgb) / 0.2))` 
                    }}
                ></div>
                <div className="relative z-10 text-center space-y-6">
                    <div 
                        className="w-16 h-16 mx-auto bg-neutral-800/10 dark:bg-white/10 flex items-center justify-center backdrop-blur-sm border border-neutral-200 dark:border-white/20"
                        style={{ borderRadius: 'var(--event-radius)' }}
                    >
                        <Bell size={28} className="text-neutral-800 dark:text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Não perca!</h3>
                        <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
                            Adicione este evento à sua agenda e fique por dentro de todas as novidades.
                        </p>
                    </div>
                    {event.subscribe && (
                        <button 
                            onClick={() => window.open(event.subscribe as string, '_blank', 'noopener,noreferrer')}
                            className="w-full py-4 text-base font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                            style={{ 
                                background: 'linear-gradient(135deg, var(--event-primary), var(--event-secondary))',
                                borderRadius: 'var(--event-radius-sm)' 
                            }}
                        >
                            Quero me Inscrever
                        </button>
                    )}
                    <button 
                        onClick={handleAddToCalendar}
                        className={`w-full py-4 font-bold transition-all active:scale-[0.98] ${
                            event.subscribe 
                                ? 'bg-neutral-800/5 dark:bg-white/5 text-neutral-850 dark:text-white hover:bg-neutral-850/10 dark:hover:bg-white/10 border border-neutral-300 dark:border-white/10' 
                                : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-lg'
                        }`}
                        style={{ borderRadius: 'var(--event-radius-sm)' }}
                    >
                        {event.subscribe ? 'Lembrar-me (Agenda)' : 'Notificar-me'}
                    </button>
                </div>
            </div>
        </FadeInSection>
    );
};

export default EventCTA;

