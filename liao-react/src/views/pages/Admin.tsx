import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import MemberForm from '../../components/forms/MemberForm';
import TutorForm from '../../components/forms/TutorForm';
import ProjectForm from '../../components/forms/ProjectForm';
import ArticleForm from '../../components/forms/ArticleForm';
import PartnerForm from '../../components/forms/PartnerForm';
import EventForm from '../../components/forms/EventForm';
import FAQManagerModal from '../../components/admin/FAQManagerModal';
import AuditModal from '../../components/admin/AuditModal';
import type { EventApi } from '../../models/Event';

const Admin: React.FC = () => {
    const navigate = useNavigate();
    const { section } = useParams<{ section?: string }>();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const activeSection = section || '';

    const setActiveSection = (newSection: string) => {
        if (newSection) {
            navigate(`/admin/${newSection}`);
        } else {
            navigate('/admin');
        }
    };

    // Members State
    const [members, setMembers] = useState<any[]>([]);
    const [editingMember, setEditingMember] = useState<any>(null);
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [selectedMemberYear, setSelectedMemberYear] = useState<number | 'all'>('all');

    // Tutors State
    const [tutors, setTutors] = useState<any[]>([]);
    const [editingTutor, setEditingTutor] = useState<any>(null);
    const [showTutorForm, setShowTutorForm] = useState(false);

    // Projects State
    const [projects, setProjects] = useState<any[]>([]);
    const [editingProject, setEditingProject] = useState<any>(null);
    const [showProjectForm, setShowProjectForm] = useState(false);

    // Articles State
    const [articles, setArticles] = useState<any[]>([]);
    const [editingArticle, setEditingArticle] = useState<any>(null);
    const [showArticleForm, setShowArticleForm] = useState(false);

    // Partners State
    const [partners, setPartners] = useState<any[]>([]);
    const [editingPartner, setEditingPartner] = useState<any>(null);
    const [showPartnerForm, setShowPartnerForm] = useState(false);

    // Events State
    const [events, setEvents] = useState<EventApi[]>([]);
    const [editingEvent, setEditingEvent] = useState<EventApi | null>(null);
    const [showEventForm, setShowEventForm] = useState(false);

    const [config, setConfig] = useState({ proselOpen: false, contactEmail: '' });
    const [originalContactEmail, setOriginalContactEmail] = useState('');
    const [carouselImages, setCarouselImages] = useState<string[]>([]);
    const [originalCarouselImages, setOriginalCarouselImages] = useState<string[]>([]);
    const [newCarouselImageUrl, setNewCarouselImageUrl] = useState('');

    // Admins State (New)
    const [admins, setAdmins] = useState<any[]>([]);
    const [showAdminForm, setShowAdminForm] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
    const [newAdminPermissions, setNewAdminPermissions] = useState<string[]>([]);

    // Audit Modal State
    const [auditModal, setAuditModal] = useState<{ isOpen: boolean; resource: string; label: string }>(
        { isOpen: false, resource: '', label: '' }
    );

    // Security Verification Modal
    const [securityModal, setSecurityModal] = useState({
        isOpen: false,
        targetId: null as number | null,
        password: '',
        loading: false,
        error: ''
    });

    // FAQ Management State
    const [faqManager, setFaqManager] = useState<{ isOpen: boolean; event: EventApi | null }>({
        isOpen: false,
        event: null
    });

    // Permission helper
    const isMaster = user.role === 'master';
    const hasPermission = (section: string) => isMaster || (user.permissions || []).includes(section);
    const openAudit = (resource: string, label: string) => setAuditModal({ isOpen: true, resource, label });

    const PERMISSION_OPTIONS = [
        { key: 'members',  label: 'Membros' },
        { key: 'tutors',   label: 'Tutores' },
        { key: 'projects', label: 'Projetos' },
        { key: 'newsletter', label: 'Newsletter' },
        { key: 'partners', label: 'Parcerias' },
        { key: 'events',   label: 'Eventos' },
    ];

    const togglePermission = (key: string) => {
        setNewAdminPermissions(prev =>
            prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
        );
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const fetchMembers = async () => {
        try {
            const response = await apiService.getMembers();
            setMembers(response.data);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const fetchTutors = async () => {
        try {
            const response = await apiService.getTutors();
            setTutors(response.data.tutors || []); // Ensure array
        } catch (error) {
            console.error('Error fetching tutors:', error);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await apiService.getProjects();
            setProjects(response.data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchArticles = async () => {
        try {
            const response = await apiService.getArticles();
            setArticles(response.data || []);
        } catch (error) {
            console.error('Error fetching articles:', error);
        }
    };

    const fetchPartners = async () => {
        try {
            const response = await apiService.getPartners();
            setPartners(response.data || []);
        } catch (error) {
            console.error('Error fetching partners:', error);
        }
    };

    const fetchConfig = async () => {
        try {
            const proselRes = await apiService.getConfig('prosel_open');
            const emailRes = await apiService.getConfig('CONTACT_EMAIL');
            const carouselRes = await apiService.getConfig('about_carousel_images');
            
            const fetchedEmail = emailRes.data || 'contato@liao.com';
            setConfig({ 
                proselOpen: proselRes.data === 'true',
                contactEmail: fetchedEmail
            });
            setOriginalContactEmail(fetchedEmail);

            if (carouselRes.success && carouselRes.data) {
                try {
                    const parsed = JSON.parse(carouselRes.data);
                    if (Array.isArray(parsed)) {
                        setCarouselImages(parsed);
                        setOriginalCarouselImages(parsed);
                    }
                } catch (e) {
                    console.error('Error parsing carousel images config:', e);
                }
            }
        } catch (error) {
            console.error('Error fetching config:', error);
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await apiService.getEvents();
            setEvents(response.data || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const fetchAdmins = async () => {
        try {
            const response = await apiService.getAdmins();
            setAdmins(response.data || []);
        } catch (error) {
            console.error('Error fetching admins:', error);
        }
    };

    useEffect(() => {
        if (activeSection === 'members') fetchMembers();
        if (activeSection === 'tutors') fetchTutors();
        if (activeSection === 'projects') fetchProjects();
        if (activeSection === 'articles') fetchArticles();
        if (activeSection === 'partners') fetchPartners();
        if (activeSection === 'events') fetchEvents();
        if (activeSection === 'config') {
            fetchConfig();
            fetchAdmins();
        }
    }, [activeSection]);

    // --- Config ---
    const handleToggleProSel = async () => {
        try {
            const newValue = (!config.proselOpen).toString();
            await apiService.updateConfig('prosel_open', newValue);
            setConfig(prev => ({ ...prev, proselOpen: !prev.proselOpen }));
        } catch (error) {
            alert('Erro ao atualizar configuração');
        }
    }

    const handleUpdateContactEmail = async () => {
        try {
            await apiService.updateConfig('CONTACT_EMAIL', config.contactEmail);
            setOriginalContactEmail(config.contactEmail);
            alert('Email de contato atualizado com sucesso!');
        } catch (error) {
            alert('Erro ao atualizar email de contato');
        }
    };

    const handleUpdateCarouselImages = async () => {
        try {
            await apiService.updateConfig('about_carousel_images', JSON.stringify(carouselImages));
            setOriginalCarouselImages(carouselImages);
            alert('Carrossel da página Sobre atualizado com sucesso! 🚀');
        } catch (error) {
            console.error('Error updating carousel images config:', error);
            alert('Falha ao atualizar carrossel.');
        }
    };

    // --- Admin Management Logic ---
    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiService.register(newAdmin.email, newAdmin.password, newAdmin.name, newAdminPermissions);
            alert('Administrador criado com sucesso!');
            setShowAdminForm(false);
            setNewAdmin({ name: '', email: '', password: '' });
            setNewAdminPermissions([]);
            fetchAdmins();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.error || 'Erro ao criar administrador');
        }
    };

    const handleDeleteAdmin = async (id: number) => {
        if (window.confirm('ATENÇÃO: Tem certeza que deseja excluir esta conta de administrador? Esta ação é irreversível.')) {
            try {
                await apiService.deleteAdmin(id);
                alert('Administrador excluído com sucesso.');
                fetchAdmins();
            } catch (error: any) {
                console.error(error);
                alert(error.response?.data?.error || 'Erro ao excluir administrador');
            }
        }
    };

    // --- Members Logic ---
    const handleDeleteMember = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este membro?')) {
            await apiService.deleteMember(id);
            fetchMembers();
        }
    };
    const handleMemberSuccess = () => { setShowMemberForm(false); setEditingMember(null); fetchMembers(); };

    // --- Tutors Logic ---
    const handleDeleteTutor = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este tutor?')) {
            await apiService.deleteTutor(id);
            fetchTutors();
        }
    };
    const handleTutorSuccess = () => { setShowTutorForm(false); setEditingTutor(null); fetchTutors(); };

    // --- Projects Logic ---
    const handleDeleteProject = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
            await apiService.deleteProject(id);
            fetchProjects();
        }
    };
    const handleProjectSuccess = () => { setShowProjectForm(false); setEditingProject(null); fetchProjects(); };

    // --- Articles Logic ---
    const handleDeleteArticle = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este artigo?')) {
            await apiService.deleteArticle(id);
            fetchArticles();
        }
    };
    const handleArticleSuccess = () => { setShowArticleForm(false); setEditingArticle(null); fetchArticles(); };

    // --- Partners Logic ---
    const handleDeletePartner = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta parceria?')) {
            await apiService.deletePartner(id);
            fetchPartners();
        }
    };
    const handlePartnerSuccess = () => { setShowPartnerForm(false); setEditingPartner(null); fetchPartners(); };

    // --- Events Logic ---
    const handleDeleteEvent = (id: number) => {
        if (!isMaster) {
            alert('Apenas Administradores Master possuem permissão para excluir eventos definitivamente do sistema.');
            return;
        }
        setSecurityModal({ isOpen: true, targetId: id, password: '', loading: false, error: '' });
    };

    const confirmDeleteEvent = async () => {
        if (!securityModal.targetId || !securityModal.password) return;
        setSecurityModal(prev => ({ ...prev, loading: true, error: '' }));
        try {
            await apiService.deleteEvent(securityModal.targetId, securityModal.password);
            setSecurityModal({ isOpen: false, targetId: null, password: '', loading: false, error: '' });
            alert('Evento excluído com sucesso.');
            fetchEvents();
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Erro ao excluir evento. Verifique sua senha.';
            setSecurityModal(prev => ({ ...prev, loading: false, error: msg }));
        }
    };

    const handleEventSuccess = () => { setShowEventForm(false); setEditingEvent(null); fetchEvents(); };


    // --- Renders ---

    const renderEventsSection = () => (
        <div className="space-y-6">
            {!hasPermission('events') ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mb-2">Sem Permissão</h3>
                    <p className="text-neutral-500 max-w-sm">Você não tem acesso para gerenciar <strong>Eventos</strong>. Contate um Administrador Master.</p>
                </div>
            ) : (
            <>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Gerenciar Eventos</h2>
                    <button onClick={() => openAudit('events', 'Eventos')} title="Ver histórico de alterações" className="p-2 rounded-xl text-neutral-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all" >
                        🕐
                    </button>
                </div>
                <button onClick={() => { setEditingEvent(null); setShowEventForm(true); }} className="btn-primary">Novo Evento</button>
            </div>
            {showEventForm ? (
                <EventForm
                    event={editingEvent}
                    onSuccess={handleEventSuccess}
                    onCancel={() => { setShowEventForm(false); setEditingEvent(null); }}
                />
            ) : (
                <div className="bg-white dark:bg-neutral-800 shadow rounded-lg overflow-x-auto border dark:border-neutral-700">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                        <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Evento / Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Local</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                            {events.map((event) => (
                                <tr key={event.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img className="h-10 w-16 object-cover mr-3 rounded" src={event.coverImage} alt="" />
                                            <div>
                                                <div className="text-sm font-medium text-neutral-900 dark:text-white">{event.title}</div>
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400">{new Date(event.date as string).toLocaleDateString('pt-BR')}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{event.location || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => setFaqManager({ isOpen: true, event })} 
                                            className="text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 mr-4 transition-colors p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg"
                                            title="Gerenciar Dúvidas (FAQ)"
                                        >
                                            🙋 FAQ
                                        </button>
                                        <button onClick={() => { setEditingEvent(event); setShowEventForm(true); }} className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 mr-4">Editar</button>
                                        <button onClick={() => handleDeleteEvent(event.id as number)} className="text-danger-600 dark:text-danger-400 hover:text-danger-900 dark:hover:text-danger-300">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            </>
            )}
        </div>
    );

    const renderConfigSection = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Configurações do Sistema</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ProSel Toggle */}
                <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6 border dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Processo Seletivo</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                {config.proselOpen ? 'Inscrições ABERTAS' : 'Inscrições FECHADAS'}
                            </p>
                        </div>
                        <button
                            onClick={handleToggleProSel}
                            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${config.proselOpen ? 'bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-700'}`}
                        >
                            <span className="sr-only">Toggle ProSel</span>
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${config.proselOpen ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                        </button>
                    </div>
                </div>

                {/* Contact Email Config */}
                <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6 border dark:border-neutral-700">
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-1">Email de Contato</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">Usado nos botões "Solicitar Proposta".</p>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={config.contactEmail}
                            onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                            className="flex-1 rounded-md border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            placeholder="contato@liao.com"
                        />
                        {config.contactEmail !== originalContactEmail && (
                            <button
                                onClick={handleUpdateContactEmail}
                                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors text-sm font-bold"
                            >
                                Salvar
                            </button>
                        )}
                    </div>
                </div>

                {/* About Carousel Config */}
                <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6 border dark:border-neutral-700 md:col-span-2">
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-1">Carrossel de Imagens (Sobre Nós)</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                        Gerencie as imagens exibidas no carrossel da página "Sobre Nós". Digite o link da imagem e clique em adicionar.
                    </p>
                    
                    <div className="flex gap-2 mb-6">
                        <input
                            type="url"
                            value={newCarouselImageUrl}
                            onChange={(e) => setNewCarouselImageUrl(e.target.value)}
                            placeholder="https://exemplo.com/imagem.jpg"
                            className="flex-1 rounded-md border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (newCarouselImageUrl.trim() && !carouselImages.includes(newCarouselImageUrl.trim())) {
                                    setCarouselImages([...carouselImages, newCarouselImageUrl.trim()]);
                                    setNewCarouselImageUrl('');
                                }
                            }}
                            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors text-sm font-bold"
                        >
                            Adicionar
                        </button>
                    </div>

                    {carouselImages.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {carouselImages.map((url, index) => (
                                <div key={index} className="relative group rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 aspect-video bg-neutral-100 dark:bg-neutral-900 flex flex-col justify-between">
                                    <img
                                        src={url}
                                        alt={`Slide ${index + 1}`}
                                        className="w-full h-2/3 object-cover"
                                    />
                                    <div className="p-2 flex items-center justify-between gap-2 flex-1">
                                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate flex-1">{url}</span>
                                        <button
                                            type="button"
                                            onClick={() => setCarouselImages(carouselImages.filter((_, i) => i !== index))}
                                            className="text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 p-1.5 rounded transition-colors text-xs font-bold"
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-400 italic mb-6">Nenhuma imagem adicionada. O carrossel usará imagens padrão.</p>
                    )}

                    {JSON.stringify(carouselImages) !== JSON.stringify(originalCarouselImages) && (
                        <div className="flex justify-end">
                            <button
                                onClick={handleUpdateCarouselImages}
                                className="bg-success-600 text-white px-6 py-2.5 rounded-md hover:bg-success-700 shadow-sm transition-colors text-sm font-bold"
                            >
                                Salvar Alterações do Carrossel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Admin Management Section */}
            <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6 mt-6 border dark:border-neutral-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Administradores Permitidos</h3>
                    {['liaoufba@gmail.com', 'bispodeivisnan@gmail.com'].includes(user.email) && (
                        <button
                            onClick={() => setShowAdminForm(!showAdminForm)}
                            className="text-sm bg-primary-600 text-white px-3 py-2 rounded-md hover:bg-primary-700"
                        >
                            {showAdminForm ? 'Cancelar' : 'Adicionar Admin'}
                        </button>
                    )}
                </div>

                {showAdminForm && (
                    <form onSubmit={handleCreateAdmin} className="mb-6 bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-4">
                        <h4 className="text-sm font-bold dark:text-white">Novo Administrador</h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Nome</label>
                                <input
                                    type="text"
                                    required
                                    value={newAdmin.name}
                                    autoComplete="off"
                                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={newAdmin.email}
                                    autoComplete="off"
                                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Senha</label>
                                <input
                                    type="password"
                                    required
                                    value={newAdmin.password}
                                    autoComplete="new-password"
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        {/* Permissions Selector */}
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                                🔑 Permissões de Acesso
                                <span className="ml-2 text-xs font-normal text-neutral-500">(deixe vazio para acesso negado a todas as seções)</span>
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {PERMISSION_OPTIONS.map((opt) => {
                                    const isChecked = newAdminPermissions.includes(opt.key);
                                    return (
                                        <label
                                            key={opt.key}
                                            className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer border transition-all ${isChecked
                                                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                                                : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-primary-200'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => togglePermission(opt.key)}
                                                className="accent-primary-600"
                                            />
                                            <span className="text-sm font-medium">{opt.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="bg-success-600 text-white px-4 py-2 rounded-md hover:bg-success-700 shadow-sm">
                                Salvar Administrador
                            </button>
                        </div>
                    </form>
                )}
    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                            <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Nome</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Permissões</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Cadastro</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                                {admins.map((admin) => {
                                    const isSelf = admin.email === user.email;
                                    const isActingMaster = ['liaoufba@gmail.com', 'bispodeivisnan@gmail.com'].includes(user.email);
                                    const isTargetMaster = ['liaoufba@gmail.com', 'bispodeivisnan@gmail.com'].includes(admin.email);
    
                                    const canDelete = isSelf || (isActingMaster && !isTargetMaster);
    
                                    return (
                                        <tr key={admin.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">
                                                {admin.name}
                                                {(admin.role === 'master' || isTargetMaster) && (
                                                    <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full uppercase">Master</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{admin.email}</td>
                                            <td className="px-6 py-4 text-sm">
                                                {isTargetMaster || admin.role === 'master' ? (
                                                    <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Acesso Total</span>
                                                ) : admin.permissions && admin.permissions.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {admin.permissions.map((p: string) => (
                                                            <span key={p} className="px-2 py-0.5 text-[10px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-full uppercase">{p}</span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-neutral-400 italic">Sem permissões</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                                                {new Date(admin.createdAt).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDeleteAdmin(admin.id)}
                                                        className="text-danger-600 hover:text-danger-900"
                                                    >
                                                        Excluir
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );

    const renderMembersSection = () => {
        const years = Array.from(new Set(members.map(m => m.year || 2025))).sort((a, b) => b - a);
        const filteredMembers = selectedMemberYear === 'all'
            ? members
            : members.filter(m => (m.year || 2025) === selectedMemberYear);

        return (
            <div className="space-y-6">
                {!hasPermission('members') ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="text-6xl mb-4">🔒</div>
                        <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mb-2">Sem Permissão</h3>
                        <p className="text-neutral-500 max-w-sm">Você não tem acesso para gerenciar <strong>Membros</strong>.</p>
                    </div>
                ) : (
                    <>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Gerenciar Membros</h2>
                            <button onClick={() => openAudit('members', 'Membros')} title="Ver histórico" className="p-2 rounded-xl text-neutral-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">🕐</button>
                        </div>
                        <div className="flex items-center gap-4">
                            <select
                                value={selectedMemberYear}
                                onChange={(e) => setSelectedMemberYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                className="block rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            >
                                <option value="all">Todos os Anos</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <button onClick={() => { setEditingMember(null); setShowMemberForm(true); }} className="btn-primary">
                                Novo Membro
                            </button>
                        </div>
                    </div>
                    {showMemberForm ? (
                        <MemberForm
                            member={editingMember}
                            onSuccess={handleMemberSuccess}
                            onCancel={() => { setShowMemberForm(false); setEditingMember(null); }}
                        />
                    ) : (
                        <div className="bg-white dark:bg-neutral-800 shadow rounded-lg overflow-x-auto border dark:border-neutral-700">
                            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                                <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Nome</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Ano</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                                    {filteredMembers.map((member) => (
                                        <tr key={member.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {member.photo && <img className="h-8 w-8 rounded-full mr-3" src={member.photo} alt="" />}
                                                    <div className="text-sm font-medium text-neutral-900 dark:text-white">{member.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{member.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400 font-bold">{member.year || 2025}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{member.isFounder ? 'Fundador' : member.role}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => { setEditingMember(member); setShowMemberForm(true); }} className="text-primary-600 hover:text-primary-900 mr-4">Editar</button>
                                                <button onClick={() => handleDeleteMember(member.id)} className="text-danger-600 hover:text-danger-900">Excluir</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredMembers.length === 0 && (
                                <div className="text-center py-8 text-neutral-500">Nenhum membro encontrado para este filtro.</div>
                            )}
                        </div>
                    )}
                    </>
                )}
            </div>
        );
    };

    const renderTutorsSection = () => (
        <div className="space-y-6">
            {!hasPermission('tutors') ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mb-2">Sem Permissão</h3>
                    <p className="text-neutral-500 max-w-sm">Você não tem acesso para gerenciar <strong>Tutores</strong>.</p>
                </div>
            ) : (<>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Gerenciar Tutores</h2>
                    <button onClick={() => openAudit('tutors', 'Tutores')} title="Ver histórico" className="p-2 rounded-xl text-neutral-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">🕐</button>
                </div>
                <button
                    onClick={() => { setEditingTutor(null); setShowTutorForm(true); }}
                    className="btn-primary"
                >
                    Novo Tutor
                </button>
            </div>
            {showTutorForm ? (
                <TutorForm
                    tutor={editingTutor}
                    onSuccess={handleTutorSuccess}
                    onCancel={() => { setShowTutorForm(false); setEditingTutor(null); }}
                />
            ) : (
                <div className="bg-white dark:bg-neutral-800 shadow rounded-lg overflow-x-auto border dark:border-neutral-700">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                        <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Áreas de Atuação</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                            {tutors.map((tutor) => (
                                <tr key={tutor.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {tutor.photo && <img className="h-8 w-8 rounded-full mr-3 border dark:border-neutral-700" src={tutor.photo} alt="" />}
                                            <div className="text-sm font-medium text-neutral-900 dark:text-white">{tutor.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{tutor.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{tutor.subjects?.join(', ')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => { setEditingTutor(tutor); setShowTutorForm(true); }} className="text-primary-600 hover:text-primary-900 mr-4">Editar</button>
                                        <button onClick={() => handleDeleteTutor(tutor.id)} className="text-danger-600 hover:text-danger-900">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            </>
            )}
        </div>
    );

    const renderProjectsSection = () => (
        <div className="space-y-6">
            {!hasPermission('projects') ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mb-2">Sem Permissão</h3>
                    <p className="text-neutral-500 max-w-sm">Você não tem acesso para gerenciar <strong>Projetos</strong>.</p>
                </div>
            ) : (<>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Projetos</h2>
                    <button onClick={() => openAudit('projects', 'Projetos')} title="Ver histórico" className="p-2 rounded-xl text-neutral-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">🕐</button>
                </div>
                <button onClick={() => { setEditingProject(null); setShowProjectForm(true); }} className="btn-primary">Novo Projeto</button>
            </div>
            {showProjectForm ? (
                <ProjectForm
                    project={editingProject}
                    onSuccess={handleProjectSuccess}
                    onCancel={() => { setShowProjectForm(false); setEditingProject(null); }}
                />
            ) : (
                <div className="bg-white dark:bg-neutral-800 shadow rounded-lg overflow-x-auto border dark:border-neutral-700">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                        <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Título</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Imagens</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                            {projects.map((project) => (
                                <tr key={project.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">{project.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                                        {new Date(project.date).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                                        {project.images?.length || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => { setEditingProject(project); setShowProjectForm(true); }} className="text-primary-600 hover:text-primary-900 mr-4">Editar</button>
                                        <button onClick={() => handleDeleteProject(project.id)} className="text-danger-600 hover:text-danger-900">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            </>
            )}
        </div>
    );

    const renderArticlesSection = () => (
        <div className="space-y-6">
            {!hasPermission('newsletter') ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mb-2">Sem Permissão</h3>
                    <p className="text-neutral-500 max-w-sm">Você não tem acesso para gerenciar <strong>Newsletter</strong>.</p>
                </div>
            ) : (<>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Newsletter &amp; Artigos</h2>
                    <button onClick={() => openAudit('newsletter', 'Newsletter')} title="Ver histórico" className="p-2 rounded-xl text-neutral-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">🕐</button>
                </div>
                <button onClick={() => { setEditingArticle(null); setShowArticleForm(true); }} className="btn-primary">Nova Publicação</button>
            </div>
            {showArticleForm ? (
                <ArticleForm
                    article={editingArticle}
                    onSuccess={handleArticleSuccess}
                    onCancel={() => { setShowArticleForm(false); setEditingArticle(null); }}
                />
            ) : (
                <div className="bg-white dark:bg-neutral-800 shadow rounded-lg overflow-x-auto border dark:border-neutral-700">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                        <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Título</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Tags</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                            {articles.map((article) => (
                                <tr key={article.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">{article.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                                        {article.tags?.map((tag: string) => (
                                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 mr-1">
                                                {tag}
                                            </span>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${article.isPublished ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400' : 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-400'}`}>
                                            {article.isPublished ? 'Publicado' : 'Rascunho'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => { setEditingArticle(article); setShowArticleForm(true); }} className="text-primary-600 hover:text-primary-900 mr-4">Editar</button>
                                        <button onClick={() => handleDeleteArticle(article.id)} className="text-danger-600 hover:text-danger-900">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            </>
            )}
        </div>
    );

    const renderPartnersSection = () => (
        <div className="space-y-6">
            {!hasPermission('partners') ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mb-2">Sem Permissão</h3>
                    <p className="text-neutral-500 max-w-sm">Você não tem acesso para gerenciar <strong>Parcerias</strong>.</p>
                </div>
            ) : (<>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Gerenciar Parcerias</h2>
                    <button onClick={() => openAudit('partners', 'Parcerias')} title="Ver histórico" className="p-2 rounded-xl text-neutral-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">🕐</button>
                </div>
                <button onClick={() => { setEditingPartner(null); setShowPartnerForm(true); }} className="btn-primary">Nova Parceria</button>
            </div>
            {showPartnerForm ? (
                <PartnerForm
                    partner={editingPartner}
                    onSuccess={handlePartnerSuccess}
                    onCancel={() => { setShowPartnerForm(false); setEditingPartner(null); }}
                />
            ) : (
                <div className="bg-white dark:bg-neutral-800 shadow rounded-lg overflow-x-auto border dark:border-neutral-700">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                        <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Logo / Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Site</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                            {partners.length > 0 ? (
                                partners.map((partner) => (
                                <tr key={partner.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img className="h-10 w-10 object-contain mr-3 border rounded p-1 bg-white" src={partner.imageUrl} alt="" />
                                            <div>
                                                <div className="text-sm font-medium text-neutral-900 dark:text-white">{partner.name}</div>
                                                <div className="flex gap-1 mt-1">
                                                    {partner.isLeaguePartner ? (
                                                        <span className="px-2 py-0.5 text-[10px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-full uppercase">Liga</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 text-[10px] font-bold bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 rounded-full uppercase">Evento</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                                            {partner.websiteUrl ? (
                                                <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                                                    Link
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => { setEditingPartner(partner); setShowPartnerForm(true); }} className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 mr-4">Editar</button>
                                            <button onClick={() => handleDeletePartner(partner.id)} className="text-danger-600 dark:text-danger-400 hover:text-danger-900 dark:hover:text-danger-300">Excluir</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-10 text-center text-neutral-500 dark:text-neutral-400">
                                        Nenhum parceiro cadastrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            </>
            )}
        </div>
    );

    return (
        <>
        <AuditModal
            isOpen={auditModal.isOpen}
            onClose={() => setAuditModal({ isOpen: false, resource: '', label: '' })}
            resource={auditModal.resource}
            resourceLabel={auditModal.label}
        />
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="section-title">Painel Administrativo</h1>
                        <p className="text-neutral-600 dark:text-neutral-400">Bem-vindo, {user.name}!</p>
                    </div>
                    <div className="flex space-x-2 md:space-x-4">
                        {activeSection && (
                            <button onClick={() => setActiveSection('')} className="btn-secondary flex items-center justify-center" title="Voltar ao Menu">
                                <span className="hidden md:inline">Voltar ao Menu</span>
                                <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </button>
                        )}
                        <button onClick={handleLogout} className="btn-secondary flex items-center justify-center" title="Sair">
                            <span className="hidden md:inline">Sair</span>
                            <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    </div>
                </div>

                {activeSection === 'members' && renderMembersSection()}
                {activeSection === 'tutors' && renderTutorsSection()}
                {activeSection === 'projects' && renderProjectsSection()}
                {activeSection === 'articles' && renderArticlesSection()}
                {activeSection === 'partners' && renderPartnersSection()}
                {activeSection === 'events' && renderEventsSection()}
                {activeSection === 'config' && renderConfigSection()}

                {!activeSection && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="card p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveSection('members')}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Membros</h3>
                                <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-4">Gerenciar diretoria e membros.</p>
                            <button className="btn-primary w-full">Gerenciar</button>
                        </div>

                        <div className="card p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveSection('tutors')}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Tutores</h3>
                                <svg className="w-8 h-8 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-4">Gerenciar professores e tutores.</p>
                            <button className="btn-primary w-full">Gerenciar</button>
                        </div>

                        <div className="card p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveSection('projects')}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Projetos</h3>
                                <svg className="w-8 h-8 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-4">Galeria de projetos realizados.</p>
                            <button className="btn-primary w-full">Gerenciar</button>
                        </div>

                        <div className="card p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveSection('articles')}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Newsletter</h3>
                                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-4">Notícias, artigos e novidades.</p>
                            <button className="btn-primary w-full">Gerenciar</button>
                        </div>

                        <div className="card p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveSection('partners')}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Parcerias</h3>
                                <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-4">Gerenciar empresas e instituições parceiras.</p>
                            <button className="btn-primary w-full">Gerenciar</button>
                        </div>

                        <div className="card p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveSection('config')}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-neutral-900">Configurações</h3>
                                <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <p className="text-neutral-600 mb-4">Processo Seletivo e sistema.</p>
                            <button className="btn-primary w-full">Configurar</button>
                        </div>

                        <div className="card p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveSection('events')}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-neutral-900">Eventos</h3>
                                <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <p className="text-neutral-600 mb-4">Gerenciar eventos e palestras.</p>
                            <button className="btn-primary w-full">Gerenciar</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
        {/* Security Verification Modal */}
        {securityModal.isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in duration-300">
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-red-500/10 text-red-600 rounded-xl">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Confirmação de Segurança</h3>
                                <p className="text-sm text-neutral-500">Ação Restrita a Master Admin</p>
                            </div>
                        </div>

                        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                            Para confirmar a exclusão <strong>irreversível</strong> deste evento, digite sua senha de administrador abaixo.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    Sua Senha Atual
                                </label>
                                <input 
                                    type="password"
                                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    placeholder="••••••••"
                                    value={securityModal.password}
                                    onChange={(e) => setSecurityModal(prev => ({ ...prev, password: e.target.value }))}
                                    onKeyDown={(e) => e.key === 'Enter' && confirmDeleteEvent()}
                                    autoFocus
                                />
                            </div>

                            {securityModal.error && (
                                <p className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20 font-medium">
                                    {securityModal.error}
                                </p>
                            )}

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setSecurityModal({ ...securityModal, isOpen: false })}
                                    className="flex-1 px-4 py-2 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={confirmDeleteEvent}
                                    disabled={securityModal.loading || !securityModal.password}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-lg shadow-red-600/20"
                                >
                                    {securityModal.loading ? 'Verificando...' : 'Confirmar Exclusão'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
        {/* FAQ Manager Modal */}
        {faqManager.isOpen && faqManager.event && (
            <FAQManagerModal 
                event={faqManager.event} 
                onClose={() => setFaqManager({ isOpen: false, event: null })} 
            />
        )}
        </>
    );
};

export default Admin;
