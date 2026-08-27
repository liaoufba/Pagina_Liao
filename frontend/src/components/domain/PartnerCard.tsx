import React from 'react';
import type { Partner } from '../../models/Partner';
import { FiExternalLink } from 'react-icons/fi';

interface PartnerCardProps {
    partner: Partner;
    viewMode: 'card' | 'grid' | 'list';
}

const PartnerCard: React.FC<PartnerCardProps> = ({ partner, viewMode }) => {
    const isList = viewMode === 'list';
    const isGrid = viewMode === 'grid';
    const isCard = viewMode === 'card';

    return (
        <div className={`
            group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 
            transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden rounded-2xl
            ${isList ? 'flex flex-row items-center p-6 gap-8' : 'flex flex-col'}
            ${isCard ? 'h-full min-h-[280px]' : ''}
            ${isGrid ? 'h-full min-h-[220px]' : ''}
        `}>
            <div className={`
                flex items-center justify-center bg-neutral-50 dark:bg-neutral-800/50 
                ${isList ? 'w-32 h-32 shrink-0 rounded-lg' : 'w-full h-48'}
                ${isGrid ? 'h-32' : ''}
            `}>
                <img
                    src={partner.imageUrl}
                    alt={partner.name}
                    className={`
                        max-w-[70%] max-h-[70%] object-contain transition-all duration-500
                        ${isList ? 'grayscale-0' : 'grayscale group-hover:grayscale-0 group-hover:scale-110'}
                        dark:brightness-110 dark:contrast-125
                    `}
                />
            </div>

            <div className={`flex-1 ${isList ? '' : 'p-6 text-center'}`}>
                <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-4 group-hover:text-primary-600 transition-colors">
                    {partner.name}
                </h3>
                
                {partner.websiteUrl && (
                    <a
                        href={partner.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
                            inline-flex items-center gap-2 font-semibold text-sm transition-all
                            text-primary-600 hover:text-primary-700
                            ${isList ? 'mt-2' : ''}
                        `}
                    >
                        Visitar Website <FiExternalLink size={14} />
                    </a>
                )}
            </div>
        </div>
    );
};

export default PartnerCard;
