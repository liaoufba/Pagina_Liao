import React from 'react';
import { IoClose, IoCalendarOutline, IoTimeOutline } from 'react-icons/io5';
import type { ScheduleTableData, ScheduleDay } from '../forms/ScheduleEditor';

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    schedule: ScheduleTableData;
    eventTitle: string;
    palette: string[];
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, schedule, eventTitle, palette }) => {
    if (!isOpen) return null;

    const primaryColor = palette[0] || '#6366f1';

    const handleAddToCalendar = (day: ScheduleDay) => {
        const title = encodeURIComponent(`${eventTitle} - ${day.label}`);
        // We calculate a generic range if hours aren't specific dates
        const dateStr = day.date || new Date().toISOString().split('T')[0];
        const start = `${dateStr.replace(/-/g, '')}T090000Z`;
        const end = `${dateStr.replace(/-/g, '')}T180000Z`;
        
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}`;
        window.open(url, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md" onClick={onClose}></div>
            
            <div 
                className="relative w-full max-w-6xl max-h-[90vh] bg-neutral-900 border border-white/10 overflow-hidden flex flex-col shadow-2xl"
                style={{ borderRadius: 'var(--event-radius-lg)' }}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                            <IoCalendarOutline className="text-primary-400" style={{ color: primaryColor }} />
                            Cronograma Detalhado
                        </h2>
                        <p className="text-neutral-400 text-sm mt-1">{eventTitle}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition-colors"
                    >
                        <IoClose size={32} />
                    </button>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-auto p-6">
                    {/* Desktop View (Grid) */}
                    <div className="hidden md:block min-w-[800px]">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-4 text-left text-neutral-500 font-mono text-xs uppercase tracking-widest border-b border-white/5 sticky left-0 bg-neutral-900 z-10 w-24">
                                        Horário
                                    </th>
                                    {schedule.days.map((day) => (
                                        <th key={day.id} className="p-4 border-b border-white/5 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-lg font-bold text-white uppercase tracking-tight">{day.label}</span>
                                                <button 
                                                    onClick={() => handleAddToCalendar(day)}
                                                    className="text-[10px] px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-neutral-400 hover:text-white transition-all uppercase font-bold tracking-tighter"
                                                >
                                                    + Google Agenda
                                                </button>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.hours.map((hour, hIdx) => (
                                    <tr key={hIdx} className="group">
                                        <td className="p-4 border-b border-white/5 font-mono text-sm text-neutral-400 sticky left-0 bg-neutral-900 z-10 group-hover:text-white transition-colors">
                                            <div className="flex items-center gap-2">
                                                <IoTimeOutline size={14} className="opacity-50" />
                                                {hour}
                                            </div>
                                        </td>
                                        {schedule.days.map((day) => {
                                            const content = schedule.data[`${hIdx}-${day.id}`];
                                            return (
                                                <td key={day.id} className="p-4 border-b border-white/5 border-l border-white/5 align-top group-hover:bg-white/[0.02] transition-colors">
                                                    {content ? (
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-semibold text-white leading-snug">
                                                                {content}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-neutral-700">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View (List) */}
                    <div className="md:hidden space-y-12">
                        {schedule.days.map((day) => (
                            <div key={day.id} className="space-y-4">
                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{day.label}</h3>
                                    <button 
                                        onClick={() => handleAddToCalendar(day)}
                                        className="text-[10px] p-2 bg-white/5 rounded-lg"
                                        style={{ color: primaryColor }}
                                    >
                                        Add Agenda
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {schedule.hours.map((hour, hIdx) => {
                                        const content = schedule.data[`${hIdx}-${day.id}`];
                                        if (!content) return null;
                                        return (
                                            <div key={hIdx} className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                                <div className="font-mono text-xs shrink-0 w-12 pt-1" style={{ color: primaryColor }}>
                                                    {hour}
                                                </div>
                                                <div className="text-sm font-medium text-neutral-200">
                                                    {content}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="p-6 bg-white/[0.02] text-center border-t border-white/5">
                    <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">
                        LIAO • Liga Acadêmica de Inteligência Artificial e Otimização
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ScheduleModal;
