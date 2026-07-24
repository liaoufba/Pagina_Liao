import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Link } from 'react-router-dom';

const ProSel: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        course: '',
        semester: '',
        motivation: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [checkingConfig, setCheckingConfig] = useState(true);
    const [error, setError] = useState('');

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await apiService.submitApplication(formData);
            setSuccess(true);
            setFormData({
                name: '',
                email: '',
                phone: '',
                course: '',
                semester: '',
                motivation: '',
            });
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao enviar inscrição');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await apiService.getConfig('prosel_open');
                setIsOpen(response.data === 'true');
            } catch (error) {
                console.error('Error checking status:', error);
                // Default to closed on error for safety
                setIsOpen(false);
            } finally {
                setCheckingConfig(false);
            }
        };
        checkStatus();
    }, []);

    if (checkingConfig) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 page-padding-y">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="section-title">Processo Seletivo</h1>
                    <p className="text-xl text-neutral-600 dark:text-neutral-400">
                        {isOpen
                            ? 'Faça parte da LIAO! Preencha o formulário abaixo.'
                            : 'O período de inscrições não está aberto no momento.'}
                    </p>
                </div>

                {!isOpen ? (
                    <div className="card p-12 text-center">
                        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-6">
                            <svg className="h-12 w-12 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Aguarde a próxima edição!</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto mb-8">
                            Fique atento às nossas redes sociais para saber quando abriremos novas vagas.
                            Enquanto isso, você pode conferir nossos conteúdos e projetos.
                        </p>
                        <Link to="/" className="btn-primary inline-flex items-center">
                            Voltar para o início
                        </Link>
                    </div>
                ) : (
                    <div className="card p-8">
                        {success && (
                            <div className="mb-6 p-4 bg-success-50 dark:bg-success-950/30 border border-success-200 dark:border-success-800 rounded-lg">
                                <p className="text-success-800 dark:text-success-300 font-medium">
                                    Inscrição enviada com sucesso! Entraremos em contato em breve.
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-danger-50 dark:bg-danger-950/30 border border-danger-200 dark:border-danger-800 rounded-lg">
                                <p className="text-danger-800 dark:text-danger-300">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Nome Completo *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Telefone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Curso *
                                </label>
                                <input
                                    type="text"
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Semestre *
                                </label>
                                <input
                                    type="number"
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    max="12"
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Por que você quer fazer parte da LIAO? *
                                </label>
                                <textarea
                                    name="motivation"
                                    value={formData.motivation}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    className="input-field"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-special disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Enviando...' : 'Enviar Inscrição'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProSel;
