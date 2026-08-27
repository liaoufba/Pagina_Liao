import React, { useState, useEffect } from 'react';

import ScheduleEditor from './ScheduleEditor';
import type { ScheduleTableData } from './ScheduleEditor';

export interface FixedSection {
    enabled: boolean;
    content: string;
}

export interface DynamicSection {
    id: string;
    title: string;
    content: string;
}

export interface EventStat {
    id: string;
    value: string;
    label: string;
}

export interface EventContentState {
    presentation: FixedSection;
    objectives: FixedSection;
    targetAudience: FixedSection;
    structure: FixedSection;
    schedule: FixedSection;
    finalConsiderations: FixedSection;
    dynamicSections: DynamicSection[];
    scheduleTable: ScheduleTableData;
    stats?: EventStat[];
}

type FixedSectionKey = keyof Omit<EventContentState, 'dynamicSections' | 'scheduleTable' | 'stats'>;

interface EventContentManagerProps {
    initialContent?: string;
    onChange: (contentJson: string) => void;
}

const DEFAULT_STATE: EventContentState = {
    presentation: { enabled: false, content: '' },
    objectives: { enabled: false, content: '' },
    targetAudience: { enabled: false, content: '' },
    structure: { enabled: false, content: '' },
    schedule: { enabled: false, content: '' },
    finalConsiderations: { enabled: false, content: '' },
    dynamicSections: [],
    scheduleTable: {
        enabled: false,
        days: [],
        hours: [],
        data: {}
    },
    stats: []
};

// Section Keys mapped to human readable titles
const FIXED_SECTIONS_MAP: Record<FixedSectionKey, string> = {
    presentation: 'Descrição Detalhada / Resumo do Evento',
    objectives: 'Objetivos',
    targetAudience: 'Público-alvo',
    structure: 'Estrutura Geral do Evento',
    schedule: 'Cronograma',
    finalConsiderations: 'Considerações Finais'
};

