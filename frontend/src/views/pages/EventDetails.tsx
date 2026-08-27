import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { IoArrowBack as ArrowLeft, IoCalendarOutline as Calendar, IoSparkles as Sparkles, IoArrowForwardOutline as ArrowRight, IoHelpCircleOutline as Help } from 'react-icons/io5';
import { apiService } from '../../services/api';
import type { EventApi } from '../../models/Event';

// Sub-components
import EventHero from '../../components/EventDetails/EventHero';
import EventHighlights from '../../components/EventDetails/EventHighlights';
import EventAgenda from '../../components/EventDetails/EventAgenda';
import EventGallery from '../../components/EventDetails/EventGallery';
import EventSpeakers from '../../components/EventDetails/EventSpeakers';
import EventCTA from '../../components/EventDetails/EventCTA';
import EventPartners from '../../components/EventDetails/EventPartners';
import EventStats from '../../components/EventDetails/EventStats';
import PublicFAQModal from '../../components/EventDetails/PublicFAQModal';
import ScheduleModal from '../../components/EventDetails/ScheduleModal';
import FadeInSection from '../../components/EventDetails/FadeInSection';
import type { EventContentState } from '../../components/forms/EventContentManager';
import ReactMarkdown from 'react-markdown';

const FONT_MAP: Record<string, { family: string; url: string }> = {
    'font-serif': { 
        family: "'Playfair Display', serif", 
        url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap' 
    },
    'font-mono': { 
        family: "'JetBrains Mono', monospace", 
        url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap' 
    },
    'font-space': {
        family: "'Space Grotesk', sans-serif",
        url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap'
    },
    'font-outfit': {
        family: "'Outfit', sans-serif",
        url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap'
    },
    'font-clash': {
        family: "'Clash Display', sans-serif",
        url: 'https://fonts.cdnfonts.com/css/clash-display'
    }
};

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

