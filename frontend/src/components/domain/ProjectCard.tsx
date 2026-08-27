import React from 'react';
import type { Project } from '../../models/Project';
import MediaContentCard from './MediaContentCard';

export interface ProjectCardProps {
    project: Project;
    viewMode?: 'card' | 'list' | 'grid';
    onClick?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, viewMode = 'card', onClick }) => {
    const projectDate = new Date(project.date).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
    });

    const coverImage = project.images && project.images.length > 0 ? project.images[0] : undefined;

    return (
        <MediaContentCard
            to={onClick ? undefined : `/projects/${project.id}`}
            onClick={onClick}
            image={coverImage}
            imageAlt={project.title}
            title={project.title}
            description={project.description}
            dateBadge={projectDate}
            actionLabel="Ler mais"
            hoverOverlayText="Ver projeto"
            viewMode={viewMode}
        />
    );
};

export default ProjectCard;
