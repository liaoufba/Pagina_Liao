import React from 'react';
import type { Article } from '../../models/Article';
import MediaContentCard from './MediaContentCard';

export interface ArticleCardProps {
    article: Article;
    viewMode?: 'card' | 'list' | 'grid';
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, viewMode = 'card' }) => {
    const articleDate = new Date(article.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const coverImage = article.images && article.images.length > 0 ? article.images[0] : undefined;
    const tagSubtitle = article.tags && article.tags.length > 0 ? article.tags.slice(0, 3).join(' • ') : undefined;

    return (
        <MediaContentCard
            to={`/newsletter/${article.id}`}
            image={coverImage}
            imageAlt={article.title}
            title={article.title}
            subtitle={tagSubtitle}
            description={article.description || article.content}
            dateBadge={articleDate}
            actionLabel="Ler artigo"
            hoverOverlayText="Ver artigo"
            viewMode={viewMode}
        />
    );
};

export default ArticleCard;
