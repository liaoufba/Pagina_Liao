import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import type { EventApi } from '../../models/Event';

interface FAQ {
    id?: number;
    question: string;
    answer: string;
    order: number;
}

interface FAQManagerModalProps {
    event: EventApi;
    onClose: () => void;
}

const FAQManagerModal: React.FC<FAQManagerModalProps> = ({ event, onClose }) => {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
    const [newFaq, setNewFaq] = useState<FAQ>({ question: '', answer: '', order: 0 });

    const fetchFaqs = async () => {
        try {
            const response = await apiService.getFAQsByEvent(event.id as number);
            setFaqs(response.data || []);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, [event.id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingFaq) {
                await apiService.updateFAQ(editingFaq.id!, editingFaq);
            } else {
                await apiService.createFAQ({ ...newFaq, eventId: event.id as number });
            }
            setEditingFaq(null);
            setNewFaq({ question: '', answer: '', order: faqs.length + 1 });
            fetchFaqs();
        } catch (error) {
            alert('Erro ao salvar FAQ');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Excluir este FAQ?')) return;
        try {
            await apiService.deleteFAQ(id);
            fetchFaqs();
        } catch (error) {
            alert('Erro ao excluir FAQ');
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-neutral-200 dark:border-neutral-800 flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b dark:border-neutral-800 flex justify-between items-center bg-neutral-50 dark:bg-neutral-900/50">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Gerenciar FAQs</h2>
                        <p className="text-sm text-neutral-500">{event.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Form Section */}
                    <div className="bg-neutral-50 dark:bg-neutral-800/30 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                            {editingFaq ? 'Editar Pergunta' : 'Nova Pergunta'}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Pergunta</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded-xl"
                                        placeholder="Ex: Onde será o evento?"
                                        value={editingFaq ? editingFaq.question : newFaq.question}
                                        onChange={(e) => editingFaq ? setEditingFaq({...editingFaq, question: e.target.value}) : setNewFaq({...newFaq, question: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Ordem</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded-xl"
                                        value={editingFaq ? editingFaq.order : newFaq.order}
                                        onChange={(e) => editingFaq ? setEditingFaq({...editingFaq, order: Number(e.target.value)}) : setNewFaq({...newFaq, order: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Resposta</label>
                                <textarea 
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded-xl resize-none"
                                    placeholder="Descreva a resposta completa aqui..."
                                    value={editingFaq ? editingFaq.answer : newFaq.answer}
                                    onChange={(e) => editingFaq ? setEditingFaq({...editingFaq, answer: e.target.value}) : setNewFaq({...newFaq, answer: e.target.value})}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                {editingFaq && (
                                    <button 
                                        type="button" 
                                        onClick={() => setEditingFaq(null)}
                                        className="px-6 py-2 text-neutral-500 hover:text-neutral-700 font-bold"
                                    >
                                        Cancelar
                                    </button>
                                )}
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="px-8 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50"
                                >
                                    {saving ? 'Gravando...' : editingFaq ? 'Atualizar' : 'Adicionar FAQ'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* List Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Perguntas Cadastradas</h3>
                        {loading ? (
                            <div className="text-center py-12 text-neutral-500 animate-pulse">Carregando FAQs...</div>
                        ) : faqs.length === 0 ? (
                            <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-500">
                                Nenhum FAQ cadastrado para este evento.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {faqs.map((faq) => (
                                    <div key={faq.id} className="group p-4 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 hover:border-primary-500/50 hover:shadow-lg transition-all flex justify-between items-start">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-500 text-[10px] font-bold rounded-full"># {faq.order}</span>
                                                <h4 className="font-bold text-neutral-900 dark:text-white truncate">{faq.question}</h4>
                                            </div>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1">{faq.answer}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => setEditingFaq(faq)}
                                                className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                ✎
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(faq.id!)}
                                                className="p-2 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                                                title="Excluir"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQManagerModal;
