import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useSEO } from '../../hooks/useSEO';
import Card from '../../components/ui/Card';
import EventStats, { StatCard, type EventStat } from '../../components/EventDetails/EventStats';
import FilterTabs from '../../components/ui/FilterTabs';
import { 
    IoStatsChartOutline as StatsIcon,
    IoGridOutline as GridIcon,
    IoCalendarOutline as CalendarIcon,
    IoCodeSlashOutline as CodeIcon,
    IoPeopleOutline as PeopleIcon,
    IoBusinessOutline as HandshakeIcon,
    IoSparklesOutline as SparklesIcon,
    IoRibbonOutline as RibbonIcon,
    IoBookOutline as BookIcon,
    IoRocketOutline as RocketIcon,
    IoCheckmarkDoneCircleOutline as CheckIcon,
    IoTrendingUpOutline as TrendIcon,
    IoSchoolOutline as SchoolIcon,
    IoGlobeOutline as GlobeIcon
} from 'react-icons/io5';

type StatCategory = 'all' | 'extension' | 'research' | 'community' | 'partnerships';

const About: React.FC = () => {
    useSEO({
        title: 'Sobre a LIAO UFBA | História, Missão e Números',
        description: 'Saiba quem somos. A LIAO UFBA promove o ensino, pesquisa e desenvolvimento prático em Inteligência Artificial e Otimização de Sistemas na Bahia.',
        ogImage: '/banner-new.jpg'
    });

    const [images, setImages] = useState<string[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);

    // Interactive Stats & Live Counts state
    const [activeTab, setActiveTab] = useState<StatCategory>('all');
    const [liveData, setLiveData] = useState({
        membersCount: 0,
        tutorsCount: 0,
        projectsCount: 0,
        finishedEventsCount: 0,
        upcomingEventsCount: 0,
        articlesCount: 0,
        totalLikes: 0,
        partnersCount: 0,
        totalSpeakers: 0,
        totalAgendaItems: 0,
        customEventStats: [] as EventStat[]
    });

    // Touch swipe states for mobile carousel
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const defaultImages = [
        '/IMG_9402.jpg',
        '/IMG_9386.jpg',
        '/IMG_9389.jpg',
        '/IMG_9348.jpg'
    ];

    const defaultAlts = [
        "Equipe LIAO reunida",
        "Membros com a bandeira",
        "Grupo sorrindo",
        "Membros celebrando"
    ];

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch About Carousel Images
                const res = await apiService.getConfig('about_carousel_images');
                if (res.success && res.data) {
                    const parsed = JSON.parse(res.data);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setImages(parsed);
                    } else {
                        setImages(defaultImages);
                    }
                } else {
                    setImages(defaultImages);
                }
            } catch (err) {
                console.error('Error fetching about carousel images:', err);
                setImages(defaultImages);
            }

            // Fetch Live Stats Data from Database APIs
            try {
                const [membersRes, projectsRes, eventsRes, articlesRes, partnersRes, tutorsRes] = await Promise.allSettled([
                    apiService.getMembers(),
                    apiService.getProjects(),
                    apiService.getEvents(),
                    apiService.getArticles(),
                    apiService.getPartners(),
                    apiService.getTutors(),
                ]);

                let membersCount = 0;
                let tutorsCount = 0;
                let projectsCount = 0;
                let finishedEventsCount = 0;
                let upcomingEventsCount = 0;
                let articlesCount = 0;
                let totalLikes = 0;
                let partnersCount = 0;
                let totalSpeakers = 0;
                let totalAgendaItems = 0;
                const customEventStats: EventStat[] = [];

                if (membersRes.status === 'fulfilled' && (membersRes.value as any)?.data) {
                    const data = (membersRes.value as any).data;
                    if (Array.isArray(data)) membersCount = data.length;
                }
                if (tutorsRes.status === 'fulfilled' && (tutorsRes.value as any)?.data) {
                    const data = (tutorsRes.value as any).data;
                    if (Array.isArray(data)) tutorsCount = data.length;
                }
                if (projectsRes.status === 'fulfilled' && (projectsRes.value as any)?.data) {
                    const data = (projectsRes.value as any).data;
                    if (Array.isArray(data)) projectsCount = data.length;
                }
                if (partnersRes.status === 'fulfilled' && (partnersRes.value as any)?.data) {
                    const data = (partnersRes.value as any).data;
                    if (Array.isArray(data)) partnersCount = data.length;
                }
                if (articlesRes.status === 'fulfilled' && (articlesRes.value as any)?.data) {
                    const data = (articlesRes.value as any).data;
                    if (Array.isArray(data)) {
                        articlesCount = data.length;
                        totalLikes = data.reduce((acc: number, item: any) => acc + (item.likes || item.likeCount || 0), 0);
                    }
                }
                if (eventsRes.status === 'fulfilled' && (eventsRes.value as any)?.data) {
                    const data = (eventsRes.value as any).data;
                    if (Array.isArray(data)) {
                        const now = new Date();
                        data.forEach((evt: any) => {
                            const evtDate = new Date(evt.date);
                            if (evtDate < now) {
                                finishedEventsCount++;
                            } else {
                                upcomingEventsCount++;
                            }

                            if (Array.isArray(evt.speakers)) {
                                totalSpeakers += evt.speakers.length;
                            }
                            if (Array.isArray(evt.agenda)) {
                                totalAgendaItems += evt.agenda.length;
                            }

                            // Extract stats configured by admin inside finished events
                            if (evt.description && typeof evt.description === 'string') {
                                try {
                                    const parsed = JSON.parse(evt.description);
                                    if (Array.isArray(parsed?.stats)) {
                                        parsed.stats.forEach((st: any) => {
                                            if (st.value && st.label) {
                                                customEventStats.push({
                                                    id: `evt-stat-${evt.id}-${st.id || Math.random()}`,
                                                    value: st.value,
                                                    label: st.label,
                                                    category: 'Extensão',
                                                    description: `Métrica do evento "${evt.title}".`,
                                                    change: 'Evento Concluído',
                                                    icon: <RibbonIcon size={20} />
                                                });
                                            }
                                        });
                                    }
                                } catch (e) {
                                    // Ignore non-JSON descriptions
                                }
                            }
                        });
                    }
                }

                setLiveData({
                    membersCount,
                    tutorsCount,
                    projectsCount,
                    finishedEventsCount,
                    upcomingEventsCount,
                    articlesCount,
                    totalLikes,
                    partnersCount,
                    totalSpeakers,
                    totalAgendaItems,
                    customEventStats
                });
            } catch (err) {
                console.error("Error loading live stats from database:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Automatic slide advance for carousel
    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [images]);

    const nextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentSlide(prev => (prev - 1 + images.length) % images.length);
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    // Touch gesture handlers for mobile swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        
        if (isLeftSwipe) {
            nextSlide();
        } else if (isRightSwipe) {
            prevSlide();
        }
    };

    // Dynamically constructed Stats items based exclusively on real database data
    const allStats: (EventStat & { categoryKey: StatCategory })[] = [
        {
            id: 'stat-membros',
            value: `${liveData.membersCount}`,
            label: 'Membros Ativos & Pesquisadores',
            description: 'Cadastros ativos na base de dados do laboratório.',
            change: 'Membros DB',
            category: 'Comunidade',
            categoryKey: 'community',
            icon: <PeopleIcon size={20} />
        },
        {
            id: 'stat-tutas',
            value: `${liveData.tutorsCount}`,
            label: 'Docentes & Tutores Cadastrados',
            description: 'Professores orientadores cadastrados no sistema.',
            change: 'Tutores DB',
            category: 'Comunidade',
            categoryKey: 'community',
            icon: <SchoolIcon size={20} />
        },
        {
            id: 'stat-projetos',
            value: `${liveData.projectsCount}`,
            label: 'Projetos Tecnológicos Cadastrados',
            description: 'Projetos registrados na base de dados da liga.',
            change: 'Projetos DB',
            category: 'Pesquisa',
            categoryKey: 'research',
            icon: <CodeIcon size={20} />
        },
        {
            id: 'stat-eventos-realizados',
            value: `${liveData.finishedEventsCount}`,
            label: 'Eventos Concluídos',
            description: 'Eventos já realizados e armazenados no histórico.',
            change: 'Histórico DB',
            category: 'Extensão',
            categoryKey: 'extension',
            icon: <CheckIcon size={20} />
        },
        {
            id: 'stat-eventos-agendados',
            value: `${liveData.upcomingEventsCount}`,
            label: 'Próximos Eventos Agendados',
            description: 'Eventos cadastrados com data futura.',
            change: 'Agenda DB',
            category: 'Extensão',
            categoryKey: 'extension',
            icon: <CalendarIcon size={20} />
        },
        {
            id: 'stat-palestrantes',
            value: `${liveData.totalSpeakers}`,
            label: 'Palestrantes Cadastrados em Eventos',
            description: 'Palestrantes e convidados registrados na grade dos eventos.',
            change: 'Eventos DB',
            category: 'Extensão',
            categoryKey: 'extension',
            icon: <GlobeIcon size={20} />
        },
        {
            id: 'stat-agenda',
            value: `${liveData.totalAgendaItems}`,
            label: 'Sessões & Palestras de Programação',
            description: 'Atividades programadas cadastradas nos eventos.',
            change: 'Programação DB',
            category: 'Extensão',
            categoryKey: 'extension',
            icon: <RocketIcon size={20} />
        },
        {
            id: 'stat-artigos',
            value: `${liveData.articlesCount}`,
            label: 'Artigos Publicados na Newsletter',
            description: 'Artigos registrados no módulo da newsletter.',
            change: 'Newsletter DB',
            category: 'Pesquisa',
            categoryKey: 'research',
            icon: <BookIcon size={20} />
        },
        {
            id: 'stat-curtidas',
            value: `${liveData.totalLikes}`,
            label: 'Curtidas Totais na Newsletter',
            description: 'Reações e curtidas recebidas pelos leitores nos artigos.',
            change: 'Engajamento DB',
            category: 'Pesquisa',
            categoryKey: 'research',
            icon: <TrendIcon size={20} />
        },
        {
            id: 'stat-parceiros',
            value: `${liveData.partnersCount}`,
            label: 'Empresas & Parceiros Cadastrados',
            description: 'Organizações e parceiros registrados no sistema.',
            change: 'Parceiros DB',
            category: 'Parcerias',
            categoryKey: 'partnerships',
            icon: <HandshakeIcon size={20} />
        },
        ...liveData.customEventStats.map(st => ({
            ...st,
            categoryKey: 'extension' as StatCategory
        }))
    ];

    const filteredStats = activeTab === 'all' 
        ? allStats 
        : allStats.filter(s => s.categoryKey === activeTab);

    // Top 4 Primary Highlight Stats dynamically generated from DB
    const highlightStats: EventStat[] = [
        {
            id: 'h1',
            value: `${liveData.membersCount}`,
            label: 'Membros Ativos',
            description: 'Cadastrados no banco de dados da UFBA',
            change: 'Comunidade',
            icon: <PeopleIcon size={22} />
        },
        {
            id: 'h2',
            value: `${liveData.projectsCount}`,
            label: 'Projetos no Sistema',
            description: 'Projetos de pesquisa e extensão',
            change: 'Projetos',
            icon: <CodeIcon size={22} />
        },
        {
            id: 'h3',
            value: `${liveData.finishedEventsCount + liveData.upcomingEventsCount}`,
            label: 'Total de Eventos',
            description: 'Eventos realizados e agendados',
            change: 'Extensão',
            icon: <CalendarIcon size={22} />
        },
        {
            id: 'h4',
            value: `${liveData.articlesCount}`,
            label: 'Artigos Publicados',
            description: 'Publicações na newsletter oficial',
            change: 'Publicações',
            icon: <BookIcon size={22} />
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen section-bg-main text-neutral-900 dark:text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="about-page-wrapper section-bg-main text-neutral-900 dark:text-white min-h-screen page-padding-y px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center w-full relative overflow-hidden">
            
            {/* Styles Injection */}
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@500;700;800&display=swap');
                
                .about-page-wrapper {
                    font-family: 'Inter', sans-serif;
                }

                .about-page-wrapper h1, 
                .about-page-wrapper h2, 
                .about-page-wrapper h3, 
                .about-page-wrapper h4 {
                    font-family: 'Outfit', sans-serif;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .fade-in-up {
                    opacity: 0;
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }

                /* Carousel slide transition */
                .slide {
                    transition: opacity 0.8s ease-in-out, transform 3s ease-in-out;
                }
                .slide.active {
                    opacity: 1;
                    z-index: 10;
                    transform: scale(1.02); /* Slight zoom effect for life */
                }
                .slide.inactive {
                    opacity: 0;
                    z-index: 0;
                    transform: scale(1);
                }

                /* Hide scrollbar */
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />

            {/* Header / Logo */}
            <header className="text-center w-full max-w-7xl mx-auto mb-12 sm:mb-20 fade-in-up">
                <div className="flex justify-center mb-6 sm:mb-8">
                     <img src="/logo.png" alt="LIAO Logo" className="h-16 sm:h-20 object-contain dark:hidden transition-all duration-300" />
                     <img src="/logo-dark.png" alt="LIAO Logo" className="h-16 sm:h-20 object-contain hidden dark:block transition-all duration-300" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight text-neutral-900 dark:text-white">Sobre a LIAO UFBA</h1>
                <p className="text-neutral-600 dark:text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                    Conheça a Liga Acadêmica de Inteligência Artificial e Otimização da UFBA
                </p>
            </header>

            {/* MISSION AND CAROUSEL SECTION */}
            <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center mb-20 sm:mb-28 relative">
                
                {/* Decorative Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl bg-gradient-to-r from-liao-blue/10 via-transparent to-liao-red/10 blur-[100px] rounded-full z-0 pointer-events-none"></div>

                {/* Mission Text Area */}
                <section className="space-y-6 sm:space-y-8 z-10 fade-in-up delay-100">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-3 sm:gap-4 text-neutral-900 dark:text-white">
                        <span className="w-8 sm:w-10 h-1.5 bg-gradient-to-r from-liao-red to-liao-yellow rounded-full"></span>
                        Nossa Missão
                    </h2>
                    <div className="space-y-4 sm:space-y-5 text-neutral-700 dark:text-neutral-300 leading-relaxed text-base sm:text-lg md:text-xl font-light">
                        <p>
                            A LIAO tem como missão promover o conhecimento em inteligência artificial e otimização, conectando teoria e prática através de projetos, workshops e eventos.
                        </p>
                        <p>
                            Buscamos desenvolver as habilidades técnicas e interpessoais de nossos membros, preparando-os para os desafios do mercado de tecnologia.
                        </p>
                        <div className="bg-neutral-100/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 mt-6 shadow-lg backdrop-blur-sm relative overflow-hidden group">
                            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-liao-blue to-liao-green"></div>
                            <p className="font-medium text-neutral-800 dark:text-white/90 text-sm sm:text-base md:text-lg">
                                "Acreditamos no poder da colaboração e do aprendizado contínuo para inovar e resolver problemas complexos da sociedade."
                            </p>
                        </div>
                    </div>
                </section>

                {/* Image Carousel Area */}
                <section className="z-10 w-full fade-in-up delay-200">
                    <div 
                        id="carousel-container" 
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className="relative group rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800/60 aspect-[4/3] md:aspect-[16/10] touch-pan-y"
                    >
                        
                        {/* Slides Container */}
                        <div id="slides-wrapper" className="w-full h-full relative">
                            {images.map((url, index) => (
                                <div
                                    key={index}
                                    className={`slide absolute inset-0 w-full h-full ${
                                        index === currentSlide ? 'active' : 'inactive'
                                    }`}
                                >
                                    <img 
                                        src={url} 
                                        alt={defaultAlts[index] || `Slide ${index + 1}`} 
                                        className="w-full h-full object-cover" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent"></div>
                                </div>
                            ))}
                        </div>

                        {/* Prev Button */}
                        <button 
                            onClick={prevSlide} 
                            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 hover:scale-110 active:scale-95 z-20 cursor-pointer"
                            aria-label="Slide anterior"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 sm:w-6 h-5 sm:h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        
                        {/* Next Button */}
                        <button 
                            onClick={nextSlide} 
                            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 hover:scale-110 active:scale-95 z-20 cursor-pointer"
                            aria-label="Próximo slide"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 sm:w-6 h-5 sm:h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>

                        {/* Dots Indicators */}
                        <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-20" id="carousel-dots">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`dot rounded-full transition-all duration-300 cursor-pointer ${
                                        index === currentSlide 
                                            ? 'w-6 sm:w-8 h-1.5 bg-white' 
                                            : 'w-2 sm:w-3 h-1.5 bg-white/40 hover:bg-white/70'
                                    }`}
                                    aria-label={`Ir para o slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* VALUES SECTION */}
            <section className="w-full max-w-7xl mx-auto fade-in-up delay-300 mb-24">
                <div className="text-center mb-12 sm:mb-16 relative">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold inline-block relative pb-4 text-neutral-900 dark:text-white">
                        Nossos Valores
                        {/* Underline decoration using logo colors */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1.5 flex rounded-full overflow-hidden opacity-80">
                            <div className="h-full w-1/4 bg-liao-red"></div>
                            <div className="h-full w-1/4 bg-liao-yellow"></div>
                            <div className="h-full w-1/4 bg-liao-blue"></div>
                            <div className="h-full w-1/4 bg-liao-green"></div>
                        </div>
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* Value 1: L (Red) */}
                    <Card hover={false} className="rounded-2xl p-6 sm:p-8 text-center group hover:-translate-y-2 lg:hover:-translate-y-3 transition-all duration-300 relative overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:border-liao-red/50 dark:hover:border-liao-red/50 shadow-lg hover:shadow-liao-red/20 dark:hover:shadow-liao-red/10">
                        <div className="absolute top-0 left-0 w-full h-1 bg-liao-red transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-liao-red/10 transition-colors duration-300 border border-neutral-200 dark:border-neutral-700 group-hover:border-liao-red/30">
                            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-500 dark:text-neutral-400 group-hover:text-liao-red transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-neutral-900 dark:text-white group-hover:text-liao-red transition-colors duration-300">Excelência</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed">
                            Buscamos a qualidade e a melhoria contínua em tudo que fazemos, elevando o padrão de nossos projetos.
                        </p>
                    </Card>

                    {/* Value 2: I (Yellow) */}
                    <Card hover={false} className="rounded-2xl p-6 sm:p-8 text-center group hover:-translate-y-2 lg:hover:-translate-y-3 transition-all duration-300 relative overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:border-liao-yellow/50 dark:hover:border-liao-yellow/50 shadow-lg hover:shadow-liao-yellow/20 dark:hover:shadow-liao-yellow/10">
                        <div className="absolute top-0 left-0 w-full h-1 bg-liao-yellow transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-liao-yellow/10 transition-colors duration-300 border border-neutral-200 dark:border-neutral-700 group-hover:border-liao-yellow/30">
                            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-500 dark:text-neutral-400 group-hover:text-liao-yellow transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-neutral-900 dark:text-white group-hover:text-liao-yellow transition-colors duration-300">Colaboração</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed">
                            Trabalhamos juntos, compartilhando conhecimento e experiências para alcançar objetivos em comum.
                        </p>
                    </Card>

                    {/* Value 3: A (Blue) */}
                    <Card hover={false} className="rounded-2xl p-6 sm:p-8 text-center group hover:-translate-y-2 lg:hover:-translate-y-3 transition-all duration-300 relative overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:border-liao-blue/50 dark:hover:border-liao-blue/50 shadow-lg hover:shadow-liao-blue/20 dark:hover:shadow-liao-blue/10">
                        <div className="absolute top-0 left-0 w-full h-1 bg-liao-blue transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-liao-blue/10 transition-colors duration-300 border border-neutral-200 dark:border-neutral-700 group-hover:border-liao-blue/30">
                            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-500 dark:text-neutral-400 group-hover:text-liao-blue transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-neutral-900 dark:text-white group-hover:text-liao-blue transition-colors duration-300">Inovação</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed">
                            Exploramos novas ideias e tecnologias, pensando fora da caixa para criar soluções impactantes.
                        </p>
                    </Card>

                    {/* Value 4: O (Green) */}
                    <Card hover={false} className="rounded-2xl p-6 sm:p-8 text-center group hover:-translate-y-2 lg:hover:-translate-y-3 transition-all duration-300 relative overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:border-liao-green/50 dark:hover:border-liao-green/50 shadow-lg hover:shadow-liao-green/20 dark:hover:shadow-liao-green/10">
                        <div className="absolute top-0 left-0 w-full h-1 bg-liao-green transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-liao-green/10 transition-colors duration-300 border border-neutral-200 dark:border-neutral-700 group-hover:border-liao-green/30">
                            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-500 dark:text-neutral-400 group-hover:text-liao-green transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-neutral-900 dark:text-white group-hover:text-liao-green transition-colors duration-300">Otimização</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed">
                            Aplicamos IA e algoritmos avançados para gerar resultados e resolver problemas complexos.
                        </p>
                    </Card>

                </div>
            </section>

            {/* BRAND NEW SECTION: LIAO EM NÚMEROS */}
            <section id="numeros" className="w-full max-w-7xl mx-auto fade-in-up delay-400 space-y-16 pt-8 pb-16">
                
                {/* Section Header */}
                <div className="text-center relative">
                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-900/60 inline-block mb-3">
                        Transparência & Impacto
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                        LIAO em Números
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto mt-3 font-light leading-relaxed">
                        Os dados e métricas reais que traduzem a energia, a produção científica e o impacto da nossa liga acadêmica na UFBA.
                    </p>
                </div>

                {/* HERO STATS BANNER - Reusing the EventStats container style */}
                <EventStats 
                    stats={highlightStats}
                    title="Principais Indicadores do Laboratório"
                    subtitle="Métricas sincronizadas em tempo real com os sistemas da LIAO UFBA"
                    icon={<StatsIcon size={22} />}
                    columns={4}
                    className="mt-2"
                />

                {/* FILTERABLE MODULAR STAT CARDS SECTION */}
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                                Painel Completo de Métricas
                            </span>
                            <h3 className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-1">
                                Explore Nossas Estatísticas por Categoria
                            </h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                Selecione uma aba abaixo para filtrar as métricas do laboratório.
                            </p>
                        </div>
                    </div>

                    {/* Standardized Filter Tabs Component */}
                    <FilterTabs
                        tabs={[
                            { id: 'all', label: 'Todos os Indicadores', icon: <GridIcon size={18} />, count: allStats.length },
                            { id: 'extension', label: 'Extensão & Eventos', icon: <CalendarIcon size={18} />, count: allStats.filter(s => s.categoryKey === 'extension').length },
                            { id: 'research', label: 'Pesquisa & Projetos', icon: <CodeIcon size={18} />, count: allStats.filter(s => s.categoryKey === 'research').length },
                            { id: 'community', label: 'Comunidade & Talentos', icon: <PeopleIcon size={18} />, count: allStats.filter(s => s.categoryKey === 'community').length },
                            { id: 'partnerships', label: 'Parcerias & Ecossistema', icon: <HandshakeIcon size={18} />, count: allStats.filter(s => s.categoryKey === 'partnerships').length }
                        ]}
                        activeTab={activeTab}
                        onChange={(tabId) => setActiveTab(tabId as StatCategory)}
                        className="mb-8"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStats.map(stat => (
                            <StatCard key={stat.id} stat={stat} />
                        ))}
                    </div>
                </div>

                {/* CTA BANNER */}
                <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 text-white relative overflow-hidden shadow-xl">
                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
                        <RocketIcon size={320} />
                    </div>

                    <div className="relative z-10 max-w-2xl space-y-4">
                        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-md">
                            <SparklesIcon size={14} className="text-amber-400" />
                            Faça parte da nossa história
                        </span>

                        <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                            Quer ajudar a expandir estes números?
                        </h3>

                        <p className="text-neutral-200 text-sm md:text-base leading-relaxed">
                            Seja ingressando como membro pesquisador através do nosso Processo Seletivo ou firmando uma parceria institucional com sua empresa.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link 
                                to="/prosel"
                                className="px-6 py-3 rounded-xl bg-white text-primary-900 font-bold hover:bg-neutral-100 transition-colors shadow-lg hover:shadow-xl text-sm flex items-center gap-2"
                            >
                                Processo Seletivo
                                <RocketIcon size={16} />
                            </Link>
                            <Link 
                                to="/partnerships"
                                className="px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20 font-bold hover:bg-white/20 transition-colors text-sm flex items-center gap-2"
                            >
                                Seja um Parceiro
                                <HandshakeIcon size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default About;
