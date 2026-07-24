import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import type { EventApi } from '../../models/Event';
import PageLayout from '../layouts/PageLayout';
import EventSectionHeader from '../../components/domain/EventSectionHeader';
import EventGrid from '../../components/domain/EventGrid';
import FilterTabs from '../../components/ui/FilterTabs';
import { 
    IoCalendarOutline as CalendarIcon, 
    IoCheckmarkCircleOutline as CheckmarkIcon,
    IoSparklesOutline as SparklesIcon,
    IoGridOutline as GridIcon,
    IoTimeOutline as TimeIcon
} from 'react-icons/io5';

const FALLBACK_EVENTS: EventApi[] = [
    {
        id: 101,
        title: 'Hackathon LIAO 2026: IA & Otimização Combinatória',
        slug: 'hackathon-liao-2026',
        description: JSON.stringify({
            presentation: {
                enabled: true,
                content: "O Hackathon LIAO 2026 é o maior desafio prático de IA e Otimização da UFBA! Serão 36 horas ininterruptas de desenvolvimento, ideação e codificação para resolver problemas reais propostos por empresas parceiras e órgãos públicos.\n\nAs equipes terão acesso a mentoria dedicada de professores, pesquisadores do LIAO e engenheiros de tecnologia durante toda a maratona."
            },
            objectives: {
                enabled: true,
                content: "- Resolver problemas de alta complexidade em logística, saúde e planejamento urbano.\n- Desenvolver protótipos funcionais utilizando bibliotecas modernas de Otimização e Machine Learning.\n- Conectar talentos universitários a grandes empresas e oportunidades de carreira."
            },
            targetAudience: {
                enabled: true,
                content: "Estudantes de graduação e pós-graduação em Ciência da Computação, Engenharias, Matemática, Estatística e áreas correlatas com interesse em resolução de problemas complexos."
            }
        }),
        coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1470&auto=format&fit=crop',
        date: '2026-09-12T08:00:00Z',
        location: 'Auditório Principal & Hub de Inovação - UFBA',
        highlights: ['Maratona Prática de 36h', 'Premiação para Equipes', 'Mentoria com Especialistas'],
        gallery: [
            'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
        ],
        palette: ['#2563EB', '#7C3AED'],
        borderRadius: 'round',
        themeMode: 'dark',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        agenda: [],
        speakers: [],
        partners: []
    },
    {
        id: 102,
        title: 'Semana da Inteligência Artificial e Otimização 2026',
        slug: 'semana-da-ia-e-otimizacao-2026',
        description: JSON.stringify({
            presentation: {
                enabled: true,
                content: "A Semana da Inteligência Artificial e Otimização 2026 é a edição anual da nossa semana acadêmica, reunindo palestrantes nacionais e internacionais, workshops de ponta e sessões de apresentação de pôsteres científicos.\n\nUm espaço de integração, aprendizado acelerado e networking para toda a comunidade acadêmica e entusiastas de tecnologia."
            },
            objectives: {
                enabled: true,
                content: "- Apresentar o estado da arte das pesquisas em IA e Otimização Combinatória no Brasil e no mundo.\n- Oferecer minicurso hands-on sobre ferramentas e frameworks atuais.\n- Exibir trabalhos desenvolvidos por alunos do laboratório LIAO."
            }
        }),
        coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc596e?q=80&w=1470&auto=format&fit=crop',
        date: '2026-10-20T09:00:00Z',
        location: 'Centro de Convenções UFBA - PAF I',
        highlights: ['Palestras Internacionais', 'Minicursos Práticos', 'Pôsteres Acadêmicos'],
        gallery: [],
        palette: ['#0D9488', '#0284C7'],
        borderRadius: 'round',
        themeMode: 'light',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        agenda: [],
        speakers: [],
        partners: []
    },
    {
        id: 103,
        title: 'Simpósio de Otimização e Sustentabilidade',
        slug: 'simposio-otimizacao-sustentabilidade-2026',
        description: JSON.stringify({
            presentation: {
                enabled: true,
                content: "O Simpósio de Otimização e Sustentabilidade reuniu pesquisadores, estudantes e profissionais do setor energético para debater o papel dos Algoritmos Meta-heurísticos e da Inteligência Artificial na transição energética e na redução de emissões de carbono.\n\nO encontro contou com painéis sobre Smart Grids, otimização de rotas para logística reversa e modelagem matemática verde aplicada à indústria."
            },
            objectives: {
                enabled: true,
                content: "- Promover o debate entre academia e indústria sobre tecnologias limpas.\n- Apresentar estudos de caso práticos de aplicação de otimização combinatória em sustentabilidade.\n- Fomentar projetos de pesquisa interdisciplinares na UFBA."
            },
            finalConsiderations: {
                enabled: true,
                content: "Agradecemos a todos os palestrantes e congressistas! Acesse os materiais das apresentações nos botões laterais."
            },
            stats: [
                { id: '1', value: '120+', label: 'Congressistas e Palestrantes' },
                { id: '2', value: '15', label: 'Artigos Apresentados' },
                { id: '3', value: '8', label: 'Empresas Parceiras' }
            ]
        }),
        coverImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1470&auto=format&fit=crop',
        date: '2026-06-15T09:00:00Z',
        location: 'Auditório 2 - Pavilhão de Aulas do IC',
        highlights: ['Modelagem Verde', 'Smart Grids', 'Logística Reversa'],
        gallery: [
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
        ],
        palette: ['#059669', '#0d9488'],
        borderRadius: 'round',
        themeMode: 'light',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        agenda: [],
        speakers: [],
        partners: [],
        materials: {
            recordingUrl: 'https://youtube.com/watch?v=demo-simposio',
            slidesUrl: 'https://drive.google.com/file/d/demo-simposio-slides/view',
            certificatesUrl: 'https://exemplo.com/certificados/simposio-2026'
        }
    },
    {
        id: 104,
        title: 'Workshop IA Avançada: Do Zero ao Deploy',
        slug: 'workshop-ia-avancada-2026',
        description: JSON.stringify({
            presentation: {
                enabled: true,
                content: "O Workshop IA Avançada: Do Zero ao Deploy proporcionou uma imersão prática completa sobre a arquitetura moderna de Transformers e Large Language Models (LLMs).\n\nConduzido pela Dra. Helena Costa (TechCorp Global) e pelos pesquisadores do LIAO, o workshop cobriu desde as bases teóricas de atenção self-attention até estratégias avançadas de Fine-Tuning com LoRA (Low-Rank Adaptation) e containerização escalável em nuvem com Docker e Kubernetes."
            },
            objectives: {
                enabled: true,
                content: "- Dominar os conceitos de atenção e arquiteturas modernas de LLMs.\n- Executar fine-tuning eficiente utilizando adaptadores LoRA e quantização.\n- Realizar deploy escalável da API do modelo utilizando Docker e Kubernetes."
            },
            finalConsiderations: {
                enabled: true,
                content: "Edição encerrada com grande engajamento de alunos e profissionais! Confira a gravação completa, os slides de apresentação e o álbum de fotos nos links disponíveis."
            },
            stats: [
                { id: '1', value: '80+', label: 'Desenvolvedores e Pesquisadores' },
                { id: '2', value: '6h', label: 'Imersão de Fine-Tuning' },
                { id: '3', value: '12', label: 'Modelos LLMs Deployed' },
                { id: '4', value: '100%', label: 'Vagas Preenchidas' }
            ]
        }),
        coverImage: 'https://images.unsplash.com/photo-1745674684463-62f62cb88d4c?q=80&w=1470&auto=format&fit=crop',
        date: '2026-05-20T14:00:00Z',
        location: 'Auditório Magno - Instituto de Computação',
        highlights: ['Transformers', 'Fine-tuning LoRA', 'Deploy K8s'],
        gallery: [
            'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'
        ],
        palette: ['#4F46E5', '#761515'],
        borderRadius: 'squared',
        themeMode: 'dark',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        agenda: [],
        speakers: [],
        partners: [],
        materials: {
            recordingUrl: 'https://youtube.com/watch?v=demo-workshop-ia',
            slidesUrl: 'https://drive.google.com/file/d/demo-workshop-slides/view',
            photosUrl: 'https://photos.google.com/share/demo-workshop-album',
            certificatesUrl: 'https://exemplo.com/certificados/workshop-ia-2026'
        }
    },
    {
        id: 105,
        title: 'Minicurso: Introdução ao Python para Ciência de Dados',
        slug: 'minicurso-python-dados-2026',
        description: JSON.stringify({
            presentation: {
                enabled: true,
                content: "O Minicurso de Introdução ao Python para Ciência de Dados foi realizado com sucesso no Laboratório de Informática 3 do IC-UFBA.\n\nMais de 45 estudantes e pesquisadores participaram ativamente aprendendo a manipular grandes conjuntos de dados com Pandas e NumPy, visualizar padrões estatísticos com Seaborn e construir seu primeiro modelo preditivo com Scikit-Learn."
            },
            objectives: {
                enabled: true,
                content: "- Capacitar estudantes no uso de bibliotecas fundamentais de Python.\n- Apresentar boas práticas de limpeza e pré-processamento de dados.\n- Construir um pipeline básico de Aprendizado de Máquina do zero."
            },
            finalConsiderations: {
                enabled: true,
                content: "Agradecemos a presença de todos! Os notebooks interativos do curso e os certificados de participação já estão disponíveis abaixo."
            },
            stats: [
                { id: '1', value: '45+', label: 'Participantes Inscritos' },
                { id: '2', value: '4h', label: 'Prática Intensiva' },
                { id: '3', value: '100%', label: 'Exercícios Concluídos' },
                { id: '4', value: '4.9/5', label: 'Avaliação dos Alunos' }
            ]
        }),
        coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1470&auto=format&fit=crop',
        date: '2026-03-10T14:00:00Z',
        location: 'Laboratório de Informática 3 - IC UFBA',
        highlights: ['Python Básico', 'Pandas & Numpy', 'Casos Práticos'],
        gallery: [
            'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'
        ],
        palette: ['#D97706', '#B45309'],
        borderRadius: 'squared',
        themeMode: 'light',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        agenda: [],
        speakers: [],
        partners: [],
        materials: {
            recordingUrl: 'https://youtube.com/watch?v=demo-python',
            slidesUrl: 'https://drive.google.com/file/d/demo-python-slides/view',
            photosUrl: 'https://photos.google.com/share/demo-python-album',
            certificatesUrl: 'https://exemplo.com/certificados/python-2026'
        }
    }
];

