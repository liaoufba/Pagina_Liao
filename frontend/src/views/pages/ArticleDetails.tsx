import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import type { Article } from '../../models/Article';
import MemberModal from '../../components/ui/MemberModal';
import { FaHeart, FaRegHeart, FaShareAlt } from 'react-icons/fa';

const ArticleDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hasLiked, setHasLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!id) return;
            try {
                const res = await apiService.getArticles();
                const data = Array.isArray(res.data) ? res.data : [];
                const found = data.find((a: Article) => a.id === Number(id));
                setArticle(found || null);
                if (found) {
                    setLikesCount(found.likes || 0);
                    setHasLiked(localStorage.getItem(`liao_liked_${found.id}`) === 'true');
                }
            } catch (error) {
                console.error('Error fetching article:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id]);

    const handleLike = async () => {
        if (!article) return;
        const newAction = hasLiked ? 'unlike' : 'like';
        
        setHasLiked(!hasLiked);
        setLikesCount(prev => prev + (newAction === 'like' ? 1 : -1));
        
        try {
            const res = (await apiService.likeArticle(article.id, newAction)) as any;
            if (res.success && res.data) {
                setLikesCount(res.data.likes || 0);
            }
            if (newAction === 'like') {
                localStorage.setItem(`liao_liked_${article.id}`, 'true');
            } else {
                localStorage.removeItem(`liao_liked_${article.id}`);
            }
        } catch (err) {
            console.error('Error toggling like:', err);
            setHasLiked(hasLiked);
            setLikesCount(prev => prev + (newAction === 'like' ? -1 : 1));
        }
    };

    const handleShare = () => {
        if (!article) return;
        const url = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.description || '',
                url: url
            }).catch(err => console.log('Error sharing:', err));
        } else {
            navigator.clipboard.writeText(url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(err => console.error('Failed to copy link:', err));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600"></div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">
                <h2 className="text-2xl font-bold mb-4">Artigo não encontrado 😕</h2>
                <button
                    onClick={() => navigate('/newsletter')}
                    className="text-primary-600 hover:text-primary-800 font-medium hover:underline"
                >
                    &larr; Voltar para Newsletter
                </button>
            </div>
        );
    }

    return (
        <>
        <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors duration-300">
            {/* Hero Section / Banner */}
            <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-64 md:h-[400px] relative overflow-hidden">
                {article.images && article.images.length > 0 ? (
                    <img
                        src={article.images[0]}
                        alt={article.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-950 via-neutral-950 to-black">
                        <span className="text-white opacity-5 text-8xl font-black tracking-tighter">LIAO</span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <article className="max-w-4xl mx-auto px-6 pt-8 md:pt-12 page-padding-bottom">
                {/* Article Header */}
                <div className="mb-10 pb-8 border-b border-neutral-100 dark:border-neutral-800">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[10px] font-bold rounded-full uppercase tracking-widest border border-primary-100 dark:border-primary-900/50">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-5xl font-extrabold text-neutral-900 dark:text-white leading-tight mb-6 tracking-tight">
                        {article.title}
                    </h1>

                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-neutral-500 dark:text-neutral-400 text-sm font-semibold">
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {new Date(article.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                        
                        {(article.authorMember || article.authorName) && (
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                                <span>Por: {article.authorMember ? (
                                    <button
                                        onClick={() => {
                                            setSelectedMember(article.authorMember);
                                            setIsModalOpen(true);
                                        }}
                                        className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 hover:underline transition-colors focus:outline-none"
                                    >
                                        {article.authorMember.name}
                                    </button>
                                ) : (
                                    <span className="font-bold text-neutral-800 dark:text-white">{article.authorName}</span>
                                )}</span>
                            </span>
                        )}
                    </div>
                </div>
                {/* Intro / Description if exists */}
                {article.description && (
                    <div className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 leading-relaxed font-light mb-16 border-l-4 border-primary-500 pl-8 italic">
                        {article.description}
                    </div>
                )}

                {/* Main Content */}
                <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-300 whitespace-pre-wrap leading-loose mb-20">
                    {article.content}
                </div>

                {/* Engage Bar (Like & Share) */}
                <div className="flex items-center justify-center gap-6 mb-16 py-6 border-t border-b border-neutral-100 dark:border-neutral-800">
                    {/* Like Button */}
                    <button
                        onClick={handleLike}
                        className={`
                            flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 transform active:scale-95 group focus:outline-none shadow-sm cursor-pointer
                            ${hasLiked 
                                ? 'bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800 text-danger-600 dark:text-danger-400' 
                                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-danger-600 dark:text-neutral-400 dark:hover:text-danger-400 hover:border-danger-200 dark:hover:border-danger-800/50'}
                        `}
                    >
                        {hasLiked ? (
                            <FaHeart size={18} className="text-danger-500 dark:text-danger-400" />
                        ) : (
                            <FaRegHeart size={18} className="group-hover:scale-110 transition-transform" />
                        )}
                        <span className="font-extrabold text-sm tracking-wide">{likesCount}</span>
                        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
                            {hasLiked ? 'Curtido' : 'Curtir'}
                        </span>
                    </button>

                    {/* Share Button */}
                    <div className="relative">
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 hover:border-primary-200 dark:hover:border-primary-900/50 transition-all duration-300 transform active:scale-95 group focus:outline-none shadow-sm cursor-pointer"
                        >
                            <FaShareAlt size={16} className="group-hover:rotate-12 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-wider">Compartilhar</span>
                        </button>
                        {copied && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-1.5 bg-neutral-900 dark:bg-neutral-800 text-white text-xs font-extrabold rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300 z-30 pointer-events-none whitespace-nowrap border border-neutral-800 dark:border-neutral-700">
                                Link copiado com sucesso! 🔗
                            </div>
                        )}
                    </div>
                </div>

                {/* Author Profile Footer */}
                {(article.authorMember || article.authorName) && (
                    <div className="mb-16 p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border dark:border-neutral-800 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        {article.authorMember ? (
                            <>
                                <img
                                    src={article.authorMember.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.authorMember.name)}&background=random`}
                                    alt={article.authorMember.name}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-primary-500 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => {
                                        setSelectedMember(article.authorMember);
                                        setIsModalOpen(true);
                                    }}
                                />
                                <div className="flex-1 text-center sm:text-left">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">Autor</span>
                                    <h4 
                                        className="text-lg font-bold text-neutral-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-colors"
                                        onClick={() => {
                                            setSelectedMember(article.authorMember);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        {article.authorMember.name}
                                    </h4>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 mb-2">{article.authorMember.role === 'member' ? 'Membro' : article.authorMember.role}</p>
                                    {article.authorMember.bio && (
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed line-clamp-2">{article.authorMember.bio}</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 text-center sm:text-left">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Autor</span>
                                <h4 className="text-lg font-bold text-neutral-900 dark:text-white mt-1">{article.authorName}</h4>
                            </div>
                        )}
                    </div>
                )}

                {/* References Section */}
                {article.references && article.references.length > 0 && (
                    <div className="mt-16 py-10 border-t dark:border-neutral-800">
                        <h3 className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                            Referências Acadêmicas e Fontes
                        </h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {article.references.map((ref, i) => (
                                <li key={i} className="flex items-start gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border dark:border-neutral-800 group hover:border-primary-500/50 transition-all">
                                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-neutral-700 shadow-sm text-primary-600 dark:text-primary-400 font-bold text-xs border dark:border-neutral-600">
                                        {i + 1}
                                    </span>
                                    {ref.startsWith('http') ? (
                                        <a href={ref} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 break-words transition-colors underline decoration-neutral-300 dark:decoration-neutral-700 hover:decoration-primary-500">
                                            {ref}
                                        </a>
                                    ) : (
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{ref}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Gallery if more images */}
                {article.images && article.images.length > 1 && (
                    <div className="mt-10 py-12 border-t dark:border-neutral-800">
                        <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-8 tracking-tight">Galeria de Imagens</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {article.images.slice(1).map((img, idx) => (
                                <div key={idx} className="group relative overflow-hidden rounded-2xl shadow-lg aspect-video bg-neutral-100 dark:bg-neutral-800 cursor-pointer">
                                    <img
                                        src={img}
                                        alt={`Galeria ${idx}`}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Back Button Footer */}
                <div className="mt-20 pt-10 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                    <button
                        onClick={() => navigate('/newsletter')}
                        className="flex items-center gap-3 px-6 py-3 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-primary-600 hover:text-white font-bold transition-all duration-300 transform hover:-translate-x-2 shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Voltar para Newsletter
                    </button>
                </div>
            </article>
        </div>

        <MemberModal
            member={selectedMember}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
        />
        </>
    );
};

export default ArticleDetails;
