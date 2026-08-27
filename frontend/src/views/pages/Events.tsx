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
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
            '<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/p/DY8AbuZvn_m/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/p/DY8AbuZvn_m/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this post on Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div></div><p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/p/DY8AbuZvn_m/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">A post shared by LIAO | UFBA (@liaoufba)</a></p></div></blockquote><script async src="//www.instagram.com/embed.js"></script>',
            '<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/reel/DYa5vhxo3rO/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/reel/DYa5vhxo3rO/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this post on Instagram</div></div></a></div></blockquote><script async src="//www.instagram.com/embed.js"></script>',
            'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
            '<iframe width="560" height="315" src="https://www.youtube.com/embed/5qap5aO4i9A" title="Vídeo do Evento LIAO" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>',
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
            'https://www.instagram.com/p/C_xV3p8R2Yz/',
            'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80'
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
