import React, { useState } from 'react';
import { apiService } from '../../services/api';
import type { Project } from '../../models/Project';

interface ProjectFormProps {
    project?: Project;
    onSuccess: () => void;
    onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSuccess, onCancel }) => {
    const [title, setTitle] = useState(project?.title || '');
    const [description, setDescription] = useState(project?.description || '');
    const [date, setDate] = useState(project?.date ? new Date(project.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [images, setImages] = useState<string[]>(project?.images || ['']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageChange = (index: number, value: string) => {
        const newImages = [...images];
        newImages[index] = value;
        setImages(newImages);
    };

    const addImageField = () => {
        if (images.length < 10) {
            setImages([...images, '']);
        }
    };

    const removeImageField = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const filteredImages = images.filter(img => img.trim() !== '');

        if (filteredImages.length > 10) {
            setError('Máximo de 10 imagens por projeto.');
            setLoading(false);
            return;
        }

        const data = {
            title,
            description,
            date,
            images: filteredImages,
        };

        try {
            if (project) {
                await apiService.updateProject(project.id, data);
            } else {
                await apiService.createProject(data);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao salvar projeto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-lg border dark:border-neutral-800">
            <h2 className="text-2xl font-bold mb-6 text-neutral-800 dark:text-white">
                {project ? 'Editar Projeto' : 'Novo Projeto'}
            </h2>

            {error && (
                <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded text-danger-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-neutral-700">Título</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="input-field mt-1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">Descrição</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={4}
                        className="input-field mt-1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">Data de Realização</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="input-field mt-1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Imagens do Projeto (Max 10)
                        <span className="text-xs text-neutral-500 ml-2">Cole as URLs das imagens</span>
                    </label>

                    {images.map((img, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <input
                                type="url"
                                value={img}
                                onChange={(e) => handleImageChange(index, e.target.value)}
                                placeholder="https://exemplo.com/imagem.jpg"
                                className="input-field flex-1"
                            />
                            {images.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeImageField(index)}
                                    className="px-3 py-2 bg-danger-100 text-danger-600 rounded hover:bg-danger-200"
                                >
                                    X
                                </button>
                            )}
                        </div>
                    ))}

                    {images.length < 10 && (
                        <button
                            type="button"
                            onClick={addImageField}
                            className="mt-2 text-sm text-primary-600 hover:text-primary-800 font-medium"
                        >
                            + Adicionar outra imagem
                        </button>
                    )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? 'Salvando...' : 'Salvar Projeto'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProjectForm;
