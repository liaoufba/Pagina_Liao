import React from 'react';

export interface TabItem<T extends string = string> {
    id: T;
    label: string;
    icon?: React.ReactNode;
    count?: number;
}

interface FilterTabsProps<T extends string = string> {
    tabs: TabItem<T>[];
    activeTab: T;
    onChange: (tabId: T) => void;
    className?: string;
}

export function FilterTabs<T extends string = string>({
    tabs,
    activeTab,
    onChange,
    className = ''
}: FilterTabsProps<T>) {
    return (
        <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        type="button"
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 transform active:scale-95 cursor-pointer ${
                            isActive
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 scale-105 border border-transparent'
                                : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 shadow-sm'
                        }`}
                    >
                        {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                        <span>{tab.label}</span>
                        {typeof tab.count === 'number' && (
                            <span className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${
                                isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
                            }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

export default FilterTabs;
