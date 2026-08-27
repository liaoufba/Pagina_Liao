import React, { useState } from 'react';

export interface ScheduleDay {
    id: string;
    label: string;
    date: string;
}

export interface ScheduleTableData {
    enabled: boolean;
    days: ScheduleDay[];
    hours: string[];
    data: Record<string, string>; // "hourIndex-dayId" -> activityName
}

interface ScheduleEditorProps {
    value: ScheduleTableData;
    onChange: (newValue: ScheduleTableData) => void;
}

const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ value, onChange }) => {
    const [newHour, setNewHour] = useState('');
    const [newDay, setNewDay] = useState({ label: '', date: '' });

    const addDay = () => {
        if (!newDay.label.trim()) return;
        const id = Date.now().toString();
        const updatedDays = [...value.days, { ...newDay, id }];
        onChange({ ...value, days: updatedDays });
        setNewDay({ label: '', date: '' });
    };

    const removeDay = (id: string) => {
        const updatedDays = value.days.filter(d => d.id !== id);
        const updatedData = { ...value.data };
        Object.keys(updatedData).forEach(key => {
            if (key.endsWith(`-${id}`)) delete updatedData[key];
        });
        onChange({ ...value, days: updatedDays, data: updatedData });
    };

    const addHour = () => {
        if (!newHour.trim()) return;
        // Don't auto-sort, just append so they can control order organically
        const updatedHours = [...value.hours, newHour];
        onChange({ ...value, hours: updatedHours });
        setNewHour('');
    };

    const removeHour = (index: number) => {
        const updatedHours = [...value.hours];
        updatedHours.splice(index, 1);
        const updatedData = { ...value.data };
        Object.keys(updatedData).forEach(key => {
            if (key.startsWith(`${index}-`)) delete updatedData[key];
        });
        // We can't re-index hours easily without breaking data references!
        // To fix this without complex re-mapping, we will actually just rebuild updatedData with new hour indices
        const newData: Record<string, string> = {};
        for (let h = 0; h < value.hours.length; h++) {
            if (h === index) continue;
            const newH = h < index ? h : h - 1;
            value.days.forEach(day => {
                const oldVal = value.data[`${h}-${day.id}`];
                if (oldVal) newData[`${newH}-${day.id}`] = oldVal;
            });
        }
        onChange({ ...value, hours: updatedHours, data: newData });
    };

    const handleCellChange = (hourIdx: number, dayId: string, content: string) => {
        const key = `${hourIdx}-${dayId}`;
        onChange({
            ...value,
            data: { ...value.data, [key]: content }
        });
    };

    return (
        <div className="space-y-4 p-4 border dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <input 
                        type="checkbox" 
                        checked={value.enabled} 
                        onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
                        className="w-5 h-5 rounded border-neutral-300 text-primary-600"
                    />
                    <h5 className="font-bold text-neutral-800 dark:text-neutral-200">Ativar Cronograma em Tabela</h5>
                </div>
            </div>

            {value.enabled && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm text-neutral-500 mb-4">Adicione colunas para os Dias e linhas para os Horários. O próprio Excel na sua tela.</p>
                    
                    <div className="overflow-x-auto border dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                                    <th className="p-3 border-b border-r dark:border-neutral-800 w-32 font-bold text-neutral-600 dark:text-neutral-300">
                                        Horários
                                    </th>
                                    {value.days.map((day) => (
                                        <th key={day.id} className="p-3 border-b border-r dark:border-neutral-800 group relative min-w-[200px]">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-neutral-800 dark:text-neutral-200">{day.label}</span>
                                                <span className="text-[10px] text-neutral-400">{day.date}</span>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => removeDay(day.id)}
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-danger-500 hover:text-danger-700 bg-white dark:bg-neutral-800 rounded-full p-1 border dark:border-neutral-700 shadow-sm"
                                            >
                                                Remover
                                            </button>
                                        </th>
                                    ))}
                                    {/* Action Header Column for New Day */}
                                    <th className="p-3 border-b dark:border-neutral-800 min-w-[200px] align-top bg-neutral-50/50 dark:bg-neutral-900/30">
                                        <div className="flex flex-col gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Dia (ex: Terça, Dia 01)" 
                                                className="input-field text-xs py-1.5 px-2"
                                                value={newDay.label}
                                                onChange={(e) => setNewDay({ ...newDay, label: e.target.value })}
                                            />
                                            <div className="flex gap-2">
                                                <input 
                                                    type="date" 
                                                    className="input-field text-xs py-1.5 px-2 flex-1"
                                                    value={newDay.date}
                                                    onChange={(e) => setNewDay({ ...newDay, date: e.target.value })}
                                                />
                                                <button type="button" onClick={addDay} className="px-3 py-1.5 bg-neutral-800 dark:bg-neutral-700 text-white text-xs rounded-md font-medium hover:bg-neutral-700 dark:hover:bg-neutral-600 transition">+ Coluna</button>
                                            </div>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {value.hours.map((hour, hIdx) => (
                                    <tr key={hIdx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                        <td className="p-3 border-b border-r dark:border-neutral-800 font-mono text-sm relative group bg-neutral-50/30 dark:bg-neutral-900/30 font-semibold align-top text-neutral-700 dark:text-neutral-300">
                                            {hour}
                                            <button 
                                                type="button" 
                                                onClick={() => removeHour(hIdx)}
                                                className="absolute left-1 top-3 opacity-0 group-hover:opacity-100 text-danger-500 hover:text-white bg-white hover:bg-danger-500 dark:bg-neutral-800 rounded-full w-5 h-5 flex items-center justify-center text-[10px] border dark:border-neutral-700 transition"
                                                title="Remover linha"
                                            >
                                                ✕
                                            </button>
                                        </td>
                                        {value.days.map((day) => {
                                            const key = `${hIdx}-${day.id}`;
                                            return (
                                                <td key={day.id} className="p-2 border-b border-r dark:border-neutral-800">
                                                    <textarea 
                                                        className="w-full p-2 text-sm bg-transparent border border-transparent hover:border-neutral-200 focus:border-primary-500 dark:hover:border-neutral-700 focus:ring-1 focus:ring-primary-500 rounded-lg resize-y transition min-h-[60px]"
                                                        placeholder="O que vai acontecer neste horário?"
                                                        value={value.data[key] || ''}
                                                        onChange={(e) => handleCellChange(hIdx, day.id, e.target.value)}
                                                    />
                                                </td>
                                            );
                                        })}
                                        {/* Empty cell ending the row */}
                                        <td className="border-b dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30"></td>
                                    </tr>
                                ))}
                                {/* Action Row for New Hour */}
                                <tr>
                                    <td className="p-3 border-b border-r dark:border-neutral-800 align-top bg-neutral-50/50 dark:bg-neutral-900/30">
                                        <div className="flex flex-col gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Ex: 09:00" 
                                                className="input-field text-xs py-1.5 px-2 font-mono"
                                                value={newHour}
                                                onChange={(e) => setNewHour(e.target.value)}
                                            />
                                            <button type="button" onClick={addHour} className="w-full py-1.5 bg-neutral-800 dark:bg-neutral-700 text-white text-xs rounded-md font-medium hover:bg-neutral-700 dark:hover:bg-neutral-600 transition">+ Linha</button>
                                        </div>
                                    </td>
                                    {/* Span empty cells below the days */}
                                    {value.days.map(d => (
                                        <td key={d.id} className="border-b border-r dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-center py-4 text-xs text-neutral-400">
                                            ↑ Preencha a linha aqui
                                        </td>
                                    ))}
                                    <td className="border-b dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleEditor;
