import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Founders
  console.log('Creating founders...');
  const founder1 = await prisma.member.upsert({
    where: { email: 'andre.luiz@liao.ufba.br' },
    update: { isFounder: true },
    create: {
      name: 'Prof. Dr. André Luiz',
      email: 'andre.luiz@liao.ufba.br',
      role: 'Professor Fundador & Coordenador Geral',
      course: 'Ciência da Computação',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      bio: 'Doutor em Ciência da Computação. Fundador do LIAO, especialista em Otimização Combinatória e Inteligência Artificial.',
      linkedin: 'https://linkedin.com/in/andre-luiz-ufba',
      github: 'https://github.com/andreluiz-ufba',
      isActive: true,
      isFounder: true,
      year: 2020
    },
  });

  const founder2 = await prisma.member.upsert({
    where: { email: 'maria.clara@liao.ufba.br' },
    update: { isFounder: true },
    create: {
      name: 'Profa. Dra. Maria Clara Santos',
      email: 'maria.clara@liao.ufba.br',
      role: 'Fundadora & Pesquisadora Senior de IA',
      course: 'Engenharia de Computação',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
      bio: 'Co-fundadora do laboratório. Pesquisadora em Deep Learning, Processamento de Linguagem Natural e Visão Computacional.',
      linkedin: 'https://linkedin.com/in/mariaclarasantos',
      github: 'https://github.com/mariaclara-ai',
      isActive: true,
      isFounder: true,
      year: 2020
    },
  });

  const founder3 = await prisma.member.upsert({
    where: { email: 'lucas.mendes@liao.ufba.br' },
    update: { isFounder: true },
    create: {
      name: 'Dr. Lucas Mendes',
      email: 'lucas.mendes@liao.ufba.br',
      role: 'Fundador & Ex-Pesquisador LIAO',
      course: 'Ciência da Computação',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      bio: 'Membro fundador. Atua no desenvolvimento de algoritmos de otimização em larga escala e computação paralela.',
      linkedin: 'https://linkedin.com/in/lucasmendes-ai',
      github: 'https://github.com/lucasmendes',
      isActive: false,
      isFounder: true,
      year: 2020
    },
  });

  const founder4 = await prisma.member.upsert({
    where: { email: 'beatriz.ramos@liao.ufba.br' },
    update: { isFounder: true },
    create: {
      name: 'Dra. Beatriz Ramos',
      email: 'beatriz.ramos@liao.ufba.br',
      role: 'Fundadora & Ex-Coordenadora de Projetos',
      course: 'Engenharia de Sistemas',
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
      bio: 'Pioneira no estabelecimento de parcerias institucionais e projetos de pesquisa aplicada no LIAO.',
      linkedin: 'https://linkedin.com/in/beatrizramos',
      github: 'https://github.com/bramos',
      isActive: false,
      isFounder: true,
      year: 2020
    },
  });

  // 2. Create Members
  console.log('Creating members...');
  const member1 = await prisma.member.upsert({
    where: { email: 'alice@liao.com' },
    update: {},
    create: {
      name: 'Alice Oliveira',
      email: 'alice@liao.com',
      role: 'Coordenadora de Projetos',
      course: 'Engenharia de Computação',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
      bio: 'Apaixonada por Visão Computacional, Aprendizado por Reforço e Otimização.',
      linkedin: 'https://linkedin.com/in/alice-oliveira',
      github: 'https://github.com/alice',
      isActive: true,
      isFounder: false,
      year: 2024
    },
  });

  const member2 = await prisma.member.upsert({
    where: { email: 'bruno@liao.com' },
    update: {},
    create: {
      name: 'Bruno Santos',
      email: 'bruno@liao.com',
      role: 'Desenvolvedor Full Stack & Pesquisador',
      course: 'Ciência da Computação',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
      bio: 'Entusiasta de sistemas distribuídos, MLOps e infraestrutura para IA.',
      linkedin: 'https://linkedin.com/in/bruno-santos-dev',
      github: 'https://github.com/bruno',
      isActive: true,
      isFounder: false,
      year: 2025
    },
  });

  const member3 = await prisma.member.upsert({
    where: { email: 'carolina.lima@liao.ufba.br' },
    update: {},
    create: {
      name: 'Carolina Lima',
      email: 'carolina.lima@liao.ufba.br',
      role: 'Pesquisadora em Visão Computacional',
      course: 'Ciência da Computação',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      bio: 'Foco em segmentação de imagens médicas e modelos generativos para saúde.',
      linkedin: 'https://linkedin.com/in/carol-lima-ai',
      github: 'https://github.com/carollima',
      isActive: true,
      isFounder: false,
      year: 2024
    },
  });

  const member4 = await prisma.member.upsert({
    where: { email: 'gabriel.rocha@liao.ufba.br' },
    update: {},
    create: {
      name: 'Gabriel Rocha',
      email: 'gabriel.rocha@liao.ufba.br',
      role: 'Engenheiro Backend & DevOps',
      course: 'Engenharia de Computação',
      photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300',
      bio: 'Especialista em pipelines de CI/CD, microsserviços em Go e Docker para projetos de pesquisa.',
      linkedin: 'https://linkedin.com/in/gabrielrocha-dev',
      github: 'https://github.com/grocha',
      isActive: true,
      isFounder: false,
      year: 2025
    },
  });

  const member5 = await prisma.member.upsert({
    where: { email: 'mariana.santos@liao.ufba.br' },
    update: {},
    create: {
      name: 'Mariana Santos',
      email: 'mariana.santos@liao.ufba.br',
      role: 'Pesquisadora em NLP & LLMs',
      course: 'Ciência da Computação',
      photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
      bio: 'Estuda fine-tuning de LLMs, alinhamento de modelos e processamento de linguagem natural em Português.',
      linkedin: 'https://linkedin.com/in/mariana-santos-nlp',
      github: 'https://github.com/msantos-nlp',
      isActive: true,
      isFounder: false,
      year: 2025
    },
  });

  const member6 = await prisma.member.upsert({
    where: { email: 'fernando.castro@liao.ufba.br' },
    update: {},
    create: {
      name: 'Fernando Castro',
      email: 'fernando.castro@liao.ufba.br',
      role: 'Pesquisador em Otimização Combinatória',
      course: 'Matemática Aplicada',
      photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=300',
      bio: 'Desenvolve heurísticas avançadas e programação linear inteira aplicadas à logística urbana.',
      linkedin: 'https://linkedin.com/in/fernando-castro-math',
      github: 'https://github.com/fcastro-opt',
      isActive: true,
      isFounder: false,
      year: 2024
    },
  });

  // 3. Create Partners
  console.log('Creating partnerships...');
  const partner1 = await prisma.partner.upsert({
    where: { id: 1 },
    update: { isLeaguePartner: true },
    create: {
      id: 1,
      name: 'Google Cloud',
      imageUrl: 'https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg',
      websiteUrl: 'https://cloud.google.com',
      isLeaguePartner: true
    }
  });

  const partner2 = await prisma.partner.upsert({
    where: { id: 2 },
    update: { isLeaguePartner: true },
    create: {
      id: 2,
      name: 'GitHub',
      imageUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Logo.png',
      websiteUrl: 'https://github.com',
      isLeaguePartner: true
    }
  });

  const partner3 = await prisma.partner.upsert({
    where: { id: 3 },
    update: { isLeaguePartner: true },
    create: {
      id: 3,
      name: 'NVIDIA',
      imageUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/about-nvidia/logo-and-brand/01-nvidia-logo-vert-500x200-2c50-p@2x.png',
      websiteUrl: 'https://nvidia.com',
      isLeaguePartner: true
    }
  });

  const partner4 = await prisma.partner.upsert({
    where: { id: 4 },
    update: { isLeaguePartner: true },
    create: {
      id: 4,
      name: 'Amazon Web Services',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
      websiteUrl: 'https://aws.amazon.com',
      isLeaguePartner: true
    }
  });

  const partner5 = await prisma.partner.upsert({
    where: { id: 5 },
    update: { isLeaguePartner: true },
    create: {
      id: 5,
      name: 'Microsoft',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
      websiteUrl: 'https://microsoft.com',
      isLeaguePartner: true
    }
  });

  const partner6 = await prisma.partner.upsert({
    where: { id: 6 },
    update: { isLeaguePartner: true },
    create: {
      id: 6,
      name: 'Meta AI',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
      websiteUrl: 'https://ai.meta.com',
      isLeaguePartner: true
    }
  });

  const partner7 = await prisma.partner.upsert({
    where: { id: 7 },
    update: { isLeaguePartner: true },
    create: {
      id: 7,
      name: 'SENAI CIMATEC',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/SENAI_logo.svg/320px-SENAI_logo.svg.png',
      websiteUrl: 'https://senaicimatec.com.br',
      isLeaguePartner: true
    }
  });

  const partner8 = await prisma.partner.upsert({
    where: { id: 8 },
    update: { isLeaguePartner: true },
    create: {
      id: 8,
      name: 'Petrobras',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Petrobras_logo.svg',
      websiteUrl: 'https://petrobras.com.br',
      isLeaguePartner: true
    }
  });

  const partner9 = await prisma.partner.upsert({
    where: { id: 9 },
    update: { isLeaguePartner: true },
    create: {
      id: 9,
      name: 'Hub Salvador',
      imageUrl: 'https://hubsalvador.com.br/wp-content/uploads/2020/09/logo-hub-salvador.png',
      websiteUrl: 'https://hubsalvador.com.br',
      isLeaguePartner: true
    }
  });

  const partner10 = await prisma.partner.upsert({
    where: { id: 10 },
    update: { isLeaguePartner: true },
    create: {
      id: 10,
      name: 'IBM Quantum',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
      websiteUrl: 'https://ibm.com/quantum',
      isLeaguePartner: true
    }
  });

  // 4. Create Projects
  console.log('Creating projects...');
  const project1 = await prisma.project.upsert({
    where: { id: 1 },
    update: {
      title: 'OptiRoute Salvador: Otimização do Transporte Público',
      description: 'Sistema inteligente de roteamento e otimização de horários para frotas de ônibus urbanos utilizando algoritmos genéticos e aprendizado por reforço para diminuir o tempo de espera nas estações.',
      images: [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80'
      ],
    },
    create: {
      id: 1,
      title: 'OptiRoute Salvador: Otimização do Transporte Público',
      description: 'Sistema inteligente de roteamento e otimização de horários para frotas de ônibus urbanos utilizando algoritmos genéticos e aprendizado por reforço para diminuir o tempo de espera nas estações.',
      images: [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80'
      ],
      date: new Date('2025-11-10T10:00:00Z'),
    }
  });

  const project2 = await prisma.project.upsert({
    where: { id: 2 },
    update: {
      title: 'BioVision: IA para Triagem Radiológica e Diagnóstico Clínico',
      description: 'Plataforma baseada em redes neurais convolucionais e modelos Vision Transformer para auxílio no diagnóstico precoce de patologias pulmonares a partir de imagens de raio-X.',
      images: [
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1200&q=80'
      ],
    },
    create: {
      id: 2,
      title: 'BioVision: IA para Triagem Radiológica e Diagnóstico Clínico',
      description: 'Plataforma baseada em redes neurais convolucionais e modelos Vision Transformer para auxílio no diagnóstico precoce de patologias pulmonares a partir de imagens de raio-X.',
      images: [
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1200&q=80'
      ],
      date: new Date('2026-02-15T14:00:00Z'),
    }
  });

  const project3 = await prisma.project.upsert({
    where: { id: 3 },
    update: {
      title: 'LIAO-LLM: Assistente Virtual de Pesquisa Acadêmica',
      description: 'Desenvolvimento de um modelo de linguagem em Português ajustado com RAG (Retrieval-Augmented Generation) para responder dúvidas de alunos e apoiar buscas bibliográficas na UFBA.',
      images: [
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
      ],
    },
    create: {
      id: 3,
      title: 'LIAO-LLM: Assistente Virtual de Pesquisa Acadêmica',
      description: 'Desenvolvimento de um modelo de linguagem em Português ajustado com RAG (Retrieval-Augmented Generation) para responder dúvidas de alunos e apoiar buscas bibliográficas na UFBA.',
      images: [
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
      ],
      date: new Date('2026-04-01T09:00:00Z'),
    }
  });

  const project4 = await prisma.project.upsert({
    where: { id: 4 },
    update: {
      title: 'EcoGrid: Previsão de Demanda Energética e Redes Inteligentes',
      description: 'Aplicação de séries temporais com LSTM e Transformers para previsão de picos de consumo elétrico e integração eficiente de fontes renováveis na matriz baiana.',
      images: [
        'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80'
      ],
    },
    create: {
      id: 4,
      title: 'EcoGrid: Previsão de Demanda Energética e Redes Inteligentes',
      description: 'Aplicação de séries temporais com LSTM e Transformers para previsão de picos de consumo elétrico e integração eficiente de fontes renováveis na matriz baiana.',
      images: [
        'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80'
      ],
      date: new Date('2026-05-18T11:30:00Z'),
    }
  });

  // 5. Create Newsletter / Articles
  console.log('Creating newsletter articles...');
  await prisma.article.upsert({
    where: { id: 1 },
    update: {
      title: 'A Revolução dos Modelos de Linguagem e os Desafios em Língua Portuguesa',
      description: 'Uma análise detalhada sobre como os grandes modelos de linguagem estão moldando a pesquisa acadêmica e a necessidade urgente de datasets representativos em Português do Brasil.',
      content: `### Introdução aos Modelos de Linguagem Nativos

Os modelos de linguagem de grande porte (LLMs) transformaram drasticamente o campo do Processamento de Linguagem Natural (PLN). No entanto, grande parte do progresso concentrou-se inicialmente na língua inglesa.

No **LIAO (Laboratório de Inteligência Artificial e Otimização)**, estamos investindo em pesquisas focadas no fine-tuning e na construção de corpora de dados adaptados à realidade cultural e linguística brasileira.

### Desafios Técnicos

1. **Tokenização Eficiente**: Tokenizadores pré-treinados em inglês tendem a fragmentar palavras em português em múltiplos sub-tokens, aumentando o custo computacional.
2. **Alinhamento e Avaliação**: Criar benchmarks de avaliação rigorosos para tarefas em PT-BR.
3. **Privacidade e Governança**: Garantir o uso ético e seguro de dados universitários e públicos.

### O Projeto LIAO-LLM

Recentemente lançamos o nosso protótipo de assistente acadêmico baseado em RAG (Retrieval-Augmented Generation), capaz de indexar milhares de artigos científicos e planos de curso da UFBA.`,
      images: [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
      ],
      tags: ['IA', 'LLM', 'NLP', 'Pesquisa Acadêmica'],
      isPublished: true,
      references: [
        'https://arxiv.org/abs/2303.08774',
        'https://liao.ufba.br/pesquisas/nlp'
      ],
      authorId: member5.id,
      authorName: member5.name,
      likes: 38
    },
    create: {
      id: 1,
      title: 'A Revolução dos Modelos de Linguagem e os Desafios em Língua Portuguesa',
      description: 'Uma análise detalhada sobre como os grandes modelos de linguagem estão moldando a pesquisa acadêmica e a necessidade urgente de datasets representativos em Português do Brasil.',
      content: `### Introdução aos Modelos de Linguagem Nativos

Os modelos de linguagem de grande porte (LLMs) transformaram drasticamente o campo do Processamento de Linguagem Natural (PLN). No entanto, grande parte do progresso concentrou-se inicialmente na língua inglesa.

No **LIAO (Laboratório de Inteligência Artificial e Otimização)**, estamos investindo em pesquisas focadas no fine-tuning e na construção de corpora de dados adaptados à realidade cultural e linguística brasileira.

### Desafios Técnicos

1. **Tokenização Eficiente**: Tokenizadores pré-treinados em inglês tendem a fragmentar palavras em português em múltiplos sub-tokens, aumentando o custo computacional.
2. **Alinhamento e Avaliação**: Criar benchmarks de avaliação rigorosos para tarefas em PT-BR.
3. **Privacidade e Governança**: Garantir o uso ético e seguro de dados universitários e públicos.

### O Projeto LIAO-LLM

Recentemente lançamos o nosso protótipo de assistente acadêmico baseado em RAG (Retrieval-Augmented Generation), capaz de indexar milhares de artigos científicos e planos de curso da UFBA.`,
      images: [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
      ],
      tags: ['IA', 'LLM', 'NLP', 'Pesquisa Acadêmica'],
      isPublished: true,
      references: [
        'https://arxiv.org/abs/2303.08774',
        'https://liao.ufba.br/pesquisas/nlp'
      ],
      authorId: member5.id,
      authorName: member5.name,
      likes: 38
    }
  });

  await prisma.article.upsert({
    where: { id: 2 },
    update: {
      title: 'Otimização Combinatória no Mundo Real: Do Caixeiro Viajante às Cidades Inteligentes',
      description: 'Entenda como algoritmos genéticos, Simulated Annealing e programação inteira resolvem problemas complexos de distribuição logística e planejamento urbano.',
      content: `### O Problema da Roteirização em Grandes Centros

Organizar rotas de entrega e itinerários de transporte público em grandes cidades como Salvador apresenta complexidades computacionais classificadas como NP-duras.

### Meta-heurísticas Aplicadas

Para solucionar estes gargalos, a otimização combinatória recorre a abordagens estocásticas e meta-heurísticas:

* **Algoritmos Genéticos**: Simulação do processo evolutivo para iterar sobre populações de soluções candidatas.
* **Busca Tabu**: Evita que o algoritmo fique preso em ótimos locais por meio de estruturas de memória.
* **Otimização por Colônia de Formigas (ACO)**: Algoritmo inspirado na natureza para encontrar caminhos ótimos em grafos.

### Resultados Práticos

Com o projeto *OptiRoute*, nossa equipe demonstrou uma redução estimada de 18% no tempo médio de espera de passageiros em horários de pico.`,
      images: [
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80'
      ],
      tags: ['Otimização', 'Algoritmos Genéticos', 'Logística', 'Cidades Inteligentes'],
      isPublished: true,
      references: [
        'https://liao.ufba.br/projetos/optiroute'
      ],
      authorId: member6.id,
      authorName: member6.name,
      likes: 29
    },
    create: {
      id: 2,
      title: 'Otimização Combinatória no Mundo Real: Do Caixeiro Viajante às Cidades Inteligentes',
      description: 'Entenda como algoritmos genéticos, Simulated Annealing e programação inteira resolvem problemas complexos de distribuição logística e planejamento urbano.',
      content: `### O Problema da Roteirização em Grandes Centros

Organizar rotas de entrega e itinerários de transporte público em grandes cidades como Salvador apresenta complexidades computacionais classificadas como NP-duras.

### Meta-heurísticas Aplicadas

Para solucionar estes gargalos, a otimização combinatória recorre a abordagens estocásticas e meta-heurísticas:

* **Algoritmos Genéticos**: Simulação do processo evolutivo para iterar sobre populações de soluções candidatas.
* **Busca Tabu**: Evita que o algoritmo fique preso em ótimos locais por meio de estruturas de memória.
* **Otimização por Colônia de Formigas (ACO)**: Algoritmo inspirado na natureza para encontrar caminhos ótimos em grafos.

### Resultados Práticos

Com o projeto *OptiRoute*, nossa equipe demonstrou uma redução estimada de 18% no tempo médio de espera de passageiros em horários de pico.`,
      images: [
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80'
      ],
      tags: ['Otimização', 'Algoritmos Genéticos', 'Logística', 'Cidades Inteligentes'],
      isPublished: true,
      references: [
        'https://liao.ufba.br/projetos/optiroute'
      ],
      authorId: member6.id,
      authorName: member6.name,
      likes: 29
    }
  });

  await prisma.article.upsert({
    where: { id: 3 },
    update: {
      title: 'Visão Computacional na Saúde: O Impacto do Aprendizado Profundo no Diagnóstico Médico',
      description: 'Explorando como arquiteturas convolucionais e modelos multimodal estão apoiando profissionais de saúde no diagnóstico rápido e preciso.',
      content: `### Inteligência Artificial no Diagnóstico por Imagem

A interpretação médica de exames radiológicos exige precisão cirúrgica e tempo hábil. A integração de modelos de visão computacional treinados em milhares de exames anonimizados vem acelerando esse fluxo.

### Arquiteturas em Destaque

1. **U-Net**: Padrão-ouro para segmentação médica detalhada de órgãos e lesões.
2. **Vision Transformers (ViT)**: Capturam relações globais e contextuais na imagem com mecanismos de atenção.
3. **Modelos Grad-CAM**: Oferecem explicabilidade ao indicar graficamente quais regiões da imagem influenciaram a predição da rede.`,
      images: [
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80'
      ],
      tags: ['Visão Computacional', 'Saúde', 'Deep Learning', 'Inovação'],
      isPublished: true,
      references: [
        'https://nature.com/articles/s41591-020-0937-5'
      ],
      authorId: member3.id,
      authorName: member3.name,
      likes: 45
    },
    create: {
      id: 3,
      title: 'Visão Computacional na Saúde: O Impacto do Aprendizado Profundo no Diagnóstico Médico',
      description: 'Explorando como arquiteturas convolucionais e modelos multimodal estão apoiando profissionais de saúde no diagnóstico rápido e preciso.',
      content: `### Inteligência Artificial no Diagnóstico por Imagem

A interpretação médica de exames radiológicos exige precisão cirúrgica e tempo hábil. A integração de modelos de visão computacional treinados em milhares de exames anonimizados vem acelerando esse fluxo.

### Arquiteturas em Destaque

1. **U-Net**: Padrão-ouro para segmentação médica detalhada de órgãos e lesões.
2. **Vision Transformers (ViT)**: Capturam relações globais e contextuais na imagem com mecanismos de atenção.
3. **Modelos Grad-CAM**: Oferecem explicabilidade ao indicar graficamente quais regiões da imagem influenciaram a predição da rede.`,
      images: [
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80'
      ],
      tags: ['Visão Computacional', 'Saúde', 'Deep Learning', 'Inovação'],
      isPublished: true,
      references: [
        'https://nature.com/articles/s41591-020-0937-5'
      ],
      authorId: member3.id,
      authorName: member3.name,
      likes: 45
    }
  });

  await prisma.article.upsert({
    where: { id: 4 },
    update: {
      title: 'Retrospectiva LIAO: Conquistas de 2025 & Perspectivas para 2026',
      description: 'Um resumo dos principais marcos do laboratório, publicação de artigos internacionais, expansão do time e parcerias com o setor industrial.',
      content: `### Um Ano de Crescimento e Impacto Científico

O ano de 2025 marcou um período extraordinário para o **LIAO**. Expandimos nossa infraestrutura de cálculo, consolidamos novos membros e ampliamos nossas parcerias com grandes empresas e hubs de inovação.

### Destaques do Ano

- **5 Artigos Publicados** em conferências internacionais qualificadas.
- **Ampliação do Time**: Inclusão de novos pesquisadores de graduação e pós-graduação.
- **Hackathon LIAO**: Integração de mais de 100 participantes focados em soluções de impacto social.

Agradecemos a todos os mentores, estudantes e parceiros que tornam esse projeto possível!`,
      images: [
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80'
      ],
      tags: ['Institucional', 'Retrospectiva', 'LIAO', 'UFBA'],
      isPublished: true,
      references: [
        'https://liao.ufba.br'
      ],
      authorId: member1.id,
      authorName: member1.name,
      likes: 62
    },
    create: {
      id: 4,
      title: 'Retrospectiva LIAO: Conquistas de 2025 & Perspectivas para 2026',
      description: 'Um resumo dos principais marcos do laboratório, publicação de artigos internacionais, expansão do time e parcerias com o setor industrial.',
      content: `### Um Ano de Crescimento e Impacto Científico

O ano de 2025 marcou um período extraordinário para o **LIAO**. Expandimos nossa infraestrutura de cálculo, consolidamos novos membros e ampliamos nossas parcerias com grandes empresas e hubs de inovação.

### Destaques do Ano

- **5 Artigos Publicados** em conferências internacionais qualificadas.
- **Ampliação do Time**: Inclusão de novos pesquisadores de graduação e pós-graduação.
- **Hackathon LIAO**: Integração de mais de 100 participantes focados em soluções de impacto social.

Agradecemos a todos os mentores, estudantes e parceiros que tornam esse projeto possível!`,
      images: [
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80'
      ],
      tags: ['Institucional', 'Retrospectiva', 'LIAO', 'UFBA'],
      isPublished: true,
      references: [
        'https://liao.ufba.br'
      ],
      authorId: member1.id,
      authorName: member1.name,
      likes: 62
    }
  });

  // 6. Create Events
  console.log('Creating events...');
  const eventData = {
    title: 'Workshop IA Avançada: Do Zero ao Deploy',
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
        content: "Edição encerrada com grande engajamento de alunos e profissionais! Confira abaixo a gravação completa, os slides de apresentação e o álbum de fotos."
      },
      materials: {
        recordingUrl: 'https://youtube.com/watch?v=demo-workshop-ia',
        slidesUrl: 'https://drive.google.com/file/d/demo-workshop-slides/view',
        photosUrl: 'https://photos.google.com/share/demo-workshop-album',
        certificatesUrl: 'https://exemplo.com/certificados/workshop-ia-2026'
      },
      stats: [
        { id: '1', value: '80+', label: 'Desenvolvedores e Pesquisadores' },
        { id: '2', value: '6h', label: 'Imersão de Fine-Tuning' },
        { id: '3', value: '12', label: 'Modelos LLMs Deployed' },
        { id: '4', value: '100%', label: 'Vagas Preenchidas' }
      ]
    }),
    coverImage: 'https://images.unsplash.com/photo-1745674684463-62f62cb88d4c?q=80&w=1470&auto=format&fit=crop',
    date: new Date('2026-05-20T14:00:00Z'),
    location: 'Auditório Magno - Instituto de Computação',
    highlights: [
      'Arquitetura de Transformers',
      'Fine-tuning com LoRA',
      'Deploy com Kubernetes',
      'Networking com Profissionais'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'
    ],
    palette: ['#4F46E5', '#761515'],
    borderRadius: 'squared',
    fontClass: 'font-mono',
    subscribe: "https://example.com/subscribe",
    themeMode: 'dark',
  }; 

  const event = await prisma.event.upsert({
    where: { slug: 'workshop-ia-avancada-2026' },
    update: {
        ...eventData,
        partners: {
            set: [{ id: partner1.id }, { id: partner2.id }, { id: partner3.id }, { id: partner4.id }]
        }
    },
    create: {
      ...eventData,
      slug: 'workshop-ia-avancada-2026',
      agenda: {
        create: [
          { time: '14:00', title: 'Credenciamento', description: 'Recepção e entrega de kits.' },
          { time: '14:30', title: 'Keynote: O Estado da IA', speakerName: 'Dra. Helena Costa' },
          { time: '15:30', title: 'Hands-on: Fine-tuning', description: 'Prática guiada com PyTorch.' },
          { time: '17:00', title: 'Painel LIAO', description: 'Discussão aberta sobre pesquisa no Brasil.' }
        ]
      },
      speakers: {
        create: [
          {
            name: 'Dra. Helena Costa',
            role: 'Head of AI',
            company: 'TechCorp Global',
            photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
            link: 'https://linkedin.com/in/helenacosta'
          },
          {
            memberId: member1.id,
            role: 'Líder IC',
            link: 'https://github.com/alice'
          }
        ]
      },
      partners: {
        connect: [{ id: partner1.id }, { id: partner2.id }, { id: partner3.id }, { id: partner4.id }]
      }
    }
  });

  const lightEventData = {
    title: 'Simpósio de Otimização e Sustentabilidade',
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
        content: "Agradecemos a todos os palestrantes e congressistas! Acesse os materiais das apresentações abaixo."
      },
      materials: {
        recordingUrl: 'https://youtube.com/watch?v=demo-simposio',
        slidesUrl: 'https://drive.google.com/file/d/demo-simposio-slides/view',
        certificatesUrl: 'https://exemplo.com/certificados/simposio-2026'
      },
      stats: [
        { id: '1', value: '120+', label: 'Congressistas e Palestrantes' },
        { id: '2', value: '15', label: 'Artigos Apresentados' },
        { id: '3', value: '8', label: 'Empresas Parceiras' }
      ]
    }),
    coverImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1470&auto=format&fit=crop',
    date: new Date('2026-06-15T09:00:00Z'),
    location: 'Auditório 2 - Pavilhão de Aulas do IC',
    highlights: [
      'Modelagem Matemática Verde',
      'Smart Grids Eficientes',
      'Logística Reversa de Resíduos',
      'Descarbonização com IA'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
    ],
    palette: ['#059669', '#0d9488', '#2563eb'],
    borderRadius: 'round',
    fontClass: 'font-space',
    subscribe: "https://example.com/subscribe-sustentabilidade",
    themeMode: 'light',
  };

  const lightEvent = await prisma.event.upsert({
    where: { slug: 'simposio-otimizacao-sustentabilidade-2026' },
    update: {
        ...lightEventData,
        partners: {
            set: [{ id: partner2.id }, { id: partner3.id }, { id: partner7.id }, { id: partner8.id }]
        }
    },
    create: {
      ...lightEventData,
      slug: 'simposio-otimizacao-sustentabilidade-2026',
      agenda: {
        create: [
          { time: '09:00', title: 'Abertura do Simpósio', description: 'Boas-vindas e apresentação da agenda.' },
          { time: '09:30', title: 'Palestras de Smart Grids', speakerName: 'Bruno Santos' },
          { time: '11:00', title: 'Algoritmos e Clima', description: 'Estudo prático de redução de CO2.' }
        ]
      },
      speakers: {
        create: [
          {
            memberId: member2.id,
            role: 'Pesquisador de Infraestrutura',
            link: 'https://github.com/bruno'
          }
        ]
      },
      partners: {
        connect: [{ id: partner2.id }, { id: partner3.id }, { id: partner7.id }, { id: partner8.id }]
      }
    }
  });

  // Additional Past Event
  const pastEventData = {
    title: 'Minicurso: Introdução ao Python para Ciência de Dados',
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
      materials: {
        recordingUrl: 'https://youtube.com/watch?v=demo-python',
        slidesUrl: 'https://drive.google.com/file/d/demo-python-slides/view',
        photosUrl: 'https://photos.google.com/share/demo-python-album',
        certificatesUrl: 'https://exemplo.com/certificados/python-2026'
      },
      stats: [
        { id: '1', value: '45+', label: 'Participantes Inscritos' },
        { id: '2', value: '4h', label: 'Prática Intensiva' },
        { id: '3', value: '100%', label: 'Exercícios Concluídos' },
        { id: '4', value: '4.9/5', label: 'Avaliação dos Alunos' }
      ]
    }),
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1470&auto=format&fit=crop',
    date: new Date('2026-03-10T14:00:00Z'),
    location: 'Laboratório de Informática 3 - IC UFBA',
    highlights: [
      'Fundamentos de Python',
      'Numpy & Pandas',
      'Visualização de Dados',
      'Casos Práticos'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'
    ],
    palette: ['#D97706', '#B45309'],
    borderRadius: 'squared',
    fontClass: 'font-mono',
    themeMode: 'light',
  };

  await prisma.event.upsert({
    where: { slug: 'minicurso-python-dados-2026' },
    update: {
      ...pastEventData,
      partners: { set: [{ id: partner2.id }, { id: partner5.id }] }
    },
    create: {
      ...pastEventData,
      slug: 'minicurso-python-dados-2026',
      agenda: {
        create: [
          { time: '14:00', title: 'Instalação e Conceitos Fundamentais', description: 'Ambiente Jupyter e bibliotecas' },
          { time: '15:30', title: 'Análise Exploratória na Prática', description: 'Manipulação de conjuntos de dados reais' },
          { time: '17:00', title: 'Primeiro Modelo de Regressão', description: 'Scikit-learn hands-on' }
        ]
      },
      speakers: {
        create: [
          {
            memberId: member1.id,
            role: 'Instrutora Principal',
            link: 'https://github.com/alice'
          }
        ]
      },
      partners: { connect: [{ id: partner2.id }, { id: partner5.id }] }
    }
  });

  // Future Event 1 (September 2026)
  const futureEvent1Data = {
    title: 'Hackathon LIAO 2026: IA & Otimização Combinatória',
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
    date: new Date('2026-09-12T08:00:00Z'),
    location: 'Auditório Principal & Hub de Inovação - UFBA',
    highlights: [
      'Maratona Prática de 36 Horas',
      'Premiação para Equipes Destaque',
      'Mentoria com Especialistas do Mercado',
      'Certificado e Certificação de Impacto'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
    ],
    palette: ['#2563EB', '#7C3AED'],
    borderRadius: 'round',
    fontClass: 'font-outfit',
    subscribe: 'https://example.com/hackathon-2026',
    themeMode: 'dark',
  };

  await prisma.event.upsert({
    where: { slug: 'hackathon-liao-2026' },
    update: {
      ...futureEvent1Data,
      partners: { set: [{ id: partner1.id }, { id: partner3.id }, { id: partner6.id }, { id: partner9.id }] }
    },
    create: {
      ...futureEvent1Data,
      slug: 'hackathon-liao-2026',
      agenda: {
        create: [
          { time: '08:00', title: 'Abertura & Formação de Equipes', description: 'Recepção, network e pitch de problemas' },
          { time: '09:00', title: 'Liberação dos Desafios', description: 'Início da maratona de desenvolvimento' },
          { time: '18:00', title: 'Checkpoint de Mentoria', description: 'Feedback técnico e validação de MVPs' }
        ]
      },
      speakers: {
        create: [
          {
            memberId: member2.id,
            role: 'Coordenador Técnico',
            link: 'https://github.com/bruno'
          }
        ]
      },
      partners: { connect: [{ id: partner1.id }, { id: partner3.id }, { id: partner6.id }, { id: partner9.id }] }
    }
  });

  // Future Event 2 (October 2026)
  const futureEvent2Data = {
    title: 'Semana da Inteligência Artificial e Otimização 2026',
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
    date: new Date('2026-10-20T09:00:00Z'),
    location: 'Centro de Convenções UFBA - PAF I',
    highlights: [
      'Palestras com Pesquisadores Internacionais',
      'Minicursos Práticos de Deep Learning',
      'Sessão de Pôsteres Acadêmicos',
      'Mesa Redonda: Ética e Futuro do Trabalho'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
    ],
    palette: ['#0D9488', '#0284C7'],
    borderRadius: 'round',
    fontClass: 'font-space',
    subscribe: 'https://example.com/semana-ia-2026',
    themeMode: 'light',
  };

  await prisma.event.upsert({
    where: { slug: 'semana-da-ia-e-otimizacao-2026' },
    update: {
      ...futureEvent2Data,
      partners: { set: [{ id: partner1.id }, { id: partner2.id }, { id: partner3.id }, { id: partner5.id }, { id: partner10.id }] }
    },
    create: {
      ...futureEvent2Data,
      slug: 'semana-da-ia-e-otimizacao-2026',
      agenda: {
        create: [
          { time: '09:00', title: 'Sessão Solene de Abertura', description: 'Boas-vindas com a diretoria do LIAO' },
          { time: '10:00', title: 'Keynote: O Futuro dos Modelos Generativos', speakerName: 'Dra. Helena Costa' },
          { time: '14:00', title: 'Workshop: Otimização de Hiperparâmetros', description: 'Prática em cluster GPU' }
        ]
      },
      speakers: {
        create: [
          {
            name: 'Dra. Helena Costa',
            role: 'Head of AI',
            company: 'TechCorp Global',
            photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
            link: 'https://linkedin.com/in/helenacosta'
          }
        ]
      },
      partners: { connect: [{ id: partner1.id }, { id: partner2.id }, { id: partner3.id }, { id: partner5.id }, { id: partner10.id }] }
    }
  });

  // 7. System Config
  console.log('Seeding system config...');
  await prisma.systemConfig.upsert({
    where: { key: 'CONTACT_EMAIL' },
    update: {},
    create: {
      key: 'CONTACT_EMAIL',
      value: 'contato@liao.com'
    }
  });

  // 8. Create Tutors
  console.log('Creating tutors...');
  await prisma.tutor.upsert({
    where: { email: 'carlos@liao.com' },
    update: {},
    create: {
      name: 'Carlos Alberto',
      email: 'carlos@liao.com',
      subjects: ['Cálculo I', 'Álgebra Linear', 'Física I'],
      bio: 'Tutor de exatas com foco em ajudar alunos nas disciplinas básicas do primeiro ano de engenharia e ciência.',
      availability: 'Segunda e Quarta, das 14h às 16h',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    }
  });

  await prisma.tutor.upsert({
    where: { email: 'daniela@liao.com' },
    update: {},
    create: {
      name: 'Daniela Souza',
      email: 'daniela@liao.com',
      subjects: ['Estruturas de Dados', 'Programação Orientada a Objetos'],
      bio: 'Apaixonada por ensinar algoritmos, Java, C++ e desenvolvimento de software.',
      availability: 'Terça e Quinta, das 10h às 12h',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    }
  });

  // 9. Create Dev Admin User "test" (Dev environment only)
  const isDev = process.env.NODE_ENV !== 'production' && (process.env.DB_ENV === 'dev' || !process.env.DB_ENV);
  if (isDev) {
    console.log('Creating dev admin user test...');
    const hashedPassword = await bcrypt.hash('123', 10);

    await prisma.user.upsert({
      where: { email: 'test@liao.com' },
      update: {
        password: hashedPassword,
        name: 'test',
        role: 'master',
        permissions: ['*'],
      },
      create: {
        email: 'test@liao.com',
        password: hashedPassword,
        name: 'test',
        role: 'master',
        permissions: ['*'],
      },
    });

    await prisma.user.upsert({
      where: { email: 'test' },
      update: {
        password: hashedPassword,
        name: 'test',
        role: 'master',
        permissions: ['*'],
      },
      create: {
        email: 'test',
        password: hashedPassword,
        name: 'test',
        role: 'master',
        permissions: ['*'],
      },
    });
  }

  console.log('🎉 Seed completed successfully with founders, members, projects, newsletter articles, partnerships, events, tutors, and admin user!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
