import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import type { Article } from '../../models/Article';

interface ArticleFormProps {
    article?: Article;
    onSuccess: () => void;
    onCancel: () => void;
}

const ArticleForm: React.FC<ArticleFormProps> = ({ article, onSuccess, onCancel }) => {
    const [title, setTitle] = useState(article?.title || '');
    const [description, setDescription] = useState(article?.description || '');
    const [content, setContent] = useState(article?.content || '');
    const [images, setImages] = useState<string[]>(article?.images || ['']);
    const [references, setReferences] = useState<string[]>(article?.references || ['']);
    const [tagsInput, setTagsInput] = useState(article?.tags?.join(', ') || '');
    const [isPublished, setIsPublished] = useState(article?.isPublished !== false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

    // Author selection state
    const [membersList, setMembersList] = useState<any[]>([]);
    const [authorType, setAuthorType] = useState<'member' | 'manual'>(article?.authorMember?.id ? 'member' : 'manual');
    const [authorId, setAuthorId] = useState<number | null>(article?.authorMember?.id || null);
    const [authorName, setAuthorName] = useState<string>(article?.authorName || '');

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await apiService.getMembers();
                if (res.success && Array.isArray(res.data)) {
                    const sorted = [...res.data].sort((a, b) => a.name.localeCompare(b.name));
                    setMembersList(sorted);
                }
            } catch (err) {
                console.error('Error fetching members in ArticleForm:', err);
            }
        };
        fetchMembers();
    }, []);

    const handleImageChange = (index: number, value: string) => {
        const newImages = [...images];
        newImages[index] = value;
        setImages(newImages);
    };

    const addImageField = () => {
        if (images.length < 5) {
            setImages([...images, '']);
        }
    };

    const removeImageField = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    const handleReferenceChange = (index: number, value: string) => {
        const newRefs = [...references];
        newRefs[index] = value;
        setReferences(newRefs);
    };

    const addReferenceField = () => {
        if (references.length < 10) {
            setReferences([...references, '']);
        }
    };

    const removeReferenceField = (index: number) => {
        const newRefs = references.filter((_, i) => i !== index);
        setReferences(newRefs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const filteredImages = images.filter(img => img.trim() !== '');
        const filteredRefs = references.filter(ref => ref.trim() !== '');
        const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');

        if (filteredImages.length > 5) {
            setError('Máximo de 5 imagens por artigo/newsletter.');
            setLoading(false);
            return;
        }

        const data = {
            title,
            description,
            content,
            images: filteredImages,
            references: filteredRefs,
            tags: tagsArray,
            isPublished,
            authorId: authorType === 'member' ? (authorId ? Number(authorId) : null) : null,
            authorName: authorType === 'manual' ? authorName : null
        };

        try {
            if (article) {
                await apiService.updateArticle(article.id, data);
            } else {
                await apiService.createArticle(data);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao salvar artigo');
        } finally {
            setLoading(false);
        }
    };

    const renderPreview = () => {
        const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');
        const mainImage = images.find(img => img.trim() !== '') || 'https://via.placeholder.com/800x400?text=Sem+Imagem';
        const filteredRefs = references.filter(ref => ref.trim() !== '');

        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="relative group overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <img src={mainImage} alt={title} className="w-full h-64 object-cover" />
                    <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isPublished ? 'bg-success-500 text-white' : 'bg-neutral-500 text-white'}`}>
                            {isPublished ? 'Publicado' : 'Rascunho'}
                        </span>
                    </div>
                    <div className="p-8">
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tagsArray.map((tag, i) => (
                                <span key={i} className="text-[10px] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        {/* Realistic Preview Author Info */}
                        <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                            <span>Por: <span className="text-primary-600 dark:text-primary-400">{
                                authorType === 'member' 
                                    ? (membersList.find(m => m.id === Number(authorId))?.name || 'Membro LIAO') 
                                    : (authorName || 'Autor não especificado')
                            }</span></span>
                            {authorType === 'member' && authorId && (
                                <span className="px-1.5 py-0.5 text-[9px] bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full font-bold uppercase tracking-wider">Membro</span>
                            )}
                        </div>
                        <h3 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-4 leading-tight">
                            {title || 'Título da sua Publicação'}
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-lg mb-6 italic border-l-4 border-primary-500 pl-4">
                            {description || 'O resumo aparecerá aqui para dar um contexto rápido aos leitores...'}
                        </p>
                        <div className="prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-300 whitespace-pre-wrap leading-loose">
                            {content || 'O conteúdo completo será exibido aqui. Use este espaço para contar detalhes da sua novidade.'}
                        </div>
                        
                        {images.filter(img => img.trim() !== '').length > 1 && (
                            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.filter(img => img.trim() !== '').map((url, i) => (
                                    <img key={i} src={url} alt={`Gallery ${i}`} className="w-full h-24 object-cover rounded-lg shadow-sm hover:scale-105 transition-transform cursor-pointer" />
                                ))}
                            </div>
                        )}

                        {filteredRefs.length > 0 && (
                            <div className="mt-10 pt-8 border-t dark:border-neutral-800">
                                <h4 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                    Referências Acadêmicas e Fontes
                                </h4>
                                <ul className="space-y-2">
                                    {filteredRefs.map((ref, i) => (
                                        <li key={i} className="text-sm text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
                                            <span className="text-primary-500 font-bold flex-shrink-0">•</span>
                                            {ref.startsWith('http') ? (
                                                <a href={ref} target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 underline decoration-primary-500/30 transition-colors break-words overflow-hidden">
                                                    {ref}
                                                </a>
                                            ) : (
                                                <span className="leading-relaxed">{ref}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                        {article ? 'Refinar Publicação' : 'Criar Nova História'}
                    </h2>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        Crie conteúdos impactantes para a comunidade do LIAO.
                    </p>
                </div>
                
                <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border dark:border-neutral-700">
                    <button 
                        onClick={() => setActiveTab('edit')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'edit' ? 'bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'}`}
                    >
                        Editor
                    </button>
                    <button 
                        onClick={() => setActiveTab('preview')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'preview' ? 'bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'}`}
                    >
                        Prévia Realista
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-xl text-danger-700 dark:text-danger-400 flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                </div>
            )}

            {activeTab === 'edit' ? (
                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 border dark:border-neutral-800 animate-in slide-in-from-bottom-2 duration-300">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Main Content Areas */}
                            <div className="lg:col-span-8 space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Título da Publicação</label>
                                        <span className={`text-[10px] font-bold ${title.length > 90 ? 'text-danger-500' : 'text-neutral-400'}`}>{title.length}/100</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                                        required
                                        placeholder="Digite um título cativante..."
                                        className="input-field w-full text-lg font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Descrição Curta (Resumo)</label>
                                        <span className={`text-[10px] font-bold ${description.length > 230 ? 'text-danger-500' : 'text-neutral-400'}`}>{description.length}/250</span>
                                    </div>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value.slice(0, 250))}
                                        rows={2}
                                        className="input-field w-full italic"
                                        placeholder="Este texto aparecerá nos cards da Newsletter..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block">Corpo do Artigo / Detalhes</label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        required
                                        rows={10}
                                        className="input-field w-full leading-relaxed"
                                        placeholder="Conte sua história com riqueza de detalhes..."
                                    />
                                </div>

                                {/* REFERENCES SECTION (Moved to Main for better space) */}
                                <div className="pt-6 border-t dark:border-neutral-800 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Referências Acadêmicas e Fontes</label>
                                        <span className="text-[10px] font-bold text-neutral-400">{references.length}/10</span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        {references.map((ref, index) => (
                                            <div key={index} className="flex gap-2 group">
                                                <input
                                                    type="text"
                                                    value={ref}
                                                    onChange={(e) => handleReferenceChange(index, e.target.value)}
                                                    placeholder="Link ou nome do autor/artigo..."
                                                    className="input-field flex-1 text-sm"
                                                />
                                                {references.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeReferenceField(index)}
                                                        className="p-2 text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {references.length < 10 && (
                                        <button
                                            type="button"
                                            onClick={addReferenceField}
                                            className="py-2 px-4 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-400 hover:border-primary-500 hover:text-primary-500 transition-all flex items-center gap-2 text-xs font-bold"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            Adicionar Referência
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Sidebar / Metadata */}
                            <div className="lg:col-span-4 space-y-8">
                                <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-2xl border dark:border-neutral-700 space-y-6">
                                    <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Metadados e Status
                                    </h4>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">Tags Relacionadas</label>
                                        <input
                                            type="text"
                                            value={tagsInput}
                                            onChange={(e) => setTagsInput(e.target.value)}
                                            placeholder="Separadas por vírgula..."
                                            className="input-field w-full text-xs"
                                        />
                                    </div>

                                    {/* Author Selection Section */}
                                    <div className="space-y-3 pt-4 border-t dark:border-neutral-800">
                                        <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest block">Autor do Artigo</label>
                                        
                                        <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg border dark:border-neutral-700 text-xs">
                                            <button
                                                type="button"
                                                onClick={() => setAuthorType('member')}
                                                className={`flex-1 py-1.5 rounded-md font-bold transition-all ${authorType === 'member' ? 'bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-sm border dark:border-neutral-600' : 'text-neutral-500 dark:text-neutral-400'}`}
                                            >
                                                Membro LIAO
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAuthorType('manual')}
                                                className={`flex-1 py-1.5 rounded-md font-bold transition-all ${authorType === 'manual' ? 'bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-sm border dark:border-neutral-600' : 'text-neutral-500 dark:text-neutral-400'}`}
                                            >
                                                Nome Manual
                                            </button>
                                        </div>

                                        {authorType === 'member' ? (
                                            <div className="space-y-1">
                                                <select
                                                    value={authorId || ''}
                                                    onChange={(e) => setAuthorId(e.target.value ? Number(e.target.value) : null)}
                                                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-xs transition-colors"
                                                >
                                                    <option value="">Selecione um membro...</option>
                                                    {membersList.map((m) => (
                                                        <option key={m.id} value={m.id}>
                                                            {m.name} ({m.role})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <input
                                                    type="text"
                                                    value={authorName}
                                                    onChange={(e) => setAuthorName(e.target.value)}
                                                    placeholder="Nome do autor..."
                                                    className="input-field w-full text-xs"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 rounded-lg border dark:border-neutral-700">
                                        <label htmlFor="isPublished" className="text-sm font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer">Visibilidade</label>
                                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                            <input 
                                                type="checkbox" 
                                                id="isPublished"
                                                checked={isPublished}
                                                onChange={(e) => setIsPublished(e.target.checked)}
                                                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                            />
                                            <label htmlFor="isPublished" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${isPublished ? 'bg-success-500' : 'bg-neutral-300'}`}></label>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-neutral-500 italic">
                                        {isPublished ? 'Esta publicação ficará visível imediatamente.' : 'Salvo como rascunho (invisível ao público).'}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Imagens (URLs)</label>
                                        <span className="text-[10px] font-bold text-neutral-400">{images.length}/5</span>
                                    </div>

                                    <div className="space-y-3">
                                        {images.map((img, index) => (
                                            <div key={index} className="flex gap-2 group">
                                                <input
                                                    type="url"
                                                    value={img}
                                                    onChange={(e) => handleImageChange(index, e.target.value)}
                                                    placeholder="URL da imagem..."
                                                    className="input-field flex-1 text-xs"
                                                />
                                                {images.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImageField(index)}
                                                        className="p-2 text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        {images.length < 5 && (
                                            <button
                                                type="button"
                                                onClick={addImageField}
                                                className="w-full py-2 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-400 hover:border-primary-500 hover:text-primary-500 transition-all flex items-center justify-center gap-2 text-xs font-bold"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                Adicionar URL de Imagem
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t dark:border-neutral-800">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-8 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-sm font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                            >
                                Descartar Alterações
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 rounded-xl bg-primary-600 text-white text-sm font-extrabold shadow-lg hover:bg-primary-700 transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Sincronizando...
                                    </div>
                                ) : 'Finalizar e Salvar'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="pb-12">
                   {renderPreview()}
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .toggle-checkbox:checked {
                    right: 0;
                    border-color: #10b981;
                }
                .toggle-checkbox:checked + .toggle-label {
                    background-color: #10b981;
                }
                .toggle-checkbox {
                    right: 14px;
                    transition: all 0.2s;
                    border: 1px solid #d1d5db;
                }
            `}} />
        </div>
    );
};

export default ArticleForm;
