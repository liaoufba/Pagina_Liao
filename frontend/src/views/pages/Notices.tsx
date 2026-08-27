import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import type { Content } from '../../models/Content';

const Notices: React.FC = () => {
    const [notices, setNotices] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const res = await apiService.getContentByType('notice');
                setNotices(res.data || []);
            } catch (error) {
                console.error('Error fetching notices:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotices();
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
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="section-title text-center mb-12">Parcerias</h1>

                <div className="space-y-6">
                    {notices.map((notice) => (
                        <div key={notice.id} className="card p-6">
                            <div className="flex justify-between items-start mb-3">
                                <h2 className="text-2xl font-bold text-neutral-900">{notice.title}</h2>
                                <span className="text-sm text-neutral-500">
                                    {new Date(notice.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                            {notice.description && (
                                <p className="text-neutral-700 mb-3">{notice.description}</p>
                            )}
                            <div className="prose max-w-none text-neutral-600">
                                {notice.content}
                            </div>
                        </div>
                    ))}
                </div>

                {notices.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-neutral-600 text-lg">Nenhuma parceria no momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notices;
