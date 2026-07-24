import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import MemberCard from '../../components/domain/MemberCard';
import TutorCard from '../../components/domain/TutorCard';
import MemberModal from '../../components/ui/MemberModal';
import PageLayout from '../layouts/PageLayout';
import FilterTabs from '../../components/ui/FilterTabs';
import type { Tutor } from '../../models/Tutor';
import { 
    IoBriefcaseOutline as DirectorsIcon, 
    IoPeopleOutline as MembersIcon, 
    IoRibbonOutline as FoundersIcon, 
    IoSchoolOutline as TutorsIcon 
} from 'react-icons/io5';

interface Member {
    id: number;
    name: string;
    role: string;
    email: string;
    photo?: string;
    bio?: string;
    linkedin?: string;
    github?: string;
    isFounder?: boolean;
    isActive?: boolean;
    year?: number;
    course?: string;
}

const Members: React.FC = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');

    // const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Carousel State
    const [currentIndex, setCurrentIndex] = useState(0);

    // Navigation State
    const [activeTab, setActiveTab] = useState<'directors' | 'members' | 'founders' | 'tutors'>(() => {
        if (tabParam === 'tutors' || tabParam === 'members' || tabParam === 'founders' || tabParam === 'directors') {
            return tabParam as any;
        }
        return 'directors';
    });
    const [selectedYear, setSelectedYear] = useState<number | 'all'>(2026);
    const [mobileViewMode, setMobileViewMode] = useState<'carousel' | 'grid'>('carousel'); // Mobile View Toggle
    const [isPaused, setIsPaused] = useState(false); // Mobile Carousel Pause Toggle

    // Sync active tab with search parameter change
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['directors', 'members', 'founders', 'tutors'].includes(tab)) {
            setActiveTab(tab as any);
        }
    }, [searchParams]);

    const handleTabChange = (tab: 'directors' | 'members' | 'founders' | 'tutors') => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    // Derived Data
    const availableYears = Array.from(new Set(members.map(m => m.year || 2025))).sort((a, b) => b - a);
    // Ensure 2026 is always available if specific requirement
    if (!availableYears.includes(2026)) availableYears.unshift(2026);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [membersRes, tutorsRes] = await Promise.all([
                    apiService.getMembers(),
                    apiService.getTutors()
                ]);
                const membersData = (membersRes.success && Array.isArray(membersRes.data)) ? membersRes.data : [];
                const tutorsData = (tutorsRes.success && (tutorsRes.data?.tutors || tutorsRes.data)) || [];
                setMembers(membersData);
                setTutors(Array.isArray(tutorsData) ? tutorsData : []);
            } catch (err) {
                console.error(err);
            } finally {
                // setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCardClick = (member: Member) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    // Filter Logic
    // Filter Logic
    let filteredMembers = members.filter(member => {
        if (activeTab === 'directors') {
            return member.role !== 'member' && member.isActive !== false;
        }
        if (activeTab === 'founders') {
            return member.isFounder === true;
        }
        if (activeTab === 'members') {
            return selectedYear === 'all' || (member.year === selectedYear || (!member.year && selectedYear === 2025));
        }
        return false;
    });

    // Responsive Carousel Logic
    const [itemsPerView, setItemsPerView] = useState(3);

    useEffect(() => {
        const handleResize = () => {
            setItemsPerView(window.innerWidth < 768 ? 1 : 3);
        };
        handleResize(); // Init
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reset index when tab or filter changes
    useEffect(() => {
        setCurrentIndex(0);
    }, [activeTab, selectedYear]);

    const getListLength = () => activeTab === 'tutors' ? tutors.length : filteredMembers.length;

    // Auto-advance
    useEffect(() => {
        const listLength = getListLength();
        if (listLength <= itemsPerView || isPaused) return;

        const maxIndex = Math.max(0, listLength - itemsPerView);
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }, 3000);
        return () => clearInterval(interval);
    }, [filteredMembers.length, tutors.length, activeTab, itemsPerView, isPaused]);

    const nextSlide = () => {
        const maxIndex = Math.max(0, getListLength() - itemsPerView);
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    };

    const prevSlide = () => {
        const maxIndex = Math.max(0, getListLength() - itemsPerView);
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    };

    // Touch/Swipe Logic (Simple Implementation)
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            nextSlide();
        }
        if (isRightSwipe) {
            prevSlide();
        }

        setTouchStart(0);
        setTouchEnd(0);
    };

    return (
        <PageLayout 
            title="Nossos Membros" 
            subtitle="Conheça as pessoas que fazem a LIAO acontecer"
        >
            {/* Standardized Header Tabs */}
            <FilterTabs
                tabs={[
                    { id: 'directors', label: 'Diretoria Atual', icon: <DirectorsIcon size={18} /> },
                    { id: 'members', label: 'Membros', icon: <MembersIcon size={18} /> },
                    { id: 'founders', label: 'Fundadores', icon: <FoundersIcon size={18} /> },
                    { id: 'tutors', label: 'Tutores', icon: <TutorsIcon size={18} /> }
                ]}
                activeTab={activeTab}
                onChange={handleTabChange}
                className="mb-8"
            />

            {/* Sub-filter (Year Selector) */}
            {activeTab === 'members' && (
                <div className="flex justify-center mb-8">
                    <div className="inline-flex flex-wrap items-center justify-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl border border-neutral-200/60 dark:border-neutral-700/50 shadow-xs">
                        <button
                            type="button"
                            onClick={() => setSelectedYear('all')}
                            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer ${selectedYear === 'all'
                                ? 'bg-white dark:bg-neutral-900 text-primary-600 dark:text-primary-400 font-semibold shadow-xs'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                                }`}
                        >
                            Todos os Anos
                        </button>

                        {availableYears.map(year => (
                            <button
                                key={year}
                                type="button"
                                onClick={() => setSelectedYear(year)}
                                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer ${selectedYear === year
                                    ? 'bg-white dark:bg-neutral-900 text-primary-600 dark:text-primary-400 font-semibold shadow-xs'
                                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                                    }`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>
            )}


            {/* Content Display: Grid (Desktop) vs Mobile (Carousel/Grid) */}
            {itemsPerView === 1 ? (
                /* Mobile View Container */
                <div className="space-y-4">
                    {/* Mobile View Toggle */}
                    {getListLength() > 0 && (
                        <div className="flex justify-end px-4 mb-2">
                            <div className="bg-white dark:bg-neutral-800 rounded-lg p-1 shadow-sm border border-neutral-100 dark:border-neutral-700 flex gap-1">
                                <button
                                    onClick={() => setIsPaused(!isPaused)}
                                    className={`p-2 rounded-md transition-all ${isPaused ? 'bg-danger-50 text-danger-600' : 'text-neutral-400 hover:text-success-600'}`}
                                    title={isPaused ? "Retomar" : "Pausar"}
                                >
                                    {isPaused ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    )}
                                </button>
                                <div className="w-px bg-neutral-200 mx-1 my-1"></div>
                                <button
                                    onClick={() => setMobileViewMode('carousel')}
                                    className={`p-2 rounded-md transition-all ${mobileViewMode === 'carousel' ? 'bg-primary-100 text-primary-700' : 'text-neutral-400 hover:text-neutral-600'}`}
                                    title="Visualização Carrossel"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                </button>
                                <button
                                    onClick={() => setMobileViewMode('grid')}
                                    className={`p-2 rounded-md transition-all ${mobileViewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-neutral-400 hover:text-neutral-600'}`}
                                    title="Visualização em Grade"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {mobileViewMode === 'carousel' ? (
                        /* Mobile Carousel Logic */
                        <>
                            <div
                                className="relative group overflow-hidden"
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                {activeTab === 'tutors' ? (
                                    tutors.length > 0 ? (
                                        <div
                                            className="flex transition-transform duration-500 ease-in-out"
                                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                                        >
                                            {tutors.map((tutor) => (
                                                <div
                                                    key={tutor.id}
                                                    style={{ width: '100%' }}
                                                    className="shrink-0 px-2 sm:px-4"
                                                >
                                                    <div className="h-full flex justify-center">
                                                        <TutorCard tutor={tutor} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-xl shadow-sm">
                                            <p className="text-neutral-500 dark:text-neutral-400 text-lg">
                                                Nenhum tutor disponível no momento.
                                            </p>
                                        </div>
                                    )
                                ) : (
                                    filteredMembers.length > 0 ? (
                                        <div
                                            className="flex transition-transform duration-500 ease-in-out"
                                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                                        >
                                            {filteredMembers.map((member) => (
                                                <div
                                                    key={member.id}
                                                    style={{ width: '100%' }}
                                                    className="shrink-0 px-2 sm:px-4"
                                                >
                                                    <div className="h-full flex justify-center">
                                                        <MemberCard
                                                            member={member}
                                                            onSelect={handleCardClick}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-xl shadow-sm">
                                            <p className="text-neutral-500 dark:text-neutral-400 text-lg">
                                                Nenhum membro encontrado nesta categoria.
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Mobile Indicators */}
                            {getListLength() > 1 && (
                                <div className="flex justify-center mt-4 space-x-2">
                                    {Array.from({ length: getListLength() }).map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-success-600' : 'bg-neutral-300'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        /* Mobile Grid View (New) */
                        <div className="grid grid-cols-2 xs:grid-cols-3 gap-2.5 px-1">
                            {activeTab === 'tutors' ? (
                                tutors.length > 0 ? (
                                    tutors.map((tutor) => (
                                        <div key={tutor.id} className="w-full flex justify-center">
                                            <TutorCard tutor={tutor} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-8">
                                        <p className="text-neutral-500 text-sm">Nenhum tutor disponível.</p>
                                    </div>
                                )
                            ) : (
                                filteredMembers.length > 0 ? (
                                    filteredMembers.map((member) => (
                                        <button
                                            key={member.id}
                                            onClick={() => handleCardClick(member)}
                                            className="flex flex-col items-center bg-white dark:bg-neutral-800 p-2 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-md transition-all active:scale-95"
                                        >
                                            <div className="w-full aspect-square mb-2 relative overflow-hidden rounded-lg">
                                                <img
                                                    src={member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                                                    alt={member.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                                {/* Role Badge (Tiny) */}
                                                {member.role !== 'member' && (
                                                    <div className="absolute top-1 right-1 w-2 h-2 bg-warning-400 rounded-full shadow-sm"></div>
                                                )}
                                            </div>
                                            <span className="text-xs font-semibold text-neutral-800 dark:text-white text-center line-clamp-2 leading-tight w-full">
                                                {member.name}
                                            </span>
                                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 truncate w-full text-center">
                                                {member.role === 'member' ? 'Membro' : member.role}
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-8">
                                        <p className="text-neutral-500 text-sm">Nenhum membro encontrado.</p>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            ) : (
                /* Desktop Grid View */
                <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                    {activeTab === 'tutors' ? (
                        tutors.length > 0 ? (
                            tutors.map((tutor) => (
                                <div key={tutor.id} className="flex justify-center w-full">
                                    <TutorCard tutor={tutor} />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 bg-white dark:bg-neutral-800 rounded-xl shadow-sm">
                                <p className="text-neutral-500 dark:text-neutral-400 text-lg">
                                    Nenhum tutor disponível no momento.
                                </p>
                            </div>
                        )
                    ) : (
                        filteredMembers.length > 0 ? (
                            filteredMembers.map((member) => (
                                <div key={member.id} className="flex justify-center w-full">
                                    <MemberCard
                                        member={member}
                                        onSelect={handleCardClick}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 bg-white dark:bg-neutral-800 rounded-xl shadow-sm">
                                <p className="text-neutral-500 dark:text-neutral-400 text-lg">
                                    Nenhum membro encontrado nesta categoria.
                                </p>
                            </div>
                        )
                    )}
                </div>
            )}

            <MemberModal
                member={selectedMember}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </PageLayout>
    );
};

export default Members;


