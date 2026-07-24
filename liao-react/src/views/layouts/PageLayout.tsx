import React from 'react';

interface PageLayoutProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    headerClassName?: string;
    containerClassName?: string;
    renderHeader?: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
    title, 
    subtitle, 
    children, 
    headerClassName = '', 
    containerClassName = '',
    renderHeader 
}) => {
    return (
        <div className={`min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200 ${containerClassName}`}>
            {renderHeader || (
                (title || subtitle) && (
                    <div className={`page-padding-top pb-10 px-4 transition-colors ${headerClassName}`}>
                        <div className="max-w-7xl mx-auto text-center">
                            {title && <h1 className="section-title dark:text-white mb-4">{title}</h1>}
                            {subtitle && <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">{subtitle}</p>}
                        </div>
                    </div>
                )
            )}
            
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${(title || subtitle || renderHeader) ? 'page-padding-bottom' : 'page-padding-y'}`}>
                {children}
            </div>
        </div>
    );
};

export default PageLayout;