type FilterTab = 'all' | 'next' | 'finished';

const getValidTab = (tabParam: string | null): FilterTab => {
    if (tabParam === 'next' || tabParam === 'upcoming') return 'next';
    if (tabParam === 'finished') return 'finished';
    return 'all';
};

const Events: React.FC = () => {
    const [events, setEvents] = useState<EventApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [filter, setFilter] = useState<FilterTab>(() => getValidTab(searchParams.get('tab')));

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam) {
            setFilter(getValidTab(tabParam));
        } else {
            setFilter('all');
        }
    }, [searchParams]);

    const handleTabChange = (newTab: FilterTab) => {
        setFilter(newTab);
        setSearchParams({ tab: newTab });
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await apiService.getEvents() as any;
                if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
                    setEvents(response.data);
                } else {
                    setEvents(FALLBACK_EVENTS);
                }
            } catch (error) {
                console.error('Error fetching events:', error);
                setEvents(FALLBACK_EVENTS);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const now = new Date();

    // Categorize events by date
    const upcomingEvents = events
        .filter(event => new Date(event.date as string) >= now)
        .sort((a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime());

    const finishedEvents = events
        .filter(event => new Date(event.date as string) < now)
        .sort((a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime());

    const showUpcomingSection = filter === 'all' || filter === 'next';
    const showFinishedSection = filter === 'all' || filter === 'finished';

    return (
        <PageLayout
            title="Eventos LIAO"
            subtitle="Fique por dentro das nossas palestras, workshops, maratonas e encontros sobre inteligência artificial e otimização."
        >
            <div className="pb-24">
                {/* Standardized Filter Navigation Tabs */}
                <FilterTabs
                    tabs={[
                        { id: 'all', label: 'Todos os Eventos', icon: <GridIcon size={18} />, count: events.length },
                        { id: 'next', label: 'Próximos Eventos', icon: <CalendarIcon size={18} />, count: upcomingEvents.length },
                        { id: 'finished', label: 'Eventos Realizados', icon: <CheckmarkIcon size={18} />, count: finishedEvents.length }
                    ]}
                    activeTab={filter}
                    onChange={handleTabChange}
                    className="mb-12"
                />

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <div className="space-y-20">
                        {/* SESSION 1: PRÓXIMOS EVENTOS */}
                        {showUpcomingSection && (
                            <section className="space-y-8">
                                <EventSectionHeader 
                                    title="Próximos Eventos"
                                    subtitle="Participe das nossas próximas maratonas, palestras e workshops presenciais e online."
                                    count={upcomingEvents.length}
                                    countSingularLabel="agendado"
                                    countPluralLabel="agendados"
                                    type="upcoming"
                                    icon={<SparklesIcon size={22} className="animate-pulse" />}
                                />

                                <EventGrid 
                                    events={upcomingEvents}
                                    emptyState={{
                                        variant: 'emerald',
                                        icon: <TimeIcon className="w-12 h-12 text-emerald-400 dark:text-emerald-600" />,
                                        title: "Nenhum evento futuro agendado no momento",
                                        description: "Estamos preparando novas edições incríveis. Fique atento às nossas redes!"
                                    }}
                                />
                            </section>
                        )}

                        {/* SESSION 2: EVENTOS REALIZADOS */}
                        {showFinishedSection && (
                            <section className="space-y-8">
                                <EventSectionHeader 
                                    title="Eventos Realizados"
                                    subtitle="Reviva os momentos, agendas, palestras e materiais dos nossos eventos anteriores."
                                    count={finishedEvents.length}
                                    countSingularLabel="concluído"
                                    countPluralLabel="concluídos"
                                    type="finished"
                                    icon={<CheckmarkIcon size={22} />}
                                />

                                <EventGrid 
                                    events={finishedEvents}
                                    emptyState={{
                                        variant: 'neutral',
                                        icon: <CheckmarkIcon className="w-12 h-12 text-neutral-300 dark:text-neutral-600" />,
                                        title: "Nenhum evento anterior encontrado",
                                        description: "Os eventos finalizados serão listados aqui."
                                    }}
                                />
                            </section>
                        )}
                    </div>
                )}
            </div>
        </PageLayout>
    );
};

export default Events;
