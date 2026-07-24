import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import type { Tutor } from '../../models/Tutor';
import TechBackground from '../../components/ui/TechBackground';

const TutorDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tutor, setTutor] = useState<Tutor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTutor = async () => {
            if (!id) return;
            try {
                const response = await apiService.getTutorById(Number(id));
                setTutor(response.data.tutor);
            } catch (err) {
                console.error(err);
                setError('Tutor não encontrado ou erro ao carregar.');
            } finally {
                setLoading(false);
            }
        };

        fetchTutor();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600 border-opacity-75"></div>
            </div>
        );
    }

    if (error || !tutor) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center px-4">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-4">Ops!</h2>
                    <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">{error || 'Tutor não encontrado.'}</p>
                    <button
                        onClick={() => navigate('/members?tab=tutors')}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-lg"
                    >
                        Voltar para Tutores
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 page-padding-bottom">
            {/* Hero Header with Gradient */}
            <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative overflow-hidden">
                    {/* Abstract decorative circles */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-5"></div>
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-5"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-white opacity-5"></div>

                    {/* Tech Background Animation (Overlay) */}
                    <TechBackground
                        mode="absolute"
                        backgroundColor="transparent"
                        colors={['#ef4444', '#eab308', '#22c55e', '#3b82f6']} // Red, Yellow, Green, Blue
                        opacity={0.6}
                    />

                    <div className="absolute top-8 left-4 md:left-8 z-20">
                        <Link
                            to="/members?tab=tutors"
                            className="inline-flex items-center text-white/80 hover:text-white transition-colors bg-black/10 hover:bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm"
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            <span className="text-sm font-medium">Voltar</span>
                        </Link>
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                        {/* Profile Image with Ring Effect */}
                        <div className="flex-shrink-0 group">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-primary-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                {tutor.photo && tutor.photo.trim() ? (
                                    <img
                                        src={tutor.photo.startsWith('http') ? tutor.photo : `/Liao_membros/${tutor.photo}`}
                                        alt={tutor.name}
                                        className="relative w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-4 border-white shadow-2xl"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=random&size=256`;
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=random&size=256`}
                                        alt={tutor.name}
                                        className="relative w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-4 border-white shadow-2xl"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Name & Title */}
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-white drop-shadow-md">
                                {tutor.name}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-primary-100 text-lg md:text-xl font-medium">
                                <span className="bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full">
                                    Tutor LIAO
                                </span>
                                {tutor.availability && (
                                    <span className="hidden">
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl overflow-hidden border border-neutral-100 dark:border-neutral-700">
                    {/* Tabs / Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-100 dark:divide-neutral-700">
                        {/* Bio Section */}
                        <div className="col-span-2 p-8 md:p-12">
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                Informações sobre o tutor
                            </h2>
                            <div className="prose prose-lg dark:prose-invert text-neutral-600 dark:text-neutral-300 leading-relaxed text-justify">
                                {tutor.bio ? (
                                    tutor.bio.split('\n').map((paragraph, idx) => (
                                        <p key={idx} className="mb-4 last:mb-0">
                                            {paragraph}
                                        </p>
                                    ))
                                ) : (
                                    <p className="italic text-neutral-400 dark:text-neutral-500">Nenhuma biografia disponível.</p>
                                )}
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="col-span-1 bg-neutral-50 dark:bg-neutral-900/50 p-8 md:p-12">
                            {/* Disciplinas */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                    Áreas de Atuação
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {tutor.subjects && tutor.subjects.length > 0 ? (
                                        tutor.subjects.map((subject, index) => (
                                            <span
                                                key={index}
                                                className="inline-block px-3 py-1 bg-white dark:bg-neutral-800 border border-primary-100 dark:border-neutral-700 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold shadow-sm"
                                            >
                                                {subject}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-neutral-500 dark:text-neutral-400 text-sm">Não informado</span>
                                    )}
                                </div>
                            </div>

                            {/* Contact/CTA */}
                            <div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Contato</h3>
                                <a
                                    href={`mailto:${tutor.email}`}
                                    className="w-full btn-primary flex justify-center items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all text-center"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    Entrar em Contato
                                </a>
                                <p className="text-xs text-neutral-500 mt-3 text-center hidden">
                                    Entre em contato para agendar uma monitoria.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Return Link */}
                <div className="mt-8 text-center">
                    <Link
                        to="/members?tab=tutors"
                        className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Voltar para a lista de Tutores
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TutorDetails;
