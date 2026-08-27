import React, { useState } from 'react';
import PageLayout from './PageLayout';
import ViewModeSwitcher from '../../components/ui/ViewModeSwitcher';

export type ViewMode = 'card' | 'list' | 'grid';

interface CollectionLayoutProps {
    title: string;
    subtitle?: string;
    children: (viewMode: ViewMode) => React.ReactNode;
    renderControls?: (viewMode: ViewMode, setViewMode: (mode: ViewMode) => void) => React.ReactNode;
    defaultViewMode?: ViewMode;
}

const CollectionLayout: React.FC<CollectionLayoutProps> = ({
    title,
    subtitle,
    children,
    renderControls,
    defaultViewMode = 'card'
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);

    const getContainerClass = () => {
        switch (viewMode) {
            case 'list': return 'flex flex-col gap-4';
            case 'grid': return 'grid grid-cols-2 md:grid-cols-4 gap-4';
            default: return 'grid grid-cols-1 md:grid-cols-3 gap-8';
        }
    };

    return (
        <PageLayout>
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div className="text-left">
                    <h1 className="section-title dark:text-white mb-2">{title}</h1>
                    {subtitle && <p className="text-neutral-600 dark:text-neutral-400">{subtitle}</p>}
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                    {renderControls && renderControls(viewMode, setViewMode)}
                    <ViewModeSwitcher viewMode={viewMode} setViewMode={setViewMode} />
                </div>
            </div>

            <div className={getContainerClass()}>
                {children(viewMode)}
            </div>
        </PageLayout>
    );
};

export default CollectionLayout;
