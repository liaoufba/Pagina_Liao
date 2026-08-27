import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import type { Partner } from '../../models/Partner';
import type { EventApi } from '../../models/Event';

interface PartnerFormProps {
    partner?: Partner | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const PartnerForm: React.FC<PartnerFormProps> = ({ partner, onSuccess, onCancel }) => {
    const [name, setName] = useState(partner?.name || '');
    const [imageUrl, setImageUrl] = useState(partner?.imageUrl || '');
    const [websiteUrl, setWebsiteUrl] = useState(partner?.websiteUrl || '');
    const [isLeaguePartner, setIsLeaguePartner] = useState(partner?.isLeaguePartner ?? true);
    const [selectedEventIds, setSelectedEventIds] = useState<number[]>(
        partner?.events?.map((e: any) => e.id) || []
    );
    const [availableEvents, setAvailableEvents] = useState<EventApi[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch events when isLeaguePartner is toggled off
    useEffect(() => {
        if (!isLeaguePartner) {
            setLoadingEvents(true);
            apiService.getEvents()
                .then((res: any) => {
                    setAvailableEvents(res.data || []);
                })
                .catch(() => {
                    setAvailableEvents([]);
                })
                .finally(() => setLoadingEvents(false));
        }
    }, [isLeaguePartner]);

    const toggleEvent = (eventId: number) => {
        setSelectedEventIds(prev =>
            prev.includes(eventId)
                ? prev.filter(id => id !== eventId)
                : [...prev, eventId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedName = name.trim();
        const trimmedImageUrl = imageUrl.trim();
        const trimmedWebsiteUrl = websiteUrl.trim();

        if (!trimmedName || !trimmedImageUrl) {
            setError('Nome e URL da logo são obrigatórios.');
            return;
        }

        if (!isLeaguePartner && selectedEventIds.length === 0) {
            setError('Selecione pelo menos um evento para este parceiro.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = {
                name: trimmedName,
                imageUrl: trimmedImageUrl,
                websiteUrl: trimmedWebsiteUrl || null,
                isLeaguePartner,
                // Pass selected event IDs so the backend can link them
                eventIds: !isLeaguePartner ? selectedEventIds : [],
            };

            if (partner && partner.id) {
                await apiService.updatePartner(partner.id, data);
            } else {
                await apiService.createPartner(data);
            }

            onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Erro ao salvar parceria.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-100 dark:border-neutral-800 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {partner ? 'Editar Parceria' : 'Nova Parceria'}
                </h3>
            </div>

            {error && (
                <div className="p-4 bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 rounded-xl text-sm border border-danger-100 dark:border-danger-800">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Nome da Instituição</label>
                        <input
                            type="text"
                            required
                            className="input-field w-full"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Google, UFBA, etc"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">URL da Logo</label>
                        <input
                            type="url"
                            required
                            className="input-field w-full"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://exemplo.com/logo.png"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Site/Rede Social (Opcional)</label>
                        <input
                            type="url"
                            className="input-field w-full"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            placeholder="https://siteparceiro.com"
                        />
                    </div>

                    {/* League Partner Toggle */}
                    <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                        <div
                            onClick={() => {
                                setIsLeaguePartner(!isLeaguePartner);
                                if (!isLeaguePartner) setSelectedEventIds([]);
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-300 flex-shrink-0 ${isLeaguePartner ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${isLeaguePartner ? 'translate-x-6' : 'translate-x-1'}`} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-neutral-900 dark:text-white">Parceiro da Liga (Global)</p>
                            <p className="text-xs text-neutral-500">
                                {isLeaguePartner
                                    ? 'Aparecerá na página pública de Parcerias.'
                                    : 'Vinculado apenas aos eventos selecionados abaixo.'}
                            </p>
                        </div>
                    </div>

                    {/* Event selection - only shown when NOT a league partner */}
                    {!isLeaguePartner && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800/40 space-y-3 transition-all duration-300">
                            <div className="flex items-center gap-2">
                                <span className="text-amber-600 dark:text-amber-400 text-base">📅</span>
                                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                                    Vincular a Eventos
                                </p>
                            </div>
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                Selecione em quais eventos este parceiro deve aparecer.
                            </p>

                            {loadingEvents ? (
                                <div className="flex items-center gap-2 text-xs text-neutral-500 py-2">
                                    <div className="w-3 h-3 border border-neutral-400 border-t-transparent rounded-full animate-spin" />
                                    Carregando eventos...
                                </div>
                            ) : availableEvents.length === 0 ? (
                                <p className="text-xs text-neutral-500 italic py-2">
                                    Nenhum evento cadastrado.
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {availableEvents.map((event) => {
                                        const isSelected = selectedEventIds.includes(event.id);
                                        return (
                                            <label
                                                key={event.id}
                                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                                                    isSelected
                                                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700'
                                                        : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-primary-200 dark:hover:border-primary-800'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleEvent(event.id)}
                                                    className="w-4 h-4 rounded text-primary-600 accent-primary-600"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-neutral-800 dark:text-neutral-200'}`}>
                                                        {event.title}
                                                    </p>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                                                        {new Date(event.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                                {isSelected && (
                                                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400 flex-shrink-0">✓</span>
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Logo Preview */}
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-neutral-50/50 dark:bg-neutral-900/50">
                    <p className="text-xs font-semibold text-neutral-500 mb-4 uppercase tracking-wider">Preview da Logo</p>
                    {imageUrl ? (
                        <div className="relative group p-8 bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700">
                            <img
                                src={imageUrl}
                                alt="Preview"
                                className="max-h-32 object-contain transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Logo+Invalida')}
                            />
                        </div>
                    ) : (
                        <div className="w-32 h-32 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center text-neutral-400">
                            <span className="text-3xl">🖼️</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2.5 rounded-xl font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary px-8 py-2.5 rounded-xl flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Salvando...
                        </>
                    ) : (
                        partner ? 'Atualizar Parceria' : 'Salvar Parceria'
                    )}
                </button>
            </div>
        </form>
    );
};

export default PartnerForm;