const EventContentManager: React.FC<EventContentManagerProps> = ({ initialContent, onChange }) => {
    const [state, setState] = useState<EventContentState>(() => {
        if (!initialContent) return DEFAULT_STATE;
        try {
            const parsed = JSON.parse(initialContent);
            // Basic validation
            if (parsed && typeof parsed === 'object' && ('presentation' in parsed || 'dynamicSections' in parsed)) {
                return { ...DEFAULT_STATE, ...parsed };
            }
            // Fallback for older events where description was just a string
            return {
                ...DEFAULT_STATE,
                presentation: { enabled: true, content: initialContent }
            };
        } catch {
            return {
                ...DEFAULT_STATE,
                presentation: { enabled: true, content: initialContent }
            };
        }
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDynamicSection, setNewDynamicSection] = useState({ title: '', content: '' });

    const lastContentRef = React.useRef(initialContent);
    // Ensure onChange is triggered whenever state changes
    useEffect(() => {
        const currentContent = JSON.stringify(state);
        if (lastContentRef.current !== currentContent) {
            lastContentRef.current = currentContent;
            onChange(currentContent);
        }
    }, [state, onChange]);

    const handleFixedToggle = (key: FixedSectionKey) => {
        setState(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                enabled: !prev[key].enabled
            }
        }));
    };

    const handleFixedContentChange = (key: FixedSectionKey, content: string) => {
        setState(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                content
            }
        }));
    };

    const saveDynamicSection = () => {
        if (!newDynamicSection.title.trim() || !newDynamicSection.content.trim()) return;
        
        const section: DynamicSection = {
            id: Date.now().toString(),
            title: newDynamicSection.title.trim(),
            content: newDynamicSection.content.trim()
        };

        setState(prev => ({
            ...prev,
            dynamicSections: [...prev.dynamicSections, section]
        }));
        setNewDynamicSection({ title: '', content: '' });
        setIsModalOpen(false);
    };

    const removeDynamicSection = (id: string) => {
        setState(prev => ({
            ...prev,
            dynamicSections: prev.dynamicSections.filter(s => s.id !== id)
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-md font-semibold text-neutral-800 dark:text-neutral-200">Painel de Conteúdo</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">Suporta formatação Markdown (ex: **negrito**, *itálico*, - listas, [links](url))</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors text-sm"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Adicionar Seção Plus
                </button>
            </div>

            <ScheduleEditor 
                value={state.scheduleTable}
                onChange={(newTable) => setState(prev => ({ ...prev, scheduleTable: newTable }))}
            />

            <div className="space-y-4">
                {(Object.entries(FIXED_SECTIONS_MAP) as [FixedSectionKey, string][]).map(([key, title]) => (
                    <div key={key} className="border dark:border-neutral-800 rounded-xl overflow-hidden transition-all duration-300">
                        <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50">
                            <label className="flex items-center gap-3 cursor-pointer select-none w-full">
                                <input
                                    type="checkbox"
                                    checked={state[key].enabled}
                                    onChange={() => handleFixedToggle(key)}
                                    className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{title}</span>
                            </label>
                        </div>
                        {state[key].enabled && (
                            <div className="p-4 border-t dark:border-neutral-800 bg-white dark:bg-neutral-900 animate-in slide-in-from-top-2">
                                {key === 'presentation' && (
                                    <p className="text-xs text-neutral-500 mb-2">
                                        Escreva a visão geral do evento. Serve tanto para descrever detalhes do evento futuro quanto para resumir como ele foi (Markdown ativado).
                                    </p>
                                )}
                                <textarea
                                    className="w-full min-h-[100px] p-3 rounded-lg border dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 outline-none resize-y"
                                    placeholder={`Escreva o conteúdo para ${title} (suporta Markdown)...`}
                                    value={state[key].content}
                                    onChange={(e) => handleFixedContentChange(key, e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Dynamic Sections Render */}
            {state.dynamicSections.length > 0 && (
                <div className="space-y-4 pt-4 border-t dark:border-neutral-800">
                    <h5 className="font-medium text-neutral-700 dark:text-neutral-300">Seções Personalizadas</h5>
                    {state.dynamicSections.map((section) => (
                        <div key={section.id} className="border dark:border-neutral-800 rounded-xl p-4 bg-white dark:bg-neutral-900 relative group">
                            <button
                                type="button"
                                onClick={() => removeDynamicSection(section.id)}
                                className="absolute top-4 right-4 text-neutral-400 hover:text-danger-500 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remover Seção"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                            <h6 className="font-bold text-neutral-800 dark:text-neutral-200 mb-2">{section.title}</h6>
                            <textarea
                                className="w-full min-h-[80px] p-3 rounded-lg border dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 outline-none"
                                value={section.content}
                                onChange={(e) => {
                                    const newContent = e.target.value;
                                    setState(prev => ({
                                        ...prev,
                                        dynamicSections: prev.dynamicSections.map(s => 
                                            s.id === section.id ? { ...s, content: newContent } : s
                                        )
                                    }));
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Números & Métricas do Evento (Pós-Evento) */}
            <div className="space-y-4 pt-6 border-t dark:border-neutral-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h5 className="font-bold text-neutral-800 dark:text-neutral-200">Números & Métricas do Evento (Pós-Evento)</h5>
                        <p className="text-xs text-neutral-500">Exiba destaques numéricos para eventos concluídos (ex: "45+ Participantes", "12h de Código")</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            const newStat: EventStat = { id: Date.now().toString(), value: '', label: '' };
                            setState(prev => ({ ...prev, stats: [...(prev.stats || []), newStat] }));
                        }}
                        className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg text-xs font-bold transition-colors"
                    >
                        + Adicionar Número
                    </button>
                </div>

                {state.stats && state.stats.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {state.stats.map((stat, idx) => (
                            <div key={stat.id || idx} className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border dark:border-neutral-700/60 relative group">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setState(prev => ({
                                            ...prev,
                                            stats: (prev.stats || []).filter(s => s.id !== stat.id)
                                        }));
                                    }}
                                    className="absolute top-2 right-2 text-neutral-400 hover:text-danger-500 transition-colors text-lg"
                                    title="Remover Número"
                                >
                                    ×
                                </button>
                                <div className="space-y-2 pr-6">
                                    <input
                                        type="text"
                                        placeholder="Valor (ex: 45+ ou R$ 10k)"
                                        className="input-field text-xs font-bold w-full"
                                        value={stat.value}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setState(prev => ({
                                                ...prev,
                                                stats: (prev.stats || []).map(s => s.id === stat.id ? { ...s, value: val } : s)
                                            }));
                                        }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Rótulo (ex: Participantes ou Prêmios)"
                                        className="input-field text-xs w-full"
                                        value={stat.label}
                                        onChange={(e) => {
                                            const lbl = e.target.value;
                                            setState(prev => ({
                                                ...prev,
                                                stats: (prev.stats || []).map(s => s.id === stat.id ? { ...s, label: lbl } : s)
                                            }));
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-neutral-400 italic">Nenhum número cadastrado. Clique no botão acima para adicionar.</p>
                )}
            </div>

            {/* Modal para Adicionar Seção */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-lg shadow-xl shadow-black/10 border border-neutral-100 dark:border-neutral-800 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Adicionar Seção Plus</h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Título da Seção</label>
                                <input
                                    type="text"
                                    className="w-full p-3 rounded-lg border dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="Ex: Patrocinadores Ouro"
                                    value={newDynamicSection.title}
                                    onChange={(e) => setNewDynamicSection({ ...newDynamicSection, title: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Conteúdo</label>
                                <textarea
                                    className="w-full min-h-[120px] p-3 rounded-lg border dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 outline-none resize-y"
                                    placeholder="Conteúdo da seção..."
                                    value={newDynamicSection.content}
                                    onChange={(e) => setNewDynamicSection({ ...newDynamicSection, content: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={saveDynamicSection}
                                    disabled={!newDynamicSection.title.trim() || !newDynamicSection.content.trim()}
                                    className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                                >
                                    Salvar Seção
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventContentManager;
