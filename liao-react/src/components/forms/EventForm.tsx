import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import type { EventApi } from '../../models/Event';
import type { Partner } from '../../models/Partner';
import EventContentManager from './EventContentManager';

interface EventFormProps {
    event?: EventApi | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const extractMaterialsFromDescription = (description?: string | null) => {
    if (!description) return {};
    try {
        const parsed = JSON.parse(description);
        const materials = parsed?.materials;
        if (!materials || typeof materials !== 'object') return {};
        return {
            slidesUrl: typeof materials.slidesUrl === 'string' ? materials.slidesUrl : '',
            recordingUrl: typeof materials.recordingUrl === 'string' ? materials.recordingUrl : '',
            photosUrl: typeof materials.photosUrl === 'string' ? materials.photosUrl : '',
            certificatesUrl: typeof materials.certificatesUrl === 'string' ? materials.certificatesUrl : ''
        };
    } catch {
        return {};
    }
};

const mergeMaterialsIntoDescription = (
    description: string,
    materials: {
        slidesUrl: string;
        recordingUrl: string;
        photosUrl: string;
        certificatesUrl: string;
    }
) => {
    const normalizedMaterials = {
        slidesUrl: materials.slidesUrl.trim(),
        recordingUrl: materials.recordingUrl.trim(),
        photosUrl: materials.photosUrl.trim(),
        certificatesUrl: materials.certificatesUrl.trim()
    };
    const hasMaterials = Object.values(normalizedMaterials).some(Boolean);

    try {
        const parsed = JSON.parse(description);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('invalid description json shape');
        }
        const nextDescription = { ...parsed } as Record<string, unknown>;
        if (hasMaterials) {
            nextDescription.materials = normalizedMaterials;
        } else {
            delete nextDescription.materials;
        }
        return JSON.stringify(nextDescription);
    } catch {
        if (!hasMaterials) return description;
        return JSON.stringify({
            presentation: {
                enabled: Boolean(description.trim()),
                content: description
            },
            materials: normalizedMaterials
        });
    }
};

