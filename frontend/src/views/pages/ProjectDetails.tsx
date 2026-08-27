import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import type { Project } from '../../models/Project';

const ProjectDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) return;
            try {
                // Fetch all projects and find the one we need since getProjectById is not explicitly available
                // If backend supports getProjects({ id }) or similar we could use that, but this is safe
                const res = await apiService.getProjects();
                const data = Array.isArray(res.data) ? res.data : [];
                const found = data.find((p: Project) => p.id === Number(id));
                setProject(found || null);
            } catch (error) {
                console.error('Error fetching project:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 text-neutral-600">
                <h2 className="text-2xl font-bold mb-4">Projeto não encontrado 😕</h2>
                <button
                    onClick={() => navigate('/projects')}
                    className="text-primary-600 hover:text-primary-800 font-medium hover:underline"
                >
                    &larr; Voltar para Projetos
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="w-full bg-neutral-900 h-64 md:h-96 relative overflow-hidden">
                <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
                {project.images && project.images.length > 0 ? (
                    <img
                        src={project.images[0]}
                        alt={project.title}
                        className="w-full h-full object-cover opacity-80"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary-900 to-black">
                        <span className="text-white opacity-20 text-9xl font-bold">LIAO</span>
                    </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-20 max-w-4xl mx-auto text-white">
                    <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 drop-shadow-lg">
                        {project.title}
                    </h1>
                    <div className="flex items-center text-neutral-300 text-sm font-medium">
                        <span>{new Date(project.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <article className="max-w-3xl mx-auto px-6 py-12 md:py-20">
                {/* Main Content */}
                <div className="prose prose-lg prose-blue mx-auto text-neutral-800 whitespace-pre-wrap leading-loose">
                    {project.description}
                </div>

                {/* Gallery if more images */}
                {project.images && project.images.length > 1 && (
                    <div className="mt-16 pt-12 border-t border-neutral-100">
                        <h3 className="text-2xl font-bold text-neutral-900 mb-8">Galeria</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {project.images.slice(1).map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`Galeria ${idx}`}
                                    className="rounded-xl shadow-lg hover:shadow-2xl transition-shadow w-full h-64 object-cover"
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Back Button Footer */}
                <div className="mt-16 pt-8 border-t border-neutral-200 flex justify-between items-center">
                    <button
                        onClick={() => navigate('/projects')}
                        className="flex items-center text-neutral-500 hover:text-primary-600 font-bold transition-colors group"
                    >
                        <span className="transform group-hover:-translate-x-1 transition-transform inline-block mr-2">&larr;</span>
                        Voltar para Projetos
                    </button>
                </div>
            </article>
        </div>
    );
};

export default ProjectDetails;
