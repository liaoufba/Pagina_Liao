import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';

interface AuditLog {
    id: number;
    userId: number;
    userName: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    resource: string;
    resourceId: number | null;
    details: string | null;
    createdAt: string;
    user?: { id: number; name: string; email: string; role: string };
}

interface AuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    resource: string;
    resourceLabel: string;
}

const ACTION_COLORS: Record<string, string> = {
    CREATE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    DELETE: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
};

const ACTION_LABELS: Record<string, string> = {
    CREATE: 'Criou',
    UPDATE: 'Editou',
    DELETE: 'Excluiu',
};

const AuditModal: React.FC<AuditModalProps> = ({ isOpen, onClose, resource, resourceLabel }) => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [total, setTotal] = useState(0);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiService.getAuditLogs(resource, startDate || undefined, endDate || undefined) as any;
            setLogs(res.data || []);
            setTotal(res.pagination?.total || 0);
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [resource, startDate, endDate]);

    useEffect(() => {
        if (isOpen) {
            fetchLogs();
        }
    }, [isOpen, fetchLogs]);

    const parseDetails = (details: string | null): string => {
        if (!details) return '—';
        try {
            const obj = JSON.parse(details);
            return Object.entries(obj)
                .map(([k, v]) => `${k}: ${v}`)
                .join(' • ');
        } catch {
            return details;
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xl">
                            🕐
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Histórico de Alterações</h2>
                            <p className="text-sm text-neutral-500">Seção: <span className="font-semibold text-primary-600 dark:text-primary-400">{resourceLabel}</span> — {total} registro{total !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Filtrar por data:</span>
                    <div className="flex items-center gap-2 flex-1">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="input-field text-sm py-1.5 px-3 flex-1 min-w-0"
                            placeholder="De"
                        />
                        <span className="text-neutral-400 text-sm">→</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="input-field text-sm py-1.5 px-3 flex-1 min-w-0"
                            placeholder="Até"
                        />
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="btn-primary px-4 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-2 flex-shrink-0"
                    >
                        {loading ? (
                            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                        ) : '🔍'}
                        Filtrar
                    </button>
                    {(startDate || endDate) && (
                        <button
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                            className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 underline"
                        >
                            Limpar
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                                <p className="text-sm text-neutral-500">Carregando histórico...</p>
                            </div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <div className="text-4xl mb-3">📋</div>
                                <p className="text-neutral-500 font-medium">Nenhum registro encontrado</p>
                                <p className="text-xs text-neutral-400 mt-1">
                                    {startDate || endDate ? 'Tente ajustar os filtros de data.' : 'As ações serão registradas aqui automaticamente.'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-neutral-50 dark:bg-neutral-800/80 backdrop-blur-sm z-10">
                                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Admin</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Ação</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Detalhes</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Data / Hora</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-6 py-3">
                                            <div>
                                                <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                                                    {log.user?.name || log.userName}
                                                </p>
                                                <p className="text-xs text-neutral-400">{log.user?.email || log.userName}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${ACTION_COLORS[log.action] || ''}`}>
                                                {ACTION_LABELS[log.action] || log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 max-w-xs">
                                            <span className="truncate block" title={parseDetails(log.details)}>
                                                {parseDetails(log.details)}
                                            </span>
                                            {log.resourceId && (
                                                <span className="text-xs text-neutral-400">ID #{log.resourceId}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-right text-neutral-500 whitespace-nowrap">
                                            <div>
                                                <p className="font-medium text-neutral-700 dark:text-neutral-300">
                                                    {new Date(log.createdAt).toLocaleDateString('pt-BR')}
                                                </p>
                                                <p className="text-xs text-neutral-400">
                                                    {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <p className="text-xs text-neutral-400">
                        Mostrando {logs.length} de {total} registro{total !== 1 ? 's' : ''}
                    </p>
                    <button onClick={onClose} className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 font-medium">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuditModal;
