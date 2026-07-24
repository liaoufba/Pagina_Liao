import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import type { Project } from '../../models/Project';
import CollectionLayout from '../layouts/CollectionLayout';
import ProjectCard from '../../components/domain/ProjectCard';

const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await apiService.getProjects({ sort: sortOrder });
                const data = (res.success && Array.isArray(res.data)) ? res.data : [];
                setProjects(data);
            } catch (error) {
                console.error('Error fetching projects:', error);
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [sortOrder]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600"></div>
            </div>
        );
    }

    return (
        <CollectionLayout
            title="Projetos Realizados"
            renderControls={() => (
                <div className="flex bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-1">
                    <button
                        onClick={() => setSortOrder('recent')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${sortOrder === 'recent'
                            ? 'bg-primary-100 text-primary-600'
                            : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                            }`}
                    >
                        Recentes
                    </button>
                    <button
                        onClick={() => setSortOrder('oldest')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${sortOrder === 'oldest'
                            ? 'bg-primary-100 text-primary-600'
                            : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                            }`}
                    >
                        Antigos
                    </button>
                </div>
            )}
        >
            {(viewMode) => (
                <>
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            viewMode={viewMode}
                        />
                    ))}

                    {projects.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <p className="text-neutral-600 text-lg">Nenhum projeto cadastrado no momento.</p>
                        </div>
                    )}
                </>
            )}
        </CollectionLayout>
    );
};

export default Projects;
