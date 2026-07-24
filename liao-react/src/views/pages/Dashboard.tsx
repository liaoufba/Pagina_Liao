import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import type { Member } from '../../models/Member';
import type { Article } from '../../models/Article';
import InteractiveBanner from '../../components/ui/InteractiveBanner';
import TechCtaBackground from '../../components/ui/TechCtaBackground';
import { useSEO } from '../../hooks/useSEO';
import Button from '../../components/ui/Button';
import {
    IoHardwareChipOutline,
    IoStatsChartOutline,
    IoFlaskOutline,
    IoRocketOutline
} from 'react-icons/io5';

// Simple Carousel Component
const NewsCarousel: React.FC<{ articles: Article[] }> = ({ articles }) => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);

    const maxIndex = Math.max(0, articles.length - 3);

    useEffect(() => {
        if (articles.length <= 3) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }, 3000);

        return () => clearInterval(interval);
    }, [articles.length, maxIndex]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    };

    return (
        <div className="relative group overflow-hidden">
            {/* Track Container */}
            <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
            >
                {articles.map((article, idx) => (
                    <div
                        key={`${article.id}-${idx}`}
                        className="w-1/3 shrink-0 px-2"
                    >
                        <div
                            onClick={() => navigate(`/newsletter/${article.id}`)}
                            className="bg-white dark:bg-neutral-800 rounded-lg md:rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-100 dark:border-neutral-800 h-full flex flex-col cursor-pointer"
                        >
                            <div className="h-20 md:h-48 overflow-hidden relative group">
                                {article.images && article.images.length > 0 ? (
                                    <img
                                        src={article.images[0]}
                                        alt={article.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-tr from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 text-[10px] md:text-base">
                                        LIAO
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity" />
                            </div>

                            <div className="p-2 md:p-6 flex-1 flex flex-col">
                                <span className="text-[8px] md:text-xs font-bold text-success-600 dark:text-success-400 uppercase tracking-wider mb-1 md:mb-2">
                                    {article.tags?.[0] || 'Novidade'}
                                </span>
                                <h3 className="text-[10px] md:text-lg font-bold text-neutral-900 dark:text-white mb-1 md:mb-2 leading-tight line-clamp-2">
                                    {article.title}
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-300 text-[8px] md:text-sm line-clamp-2 md:line-clamp-3 mb-2 md:mb-4 flex-1">
                                    {article.description || article.content}
                                </p>
                                <span className="text-[8px] md:text-xs text-neutral-400 dark:text-neutral-500 font-medium mt-auto">
                                    {new Date(article.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            {articles.length > 3 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                        className="hidden md:block absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/80 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 p-2 rounded-full shadow hover:bg-white dark:hover:bg-neutral-700 focus:outline-none z-10 transition-all hover:scale-110 border border-neutral-100 dark:border-neutral-700 cursor-pointer"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                        className="hidden md:block absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/80 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 p-2 rounded-full shadow hover:bg-white dark:hover:bg-neutral-700 focus:outline-none z-10 transition-all hover:scale-110 border border-neutral-100 dark:border-neutral-700 cursor-pointer"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </>
            )}
        </div>
    );
};

const Dashboard: React.FC = () => {
    useSEO({
        title: 'LIAO UFBA | Liga Acadêmica de Inteligência Artificial e Otimização',
        description: 'Site oficial da LIAO, a Liga Acadêmica de Inteligência Artificial e Otimização da UFBA. Conheça nossos projetos, artigos, membros e processo seletivo.',
        ogImage: '/banner-new.jpg'
    });

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ members: 0, projects: 0, articles: 0, events: 0 });
    const [recentArticles, setRecentArticles] = useState<Article[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [membersRes, projectsRes, articlesRes, eventsRes] = await Promise.all([
                    apiService.getMembers(),
                    apiService.getProjects(),
                    apiService.getArticles(),
                    apiService.getEvents(),
                ]);

                const members = (membersRes.success && Array.isArray(membersRes.data)) ? membersRes.data : [];
                const projects = (projectsRes.success && Array.isArray(projectsRes.data)) ? projectsRes.data : [];
                const articles = (articlesRes.success && Array.isArray(articlesRes.data)) ? articlesRes.data : [];
                const events = (eventsRes.success && Array.isArray(eventsRes.data)) ? eventsRes.data : [];

                setStats({
                    members: members.filter((m: Member) => m.isActive !== false).length,
                    projects: projects.length,
                    articles: articles.length,
                    events: events.length,
                });

                const sortedArticles = articles.sort((a: Article, b: Article) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                setRecentArticles(sortedArticles.slice(0, 6));

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white dark:bg-neutral-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-neutral-900 dark:border-neutral-100 border-opacity-50"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans">
            {/* Hero Section - Interactive Particle Canvas Banner */}
            <InteractiveBanner />

            {/* Presentation Card Section */}
            <section className="py-14 bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200/80 dark:border-neutral-800 transition-colors duration-200">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="relative p-8 md:p-10 rounded-3xl bg-white dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80 shadow-xl shadow-neutral-900/5 dark:shadow-neutral-950/40 overflow-hidden">
                        {/* Background Accent Gradients */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-liao-yellow/10 via-liao-red/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                            <div className="flex-1 text-left">
                                <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-200 leading-relaxed font-normal">
                                    A <strong className="font-semibold text-neutral-900 dark:text-white">LIAO (Liga Acadêmica de Inteligência Artificial e Otimização)</strong> é uma entidade estudantil oficial da <strong className="font-semibold text-neutral-900 dark:text-white">UFBA (Universidade Federal da Bahia)</strong>, sediada em Salvador. Nosso objetivo é fomentar o ensino, a pesquisa e a extensão nas áreas de ciência de dados, machine learning e otimização de sistemas, preparando talentos para a inovação acadêmica e profissional.
                                </p>

                                {/* Tech Tags */}
                                <div className="mt-6 flex flex-wrap gap-2.5">
                                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-700/60 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-600/60 flex items-center gap-1.5">
                                        <IoHardwareChipOutline className="text-primary-500" /> Machine Learning & Deep Learning
                                    </span>
                                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-700/60 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-600/60 flex items-center gap-1.5">
                                        <IoStatsChartOutline className="text-amber-500" /> Otimização & Pesquisa Operacional
                                    </span>
                                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-700/60 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-600/60 flex items-center gap-1.5">
                                        <IoFlaskOutline className="text-emerald-500" /> Pesquisa & Extensão Universitária
                                    </span>
                                </div>
                            </div>

                            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
                                <Link to="/prosel" className="w-full">
                                    <Button variant="special" size="md" className="w-full text-center">
                                        Processo Seletivo
                                    </Button>
                                </Link>
                                <Link to="/projects" className="w-full">
                                    <Button variant="secondary" size="md" className="w-full text-center bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-white border border-neutral-200 dark:border-neutral-600">
                                        Ver Projetos
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Nossos Pilares de Atuação */}
            <section className="py-20 bg-white dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-sm font-bold text-primary-600 uppercase tracking-widest">Excelência & Tecnologia</span>
                        <h2 className="text-3xl sm:text-4xl font-bold mt-2 text-neutral-900 dark:text-white">Pilares de Estudo e Atuação da LIAO UFBA</h2>
                        <p className="mt-3 text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto text-base">
                            Unindo rigor científico, aplicação prática e desenvolvimento contínuo de talentos.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Pillar 1 */}
                        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700 hover:border-red-500/40 dark:hover:border-red-500/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                                <IoHardwareChipOutline />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Inteligência Artificial</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                Modelos preditivos, redes neurais profundas, visão computacional e processamento de linguagem natural.
                            </p>
                        </div>

                        {/* Pillar 2 */}
                        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700 hover:border-amber-500/40 dark:hover:border-amber-500/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                                <IoStatsChartOutline />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Otimização Combinatória</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                Algoritmos meta-heurísticos e pesquisa operacional para solução de problemas complexos de larga escala.
                            </p>
                        </div>

                        {/* Pillar 3 */}
                        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700 hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                                <IoFlaskOutline />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Pesquisa Científica</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                Produção acadêmica de alto nível, submissão de artigos e participação nos principais eventos da área.
                            </p>
                        </div>

                        {/* Pillar 4 */}
                        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                                <IoRocketOutline />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Extensão & Projetos</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                Workshops práticos, maratonas de programação e integração direta entre comunidade e universidade.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section - Clean & Modern */}
            <section id="stats-section" className="py-20 section-bg-main">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-sm font-bold text-primary-600 uppercase tracking-widest">Nossa Comunidade</span>
                        <h2 className="text-3xl font-bold mt-2 text-neutral-900 dark:text-white">Impacto Acadêmico e Científico da LIAO UFBA</h2>
                    </div>

                    {/* Desktop: 4 Columns | Mobile: Horizontal Scrollable Row */}
                    <div className="flex md:grid overflow-x-auto md:overflow-visible gap-4 md:gap-6 md:grid-cols-4 pb-6 md:pb-0 snap-x snap-mandatory scrollbar-none">
                        {/* L - Membros Ativos (Red) */}
                        <div className="w-[calc(50%-8px)] min-w-[145px] md:w-auto md:min-w-0 flex-shrink-0 snap-center p-4 md:p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 hover:shadow-xl dark:hover:shadow-neutral-950/40 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
                            <div className="text-3xl sm:text-4xl md:text-6xl font-black mb-1 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#E53935] to-[#ef5350] drop-shadow-[0_2px_8px_rgba(229,57,53,0.15)]">
                                {stats.members}
                            </div>
                            <span className="text-[10px] md:text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-0.5 md:mb-1">L</span>
                            <div className="text-xs sm:text-sm md:text-lg font-bold text-neutral-800 dark:text-neutral-200 leading-tight">Membros Ativos</div>
                        </div>

                        {/* I - Projetos Realizados (Yellow) */}
                        <div className="w-[calc(50%-8px)] min-w-[145px] md:w-auto md:min-w-0 flex-shrink-0 snap-center p-4 md:p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 hover:shadow-xl dark:hover:shadow-neutral-950/40 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
                            <div className="text-3xl sm:text-4xl md:text-6xl font-black mb-1 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#FBC02D] to-[#fdd835] drop-shadow-[0_2px_8px_rgba(251,192,45,0.15)]">
                                {stats.projects}
                            </div>
                            <span className="text-[10px] md:text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-0.5 md:mb-1">I</span>
                            <div className="text-xs sm:text-sm md:text-lg font-bold text-neutral-800 dark:text-neutral-200 leading-tight">Projetos Realizados</div>
                        </div>

                        {/* A - Artigos e Newsletter (Blue) */}
                        <div className="w-[calc(50%-8px)] min-w-[145px] md:w-auto md:min-w-0 flex-shrink-0 snap-center p-4 md:p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 hover:shadow-xl dark:hover:shadow-neutral-950/40 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
                            <div className="text-3xl sm:text-4xl md:text-6xl font-black mb-1 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#1E88E5] to-[#42a5f5] drop-shadow-[0_2px_8px_rgba(30,136,229,0.15)]">
                                {stats.articles}
                            </div>
                            <span className="text-[10px] md:text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-0.5 md:mb-1">Λ</span>
                            <div className="text-xs sm:text-sm md:text-lg font-bold text-neutral-800 dark:text-neutral-200 leading-tight">Artigos e Newsletter</div>
                        </div>

                        {/* O - Eventos e Extensão (Green) */}
                        <div className="w-[calc(50%-8px)] min-w-[145px] md:w-auto md:min-w-0 flex-shrink-0 snap-center p-4 md:p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 hover:shadow-xl dark:hover:shadow-neutral-950/40 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
                            <div className="text-3xl sm:text-4xl md:text-6xl font-black mb-1 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#43A047] to-[#66bb6a] drop-shadow-[0_2px_8px_rgba(67,160,71,0.15)]">
                                {stats.events}
                            </div>
                            <span className="text-[10px] md:text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-0.5 md:mb-1">O</span>
                            <div className="text-xs sm:text-sm md:text-lg font-bold text-neutral-800 dark:text-neutral-200 leading-tight">Eventos e Extensão</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Latest News - Carousel */}
            <section className="py-20 section-bg-alt text-neutral-900 dark:text-white border-t border-b border-neutral-200 dark:border-neutral-800/80 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-success-500/10 dark:bg-success-500/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                        <div>
                            <span className="text-sm font-bold text-success-400 uppercase tracking-widest">Atualizações</span>
                            <h2 className="text-4xl font-bold mt-2">Últimas Notícias sobre IA e Otimização</h2>
                        </div>
                        <Link
                            to="/newsletter"
                            className="mt-4 md:mt-0 text-neutral-900 dark:text-white border-b-2 border-success-500 pb-1 hover:text-success-600 dark:hover:text-success-400 transition-colors text-sm font-bold uppercase tracking-wide"
                        >
                            Ver Todas as Notícias &rarr;
                        </Link>
                    </div>

                    {recentArticles.length > 0 ? (
                        <NewsCarousel articles={recentArticles} />
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                            <p className="text-neutral-500 dark:text-neutral-400">Nenhuma notícia publicada ainda.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Call to Action - Modern Premium Tech Background */}
            <section className="py-24 premium-cta-bg text-neutral-900 dark:text-white border-t border-b border-neutral-200 dark:border-neutral-800/80 relative overflow-hidden">
                {/* Tech Background Animation with Particles & Circuit Nodes */}
                <TechCtaBackground />
                
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        Participe da LIAO
                    </h2>
                    <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-10 leading-relaxed max-w-2xl mx-auto">
                        Faça parte de uma comunidade apaixonada por tecnologia e inovação.
                        Inscreva-se no nosso processo seletivo e potencialize sua jornada acadêmica.
                    </p>
                    <Link to="/prosel">
                        <Button variant="special" size="lg">
                            Quero me Inscrever
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