const EventForm: React.FC<EventFormProps> = ({ event, onSuccess, onCancel }) => {
    const materialsFromDescription = extractMaterialsFromDescription(event?.description);
    const [formData, setFormData] = useState({
        title: event?.title || '',
        slug: event?.slug || '',
        description: event?.description || '',
        coverImage: event?.coverImage || '',
        date: event?.date ? new Date(event.date as string).toISOString().split('T')[0] : '',
        location: event?.location || '',
        speakers: (event?.speakers as any[])?.map(s => typeof s === 'string' ? { name: s } : s) || [],
        gallery: (event?.gallery as string[]) || [],
        highlights: (event?.highlights as string[]) || [],
        partners: (event?.partners as Partner[])?.map(p => p.id) || [] as number[],
        locations: event?.location ? event.location.split(' | ') : [],
        subscribe: event?.subscribe || '',
        themeMode: (event as any)?.themeMode || 'dark',
        fontClass: (event as any)?.fontClass || 'font-sans',
        borderRadius: (event as any)?.borderRadius || 'round',
        palette: Array.isArray((event as any)?.palette) && (event as any)?.palette.length > 0
            ? (event as any).palette
            : ['#6366f1', '#a855f7', '#ec4899'],
        materials: {
            slidesUrl: (event as any)?.materials?.slidesUrl || materialsFromDescription.slidesUrl || '',
            recordingUrl: (event as any)?.materials?.recordingUrl || materialsFromDescription.recordingUrl || '',
            photosUrl: (event as any)?.materials?.photosUrl || materialsFromDescription.photosUrl || '',
            certificatesUrl: (event as any)?.materials?.certificatesUrl || materialsFromDescription.certificatesUrl || ''
        }
    });

    const [allPartners, setAllPartners] = useState<Partner[]>([]);
    const [newSpeaker, setNewSpeaker] = useState({ name: '', role: '', photo: '' });
    const [newLocation, setNewLocation] = useState('');
    const [newGalleryItem, setNewGalleryItem] = useState('');
    const [newHighlight, setNewHighlight] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const response = await apiService.getPartners();
                setAllPartners(response.data || []);
            } catch (error) {
                console.error('Error fetching partners for selection:', error);
            }
        };
        fetchPartners();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSubmit = {
                ...formData,
                location: formData.locations.join(' | '),
                description: mergeMaterialsIntoDescription(formData.description, formData.materials)
            };
            if (event && event.id !== undefined) {
                await apiService.updateEvent(event.id, dataToSubmit);
            } else {
                await apiService.createEvent(dataToSubmit);
            }
            onSuccess();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.error || 'Erro ao salvar evento');
        } finally {
            setLoading(false);
        }
    };

    const addSpeaker = () => {
        if (!newSpeaker.name.trim()) return;
        setFormData({ ...formData, speakers: [...formData.speakers, { ...newSpeaker }] });
        setNewSpeaker({ name: '', role: '', photo: '' });
    };

    const addItem = (field: 'gallery' | 'highlights', value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
        if (!value.trim()) return;
        setFormData({ ...formData, [field]: [...(formData[field] as any[]), value] });
        setter('');
    };

    const removeItem = (field: 'speakers' | 'gallery' | 'highlights', index: number) => {
        const newList = [...(formData[field] as any[])];
        newList.splice(index, 1);
        setFormData({ ...formData, [field]: newList });
    };

    const togglePartner = (partnerId: number) => {
        const currentPartners = [...formData.partners];
        const index = currentPartners.indexOf(partnerId);
        if (index > -1) {
            currentPartners.splice(index, 1);
        } else {
            currentPartners.push(partnerId);
        }
        setFormData({ ...formData, partners: currentPartners });
    };

    const handleContentChange = React.useCallback((content: string) => {
        setFormData(prev => {
            if (prev.description === content) return prev;
            return { ...prev, description: content };
        });
    }, []);

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-800 space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white border-b dark:border-neutral-800 pb-2">Informações Básicas</h3>
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Título do Evento</label>
                        <input
                            type="text"
                            required
                            className="input-field w-full"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Slug (URL amigável)</label>
                        <input
                            type="text"
                            required
                            placeholder="ex: workshop-ia-2024"
                            className="input-field w-full"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Data Início</label>
                            <input
                                type="date"
                                required
                                className="input-field w-full"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Locais do Evento (Máx: 5)</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder={formData.locations.length >= 5 ? "Limite de 5 atingido" : "Auditório, Online, etc."}
                                    className="input-field flex-1 disabled:opacity-50"
                                    value={newLocation}
                                    disabled={formData.locations.length >= 5}
                                    onChange={(e) => setNewLocation(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            if (newLocation.trim() && formData.locations.length < 5) {
                                                setFormData({ ...formData, locations: [...formData.locations, newLocation.trim()] });
                                                setNewLocation('');
                                            }
                                        }
                                    }}
                                />
                                <button 
                                    type="button" 
                                    disabled={formData.locations.length >= 5 || !newLocation.trim()}
                                    onClick={() => {
                                        if (newLocation.trim() && formData.locations.length < 5) {
                                            setFormData({ ...formData, locations: [...formData.locations, newLocation.trim()] });
                                            setNewLocation('');
                                        }
                                    }} 
                                    className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl font-bold hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors disabled:opacity-30"
                                >
                                    +
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.locations.map((loc, i) => (
                                    <span key={i} className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-3 py-1 rounded-lg text-sm flex items-center gap-2 border dark:border-neutral-700">
                                        {loc}
                                        <button type="button" onClick={() => {
                                            const newList = [...formData.locations];
                                            newList.splice(i, 1);
                                            setFormData({ ...formData, locations: newList });
                                        }} className="hover:text-danger-500 transition-colors">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">URL da Imagem de Capa</label>
                        <input
                            type="url"
                            required
                            className="input-field w-full"
                            value={formData.coverImage}
                            onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Link de Inscrição (Opcional)</label>
                        <input
                            type="url"
                            placeholder="https://exemplo.com/inscricao"
                            className="input-field w-full"
                            value={formData.subscribe}
                            onChange={(e) => setFormData({ ...formData, subscribe: e.target.value })}
                        />
                        <p className="text-[10px] text-neutral-500 mt-1">Habilita o botão "Realizar Inscrição" na página do evento.</p>
                    </div>
                    {/* Personalização Visual do Evento */}
                    <div className="pt-4 border-t dark:border-neutral-800 space-y-4">
                        <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Personalização Visual do Evento</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Tema da Página</label>
                                <select
                                    className="input-field w-full text-xs"
                                    value={formData.themeMode}
                                    onChange={(e) => setFormData({ ...formData, themeMode: e.target.value })}
                                >
                                    <option value="dark">Escuro (Dark Mode)</option>
                                    <option value="light">Claro (Light Mode)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Estilo de Bordas</label>
                                <select
                                    className="input-field w-full text-xs"
                                    value={formData.borderRadius}
                                    onChange={(e) => setFormData({ ...formData, borderRadius: e.target.value })}
                                >
                                    <option value="round">Arredondadas (1.5rem / 2rem)</option>
                                    <option value="squared">Retangulares (0px / Cantos Retos)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Estilo de Fonte / Tipografia</label>
                            <select
                                className="input-field w-full text-xs"
                                value={formData.fontClass}
                                onChange={(e) => setFormData({ ...formData, fontClass: e.target.value })}
                            >
                                <option value="font-sans">Padrão (Inter / Sans-serif)</option>
                                <option value="font-serif">Elegante (Playfair Display / Serif)</option>
                                <option value="font-mono">Código / Tech (JetBrains Mono)</option>
                                <option value="font-space">Moderno / Space (Space Grotesk)</option>
                                <option value="font-outfit">Contemporâneo (Outfit)</option>
                                <option value="font-clash">Destaque (Clash Display)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Paleta de Cores do Evento</label>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {[0, 1, 2].map((idx) => (
                                    <div key={idx} className="flex flex-col gap-1">
                                        <span className="text-[10px] text-neutral-500 font-medium">
                                            {idx === 0 ? 'Primária' : idx === 1 ? 'Secundária' : 'Terciária'}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="color"
                                                className="w-7 h-7 rounded cursor-pointer border border-neutral-300 dark:border-neutral-700 bg-transparent p-0 flex-shrink-0"
                                                value={formData.palette[idx] || '#6366f1'}
                                                onChange={(e) => {
                                                    const newPalette = [...formData.palette];
                                                    newPalette[idx] = e.target.value;
                                                    setFormData({ ...formData, palette: newPalette });
                                                }}
                                            />
                                            <input
                                                type="text"
                                                className="input-field text-xs font-mono w-full px-2 py-1"
                                                value={formData.palette[idx] || '#6366f1'}
                                                onChange={(e) => {
                                                    const newPalette = [...formData.palette];
                                                    newPalette[idx] = e.target.value;
                                                    setFormData({ ...formData, palette: newPalette });
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="flex items-center gap-2 pt-1">
                                <span className="text-[10px] text-neutral-500 font-medium">Prévia:</span>
                                <div 
                                    className="h-3.5 flex-1 rounded-full shadow-inner border border-neutral-200 dark:border-neutral-700"
                                    style={{
                                        background: `linear-gradient(to right, ${formData.palette[0] || '#6366f1'}, ${formData.palette[1] || '#a855f7'}, ${formData.palette[2] || '#ec4899'})`
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Materiais Pós-Evento */}
                    <div className="pt-4 border-t dark:border-neutral-800 space-y-3">
                        <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Materiais do Evento (Pós-Evento)</h4>
                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">URL da Gravação / Vídeo</label>
                            <input
                                type="url"
                                placeholder="https://youtube.com/watch?v=..."
                                className="input-field w-full text-xs"
                                value={formData.materials.recordingUrl}
                                onChange={(e) => setFormData({ ...formData, materials: { ...formData.materials, recordingUrl: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">URL dos Slides / Apresentação</label>
                            <input
                                type="url"
                                placeholder="https://drive.google.com/..."
                                className="input-field w-full text-xs"
                                value={formData.materials.slidesUrl}
                                onChange={(e) => setFormData({ ...formData, materials: { ...formData.materials, slidesUrl: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">URL do Álbum de Fotos Extra</label>
                            <input
                                type="url"
                                placeholder="https://photos.google.com/..."
                                className="input-field w-full text-xs"
                                value={formData.materials.photosUrl}
                                onChange={(e) => setFormData({ ...formData, materials: { ...formData.materials, photosUrl: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">URL de Emissão de Certificados</label>
                            <input
                                type="url"
                                placeholder="https://exemplo.com/certificados"
                                className="input-field w-full text-xs"
                                value={formData.materials.certificatesUrl}
                                onChange={(e) => setFormData({ ...formData, materials: { ...formData.materials, certificatesUrl: e.target.value } })}
                            />
                        </div>
                    </div>
                </div>

                {/* Description & Multi-fields */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white border-b dark:border-neutral-800 pb-2">Detalhes e Mídia</h3>
                    <EventContentManager 
                        initialContent={formData.description}
                        onChange={handleContentChange}
                    />

                    {/* Speakers */}
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Palestrantes</label>
                        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border dark:border-neutral-700 space-y-3 mb-4">
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    className="input-field text-sm"
                                    value={newSpeaker.name}
                                    onChange={(e) => setNewSpeaker({ ...newSpeaker, name: e.target.value })}
                                    placeholder="Nome do palestrante"
                                />
                                <input
                                    type="text"
                                    className="input-field text-sm"
                                    value={newSpeaker.role}
                                    onChange={(e) => setNewSpeaker({ ...newSpeaker, role: e.target.value })}
                                    placeholder="Cargo / Instituição"
                                />
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    className="input-field text-sm flex-1"
                                    value={newSpeaker.photo}
                                    onChange={(e) => setNewSpeaker({ ...newSpeaker, photo: e.target.value })}
                                    placeholder="URL da Foto de Perfil"
                                />
                                <button 
                                    type="button" 
                                    onClick={addSpeaker}
                                    disabled={!newSpeaker.name.trim()}
                                    className="px-6 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors disabled:opacity-50"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {formData.speakers.map((s, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white dark:bg-neutral-800 p-2 pr-4 rounded-xl border dark:border-neutral-700 shadow-sm transition-all hover:border-primary-500/50">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-700 border dark:border-neutral-600">
                                        {s.photo ? (
                                            <img src={s.photo} alt={s.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-neutral-400">
                                                {s.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">{s.name}</h4>
                                        <p className="text-[10px] text-neutral-500 truncate">{s.role || 'Convidado'}</p>
                                    </div>
                                    <button type="button" onClick={() => removeItem('speakers', i)} className="text-neutral-400 hover:text-danger-500 transition-colors">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Highlights */}
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Destaques (Bullet points)</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                className="input-field flex-1"
                                value={newHighlight}
                                onChange={(e) => setNewHighlight(e.target.value)}
                                placeholder="O que terá no evento?"
                            />
                            <button type="button" onClick={() => addItem('highlights', newHighlight, setNewHighlight)} className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl font-bold hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors">+</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.highlights.map((h, i) => (
                                <span key={i} className="bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300 px-3 py-1 rounded-lg text-sm flex items-center gap-2 border dark:border-success-800">
                                    {h}
                                    <button type="button" onClick={() => removeItem('highlights', i)} className="hover:text-danger-500 transition-colors">×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Gallery */}
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Galeria (Fotos Extras - URLs)</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="url"
                                className="input-field flex-1"
                                value={newGalleryItem}
                                onChange={(e) => setNewGalleryItem(e.target.value)}
                                placeholder="URL da foto"
                            />
                            <button type="button" onClick={() => addItem('gallery', newGalleryItem, setNewGalleryItem)} className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl font-bold hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors">+</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.gallery.map((img, i) => (
                                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                                    <img src={img} alt="Gallery item" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeItem('gallery', i)} className="absolute inset-0 bg-danger-500/80 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Partners Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Parceiros do Evento</label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border dark:border-neutral-800 rounded-xl">
                            {allPartners.length > 0 ? (
                                allPartners.map((partner) => (
                                    <div 
                                        key={partner.id} 
                                        onClick={() => togglePartner(partner.id)}
                                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors border ${
                                            formData.partners.includes(partner.id) 
                                                ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800' 
                                                : 'bg-white border-transparent hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800'
                                        }`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                            formData.partners.includes(partner.id) 
                                                ? 'bg-primary-600 border-primary-600' 
                                                : 'border-neutral-300 dark:border-neutral-700'
                                        }`}>
                                            {formData.partners.includes(partner.id) && (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <img src={partner.imageUrl} alt="" className="w-6 h-6 object-contain rounded" />
                                        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">{partner.name}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-neutral-500 col-span-2 py-2">Nenhum parceiro cadastrado.</p>
                            )}
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-2">Os parceiros selecionados aparecerão na página deste evento.</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t font-bold">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-8 py-3 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-12 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 disabled:opacity-50"
                >
                    {loading ? 'Salvando...' : event ? 'Atualizar Evento' : 'Criar Evento'}
                </button>
            </div>
        </form>
    );
};

export default EventForm;
