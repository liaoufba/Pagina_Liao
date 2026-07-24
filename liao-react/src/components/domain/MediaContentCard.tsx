import React from 'react';
import { Link } from 'react-router-dom';

/**
 * MediaContentCard is a specialized domain card component designed for publishable
 * content items with cover media assets (such as Events, Projects, and Articles).
 * 
 * It features a visual media header with hover overlays and badge tags, a content area 
 * with line-clamped typography, and a standardized call-to-action footer.
 * 
 * Note: Entity cards (e.g. MemberCard, PartnerCard, TutorCard) should use their own
 * specialized layouts or the generic UI Card shell.
 */
export interface MediaContentCardProps {
    to?: string;
    onClick?: () => void;
    image?: string;
    imageAlt?: string;
    dateBadge?: string;
    topRightBadge?: React.ReactNode;
    title: string;
    subtitle?: React.ReactNode;
    location?: string | null;
    description?: string;
    actionLabel?: string;
    hoverOverlayText?: string;
    viewMode?: 'card' | 'list' | 'grid';
    className?: string;
}

const MediaContentCard: React.FC<MediaContentCardProps> = ({
    to,
    onClick,
    image,
    imageAlt,
    dateBadge,
    topRightBadge,
    title,
    subtitle,
    location,
    description,
    actionLabel = 'Saber mais',
    hoverOverlayText = 'Ver detalhes',
    viewMode = 'card',
    className = '',
}) => {
    const isList = viewMode === 'list';
    const isGrid = viewMode === 'grid';

    const containerClasses = `
        group block bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-neutral-200 dark:border-neutral-700 cursor-pointer
        ${isList ? 'flex flex-col sm:flex-row sm:h-48 transform hover:-translate-y-1' : ''}
        ${isGrid ? 'flex flex-col h-full transform hover:-translate-y-1' : ''}
        ${!isList && !isGrid ? 'flex flex-col h-full transform hover:-translate-y-2' : ''}
        ${className}
    `.trim();

    const renderContent = () => (
        <>
            {/* Cover Media Container */}
            <div className={`
                relative overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0
                ${isList ? 'w-full sm:w-64 h-48 sm:h-full' : ''}
                ${isGrid ? 'h-44' : ''}
                ${!isList && !isGrid ? 'h-56' : ''}
            `}>
                {image ? (
                    <>
                        <img
                            src={image}
                            alt={imageAlt || title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4 md:p-6 z-10">
                            <span className="text-white font-medium flex items-center gap-2 text-sm">
                                {hoverOverlayText}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-primary-900/10 via-neutral-100 to-neutral-200 dark:from-primary-900/30 dark:via-neutral-800 dark:to-neutral-700 flex items-center justify-center text-neutral-400 dark:text-neutral-500 font-bold text-sm">
                        Sem imagem
                    </div>
                )}

                {/* Date badge on top left (for card view) */}
                {!isList && dateBadge && (
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm text-primary-600 dark:text-primary-400 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm capitalize">
                            {dateBadge}
                        </span>
                    </div>
                )}

                {/* Top right badge (e.g. status badge) */}
                {topRightBadge && (
                    <div className="absolute top-4 right-4 z-10">
                        {topRightBadge}
                    </div>
                )}
            </div>

            {/* Content Container */}
            <div className={`
                flex-1 flex flex-col justify-between
                ${isList ? 'p-5 md:p-6' : ''}
                ${isGrid ? 'p-4' : ''}
                ${!isList && !isGrid ? 'p-6' : ''}
            `}>
                <div>
                    {isList && dateBadge && (
                        <div className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wide mb-1.5">
                            {dateBadge}
                        </div>
                    )}

                    {subtitle && (
                        <div className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
                            {subtitle}
                        </div>
                    )}

                    <h3 className={`
                        font-bold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors
                        ${isList ? 'text-lg md:text-xl line-clamp-1 mb-2' : ''}
                        ${isGrid ? 'text-base line-clamp-2 mb-1' : ''}
                        ${!isList && !isGrid ? 'text-xl line-clamp-2 mb-2' : ''}
                    `}>
                        {title}
                    </h3>

                    {location && (
                        <div className="flex items-center text-neutral-500 dark:text-neutral-400 text-sm mb-3 gap-1.5">
                            <svg className="w-4 h-4 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate max-w-[200px]">{location}</span>
                        </div>
                    )}

                    {description && !isGrid && (
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2 leading-relaxed mb-4 flex-1">
                            {description}
                        </p>
                    )}

                    {isGrid && dateBadge && (
                        <div className="text-xs text-neutral-400 dark:text-neutral-500 font-medium mb-2">
                            {dateBadge}
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-700 flex justify-between items-center mt-auto">
                    <span className="text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                        {actionLabel}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-neutral-700 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:bg-primary-600 dark:group-hover:bg-primary-500 group-hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </>
    );

    if (to) {
        return (
            <Link to={to} className={containerClasses}>
                {renderContent()}
            </Link>
        );
    }

    return (
        <div onClick={onClick} className={containerClasses}>
            {renderContent()}
        </div>
    );
};

export default MediaContentCard;
