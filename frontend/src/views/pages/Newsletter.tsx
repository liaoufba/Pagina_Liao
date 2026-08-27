import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import type { Article } from '../../models/Article';
import CollectionLayout from '../layouts/CollectionLayout';
import ArticleCard from '../../components/domain/ArticleCard';

const Newsletter: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await apiService.getArticles();
                const data = (res.success && Array.isArray(res.data)) ? res.data : [];
                setArticles(data);
            } catch (error) {
                console.error('Error fetching articles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600"></div>
            </div>
        );
    }

    return (
        <CollectionLayout
            title="Boletim e Artigos"
            subtitle="Fique por dentro das últimas notícias, tutoriais e publicações da LIAO."
            renderControls={() => (
                <div className="w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Buscar artigos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm placeholder-neutral-500 dark:placeholder-neutral-400 transition-colors"
                    />
                </div>
            )}
        >
            {(viewMode) => (
                <>
                    {filteredArticles.map((article) => (
                        <ArticleCard
                            key={article.id}
                            article={article}
                            viewMode={viewMode}
                        />
                    ))}

                    {filteredArticles.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                                {searchTerm ? 'Nenhum resultado encontrado.' : 'Nenhuma notícia publicada ainda.'}
                            </p>
                        </div>
                    )}
                </>
            )}
        </CollectionLayout>
    );
};

export default Newsletter;