const EventDetails: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [event, setEvent] = useState<EventApi | null>(null);
    const [faqs, setFaqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [isFAQOpen, setIsFAQOpen] = useState(false);

    // Helper to strip markdown from hero description summary
    const stripMarkdown = (text: string) => {
        if (!text) return '';
        return text
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/_(.*?)_/g, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/#+\s?/g, '')
            .trim();
    };

    // Parsing structured description
    let parsedContent: EventContentState | null = null;
    let descriptionText = event?.description ? stripMarkdown(event.description) : '';

    if (event?.description) {
        const trimmedDescription = event.description.trim();
        if (trimmedDescription.startsWith('{') || trimmedDescription.startsWith('[')) {
            try {
                // Sanitize string if it contains raw newlines that haven't been escaped
                const sanitized = trimmedDescription.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
                parsedContent = JSON.parse(sanitized);
                descriptionText = parsedContent?.presentation?.content 
                    ? stripMarkdown(parsedContent.presentation.content) 
                    : stripMarkdown(event.description);
            } catch (e) {
                console.warn("Detais: Failed to parse structured content", e);
                // Fallback to raw if sanitize failed too
                try {
                    parsedContent = JSON.parse(trimmedDescription);
                    descriptionText = parsedContent?.presentation?.content 
                        ? stripMarkdown(parsedContent.presentation.content) 
                        : stripMarkdown(event.description);
                } catch(e2) {}
            }
        }
    }

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                if (!slug) return;
                const response = await apiService.getEventBySlug(slug) as any;
                const fetchedEvent = response.data as EventApi;
                setEvent(fetchedEvent);
                
                // Fetch FAQs for this event
                if (fetchedEvent.id) {
                    const faqRes = await apiService.getFAQsByEvent(fetchedEvent.id as number);
                    setFaqs(faqRes.data || []);
                }
            } catch (error) {
                console.error("Error fetching event details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [slug]);

    useEffect(() => {
        if (event?.fontClass && FONT_MAP[event.fontClass]) {
            const fontInfo = FONT_MAP[event.fontClass];
            const link = document.createElement('link');
            link.href = fontInfo.url;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
            return () => {
                document.head.removeChild(link);
            };
        }
    }, [event?.fontClass]);

    useEffect(() => {
        if (!event) return;
        
        const hadDark = document.documentElement.classList.contains('dark');
        const eventIsDark = (event as any).themeMode !== 'light';
        
        if (eventIsDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        return () => {
            if (hadDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };
    }, [event]);

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-neutral-200 dark:border-white/10 border-t-primary-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 bg-primary-500/5 blur-xl rounded-full"></div>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-400">
                <Calendar size={48} className="mb-4 opacity-50" />
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Evento não encontrado</h2>
                <Link to="/events" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white flex items-center gap-2">
                    <ArrowLeft size={20} /> Voltar para eventos
                </Link>
            </div>
        );
    }

    const eventWithMaterials = {
        ...event,
        materials: event.materials ?? (parsedContent as any)?.materials
    };

    const eventDate = new Date(event.date as string).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const fontClass = event.fontClass || 'font-sans';
    const fontFamily = event.fontClass && FONT_MAP[event.fontClass] 
        ? FONT_MAP[event.fontClass].family 
        : 'inherit';

    const isDarkMode = (event as any).themeMode !== 'light';

    const palette = (event as any).palette && (event as any).palette.length > 0 
        ? (event as any).palette 
        : ['#6366f1', '#a855f7', '#ec4899'];
    
    const primaryColor = palette[0];
    const secondaryColor = palette[1] || primaryColor;
    const tertiaryColor = palette[2] || secondaryColor;

    const borderRadiusValue = (event as any).borderRadius === 'squared' ? '0px' : '1.5rem';
    const borderRadiusLarge = (event as any).borderRadius === 'squared' ? '0px' : '2rem';
    const borderRadiusSmall = (event as any).borderRadius === 'squared' ? '0px' : '0.75rem';

    const styleVariables = {
        '--event-primary': primaryColor,
        '--event-secondary': secondaryColor,
        '--event-tertiary': tertiaryColor,
        '--event-primary-rgb': hexToRgb(primaryColor),
        '--event-secondary-rgb': hexToRgb(secondaryColor),
        '--event-tertiary-rgb': hexToRgb(tertiaryColor),
        '--event-radius': borderRadiusValue,
        '--event-radius-lg': borderRadiusLarge,
        '--event-radius-sm': borderRadiusSmall,
        'fontFamily': fontFamily,
    } as React.CSSProperties;

    const renderContentSection = (title: string, content: string | undefined, isPlus: boolean = false, delay: string = 'delay-0') => {
        if (!content) return null;
        
        return (
            <FadeInSection delay={delay}>
                <div 
                    className={`relative group p-4 md:p-8 rounded-3xl transition-colors ${
                        isPlus 
                            ? 'bg-neutral-100 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 border-l-4 dark:border-l-4 shadow-sm my-12' 
                            : 'bg-transparent my-10'
                    }`}
                    style={isPlus ? { borderLeftColor: 'var(--event-primary)', borderLeftWidth: '4px' } : {}}
                >
                    {!isPlus && <div className="absolute -inset-x-6 -inset-y-4 bg-transparent group-hover:bg-neutral-200/40 dark:group-hover:bg-white/[0.02] transition-colors rounded-3xl -z-10"></div>}
                    
                    <h3 className="text-2xl md:text-3xl font-bold mb-6 text-neutral-900 dark:text-white flex items-center gap-4">
                        <div 
                            className={`flex items-center justify-center rounded-2xl ${
                                isPlus 
                                    ? 'w-12 h-12 bg-neutral-200/50 border border-neutral-300 shadow-sm' 
                                    : 'w-10 h-10 bg-neutral-100 border border-neutral-200 shadow-inner'
                            }`}
                            style={{ 
                                backgroundColor: isPlus ? 'rgb(var(--event-primary-rgb) / 0.15)' : 'rgb(var(--event-primary-rgb) / 0.1)',
                                borderColor: isPlus ? 'rgb(var(--event-primary-rgb) / 0.3)' : 'rgb(var(--event-primary-rgb) / 0.2)',
                                color: 'var(--event-primary)' 
                            }}
                        >
                            <Sparkles size={isPlus ? 24 : 20} className={isPlus ? "animate-pulse" : ""} />
                        </div>
                        {title}
                    </h3>
                    
                    {/* Markdown rendering with Prose styling mimicking native App typography.  */}
                    <div 
                        className={`prose ${isDarkMode ? 'prose-invert' : ''} prose-lg md:prose-xl max-w-none 
                                    prose-headings:text-neutral-900 dark:prose-headings:text-white prose-headings:font-bold 
                                    prose-p:text-neutral-600 dark:prose-p:text-neutral-400 prose-p:leading-relaxed 
                                    prose-a:text-[color:var(--event-primary)] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                                    prose-strong:text-neutral-900 dark:prose-strong:text-white 
                                    prose-ul:list-disc prose-ol:list-decimal
                                    prose-li:text-neutral-650 dark:prose-li:text-neutral-400 prose-li:marker:text-[color:var(--event-primary)]`}
                    >
                        <ReactMarkdown>
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>
            </FadeInSection>
        );
    };

    const isPast = event.date ? new Date(event.date as string) < new Date() : false;

    return (
        <div 
            className={`relative min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 overflow-x-hidden transition-colors duration-300 ${fontClass}`}
            style={styleVariables}
        >
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div 
                    className={`absolute top-0 left-1/4 w-[1000px] h-[1000px] rounded-full blur-[120px] opacity-40 dark:opacity-50 ${isDarkMode ? 'mix-blend-screen' : 'mix-blend-multiply'}`}
                    style={{ backgroundColor: `rgb(var(--event-primary-rgb) / 0.15)` }}
                ></div>
                <div 
                    className={`absolute bottom-0 right-1/4 w-[800px] h-[800px] rounded-full blur-[120px] opacity-40 dark:opacity-50 ${isDarkMode ? 'mix-blend-screen' : 'mix-blend-multiply'}`}
                    style={{ backgroundColor: `rgb(var(--event-secondary-rgb) / 0.15)` }}
                ></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/bg-grid.svg')] opacity-[0.05] dark:opacity-[0.02]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <EventHero 
                    event={event} 
                    eventDate={eventDate} 
                    descriptionOverride={descriptionText}
                    hasSchedule={!!parsedContent?.scheduleTable?.enabled}
                    onOpenSchedule={() => setIsScheduleOpen(true)}
                    isPast={isPast}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-16 pb-24">
                        {/* Highlights/Gallery & Stats prioritized for past events */}
                        {isPast && parsedContent?.stats && parsedContent.stats.length > 0 && (
                            <EventStats stats={parsedContent.stats} />
                        )}

                        {isPast && event.gallery && event.gallery.length > 0 && (
                            <div className="pb-4">
                                <EventGallery gallery={event.gallery} />
                            </div>
                        )}

                        <div className="space-y-4">
                            {parsedContent?.presentation?.enabled && renderContentSection(
                                isPast ? 'Sobre a Edição' : 'Sobre o Evento', 
                                parsedContent.presentation.content, 
                                false, 
                                ''
                            )}
                            {parsedContent?.objectives?.enabled && renderContentSection('Objetivos', parsedContent.objectives.content, false, '')}
                            {parsedContent?.targetAudience?.enabled && renderContentSection('Público-alvo', parsedContent.targetAudience.content, false, 'delay-150')}
                            {parsedContent?.structure?.enabled && renderContentSection('Estrutura Geral', parsedContent.structure.content, false, 'delay-300')}
                        </div>

                        {event.highlights && (
                            <div className="pt-8 border-t border-neutral-200 dark:border-white/5">
                                <EventHighlights highlights={event.highlights} isPast={isPast} />
                            </div>
                        )}
                        
                        {event.agenda && event.agenda.length > 0 && (
                            <div className="pt-8 border-t border-neutral-200 dark:border-white/5">
                                <EventAgenda agenda={event.agenda} palette={palette} />
                            </div>
                        )}
                        
                        {parsedContent?.schedule?.enabled && (
                            <div className="pt-8 border-t border-neutral-200 dark:border-white/5">
                                {renderContentSection('Cronograma', parsedContent.schedule.content, false, '')}
                            </div>
                        )}
                        
                        {parsedContent?.dynamicSections?.filter(s => (s as any).enabled !== false).map((section, idx) => {
                            const delayClass = ['delay-100', 'delay-200', 'delay-300', 'delay-500', 'delay-700'][idx % 5];
                            return (
                                <React.Fragment key={section.id}>
                                    {renderContentSection(section.title, section.content, true, delayClass)}
                                </React.Fragment>
                            );
                        })}
                        
                        {parsedContent?.finalConsiderations?.enabled && renderContentSection('Considerações Finais', parsedContent.finalConsiderations.content, false, '')}

                        {!isPast && event.gallery && <EventGallery gallery={event.gallery} />}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <EventSpeakers speakers={event.speakers} palette={palette} />
                        <EventCTA event={eventWithMaterials} />
                    </div>
                </div>


                {/* Partners Section */}
                {event.partners && event.partners.length > 0 && (
                    <div className="mt-16">
                        <EventPartners partners={event.partners} />
                    </div>
                )}

                {/* FAQ CTA Button Section */}
                {faqs.length > 0 && (
                    <FadeInSection delay="delay-700">
                        <div className="mt-12 flex flex-col items-center">
                            <button 
                                onClick={() => setIsFAQOpen(true)}
                                className="group relative px-10 py-5 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:bg-neutral-200 dark:hover:bg-white/10 hover:border-neutral-300 dark:hover:bg-white/20 transition-all duration-500 overflow-hidden"
                                style={{ borderRadius: 'var(--event-radius-lg)' }}
                            >
                                {/* Button background accent */}
                                <div 
                                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                                    style={{ background: `linear-gradient(45deg, var(--event-primary), var(--event-secondary))` }}
                                ></div>
                                
                                <div className="relative z-10 flex items-center gap-4">
                                    <div 
                                        className="w-10 h-10 rounded-xl bg-neutral-200/50 dark:bg-white/5 flex items-center justify-center border border-neutral-300 dark:border-white/10"
                                        style={{ color: 'var(--event-primary)' }}
                                    >
                                        <Help size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-lg font-bold text-neutral-900 dark:text-white leading-none">Dúvidas Frequentes</div>
                                        <div className="text-neutral-500 text-sm mt-1">Confira as respostas para as perguntas comuns</div>
                                    </div>
                                    <div className="ml-4 text-neutral-500 group-hover:text-neutral-900 dark:text-neutral-600 dark:group-hover:text-white transition-colors">
                                        <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </button>
                        </div>
                    </FadeInSection>
                )}
            </div>

            {parsedContent?.scheduleTable && (
                <ScheduleModal 
                    isOpen={isScheduleOpen}
                    onClose={() => setIsScheduleOpen(false)}
                    schedule={parsedContent.scheduleTable}
                    eventTitle={event.title}
                    palette={palette}
                />
            )}

            <PublicFAQModal 
                isOpen={isFAQOpen}
                onClose={() => setIsFAQOpen(false)}
                faqs={faqs}
                eventTitle={event.title}
                palette={palette}
            />
        </div>
    );
};

export default EventDetails;
