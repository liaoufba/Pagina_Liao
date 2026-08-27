import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import type { Content } from '../../models/Content';

const Video: React.FC = () => {
    const [videos, setVideos] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await apiService.getContentByType('video');
                setVideos(res.data || []);
            } catch (error) {
                console.error('Error fetching videos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="section-title text-center mb-12">Vídeos</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <div key={video.id} className="card">
                            {video.url && (
                                <div className="aspect-video bg-neutral-200">
                                    <iframe
                                        src={video.url}
                                        title={video.title}
                                        className="w-full h-full"
                                        allowFullScreen
                                    />
                                </div>
                            )}
                            <div className="p-5">
                                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                                    {video.title}
                                </h3>
                                {video.description && (
                                    <p className="text-neutral-600">{video.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {videos.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-neutral-600 text-lg">Nenhum vídeo disponível no momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Video;
