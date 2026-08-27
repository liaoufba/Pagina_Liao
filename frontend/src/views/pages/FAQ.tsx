import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import type { Content } from '../../models/Content';

const FAQ: React.FC = () => {
    const [faqs, setFaqs] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                const res = await apiService.getContentByType('faq');
                setFaqs(res.data || []);
            } catch (error) {
                console.error('Error fetching FAQs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFAQs();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 page-padding-y">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="section-title text-center mb-12">Perguntas Frequentes</h1>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={faq.id} className="card overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full p-6 text-left flex justify-between items-center hover:bg-neutral-50 transition-colors"
                            >
                                <h3 className="text-lg font-semibold text-neutral-900 pr-4">
                                    {faq.title}
                                </h3>
                                <svg
                                    className={`w-6 h-6 text-neutral-500 transition-transform ${openIndex === index ? 'transform rotate-180' : ''
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>
                            {openIndex === index && (
                                <div className="px-6 pb-6 text-neutral-600">
                                    {faq.content}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {faqs.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-neutral-600 text-lg">Nenhuma pergunta no momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FAQ;
