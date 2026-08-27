import React, { useState } from 'react';
import { apiService } from '../../services/api';

interface TutorFormProps {
    tutor?: any;
    onSuccess: () => void;
    onCancel: () => void;
}

const TutorForm: React.FC<TutorFormProps> = ({ tutor, onSuccess, onCancel }) => {
    const [name, setName] = useState(tutor?.name || '');
    const [email, setEmail] = useState(tutor?.email || '');
    const [subjects, setSubjects] = useState(tutor ? tutor.subjects.join(', ') : '');
    const [bio, setBio] = useState(tutor?.bio || '');
    const [photo, setPhoto] = useState(tutor?.photo || '');
    const [availability] = useState(tutor?.availability || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const data = {
            name: name.trim(),
            email: email.trim(),
            subjects: subjects.split(',').map((s: string) => s.trim()).filter((s: string) => s),
            bio: bio.trim(),
            photo: photo.trim(),
            availability: availability.trim(),
        };

        try {
            if (tutor) {
                await apiService.updateTutor(tutor.id, data);
            } else {
                await apiService.createTutor(data);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao salvar tutor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-lg border dark:border-neutral-800">
            <h2 className="text-2xl font-bold mb-6 text-neutral-800 dark:text-white">
                {tutor ? 'Editar Tutor' : 'Novo Tutor'}
            </h2>

            {error && (
                <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded text-danger-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700">Nome</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="input-field mt-1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input-field mt-1"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">Áreas de Atuação (separadas por vírgula)</label>
                    <input
                        type="text"
                        value={subjects}
                        onChange={(e) => setSubjects(e.target.value)}
                        placeholder="Ex: Cálculo I, Algoritmos, Física..."
                        required
                        className="input-field mt-1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">Foto URL</label>
                    <input
                        type="url"
                        value={photo}
                        onChange={(e) => setPhoto(e.target.value)}
                        placeholder="https://..."
                        className="input-field mt-1"
                    />
                </div>

                {/* Availability field hidden as per request */}
                {/* <div>
                    <label className="block text-sm font-medium text-neutral-700">Disponibilidade</label>
                    <input
                        type="text"
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        placeholder="Ex: Segundas e Quartas, 14h-16h"
                        className="input-field mt-1"
                    />
                </div> */}

                <div>
                    <label className="block text-sm font-medium text-neutral-700">Informações sobre o tutor</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="input-field mt-1"
                    />
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
                        {loading ? 'Salvando...' : 'Salvar Tutor'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TutorForm;
