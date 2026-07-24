import React, { useState } from 'react';

interface FAQ {
    id: number;
    question: string;
    answer: string;
}

interface EventFAQProps {
    faqs: FAQ[];
    isEmbedded?: boolean;
}

const EventFAQ: React.FC<EventFAQProps> = ({ faqs, isEmbedded = false }) => {
    const [openIndexes, setOpenIndexes] = useState<number[]>([]);

    const toggleFAQ = (index: number) => {
        setOpenIndexes(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index) 
                : [...prev, index]
        );
    };

    if (!faqs || faqs.length === 0) return null;

    const content = (
        <div className="space-y-2">
            {faqs.map((faq, index) => {
                const isOpen = openIndexes.includes(index);
                return (
                    <div 
                        key={faq.id} 
                        className="border-b border-neutral-200 dark:border-neutral-800 last:border-0"
                    >
                        <button
                            onClick={() => toggleFAQ(index)}
                            className="w-full flex items-center justify-between py-6 text-left group focus:outline-none"
                            aria-expanded={isOpen}
                        >
                            <span 
                                className="text-lg md:text-xl font-medium transition-colors duration-300 text-neutral-800 dark:text-neutral-200"
                                style={{ color: isOpen ? 'var(--event-primary)' : undefined }}
                            >
                                {faq.question}
                            </span>
                            <div className={`flex-shrink-0 ml-4 transition-transform duration-500 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                                <svg 
                                    className="w-6 h-6 transition-colors" 
                                    style={{ color: isOpen ? 'var(--event-primary)' : 'currentColor' }}
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </button>
                        
                        <div 
                            className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-8' : 'grid-rows-[0fr] opacity-0'}`}
                        >
                            <div className="overflow-hidden">
                                <div className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-base md:text-lg">
                                    {faq.answer.split('\n').map((line, i) => (
                                        <p key={i} className={i > 0 ? 'mt-3' : ''}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    if (isEmbedded) return content;

    return (
        <section className="py-16 bg-white dark:bg-neutral-950 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                        Dúvidas Frequentes
                    </h2>
                    <div 
                        className="w-20 h-1.5 mx-auto rounded-full"
                        style={{ backgroundColor: 'var(--event-primary)' }}
                    ></div>
                </div>
                {content}
            </div>
        </section>
    );
};

export default EventFAQ;
