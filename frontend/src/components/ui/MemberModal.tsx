import React, { useEffect, useState } from 'react';
import { FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';
import TechBackground from './TechBackground';

// Interface defining the Member object structure
interface Member {
    id: number;
    name: string;
    email: string;
    role: string;
    isFounder?: boolean;
    photo?: string;
    course?: string;
    bio?: string;
    linkedin?: string;
    github?: string;
    isActive?: boolean;
}

// Props interface for the Modal component
interface MemberModalProps {
    member: Member | null;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * MemberModal Component
 * Implements a high-end Tech/AI aesthetic modal with particle background.
 * Follows strict "Initial Request" specs:
 * - Centralized white minimalist card
 * - Dark blue tech background (#0b132b)
 * - Scale 0.92 -> 1 opening animation
 * - 300ms duration
 */
const MemberModal: React.FC<MemberModalProps> = ({ member, isOpen, onClose }) => {
    const [shouldRender, setShouldRender] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Handle Animation Lifecycle
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            // Slight delay to allow DOM to mount with initial state before animating
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setShouldRender(false), 300); // 300ms exit animation
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Handle ESC key
    useEffect(() => {
        if (!isOpen) return;

        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!shouldRender || !member) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center`}
            role="dialog"
            aria-modal="true"
        >
            {/* Background Layer: Fade + Blur + Tech Particles */}
            <div
                className={`
                    fixed inset-0 
                    transition-all duration-300 ease-out
                    ${isVisible ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 backdrop-blur-none'}
                `}
                aria-hidden="true"
            >
                {/* Background Click Handler */}
                <div className="absolute inset-0 bg-[#0b132b] bg-opacity-95" onClick={onClose}></div>

                {/* Tech Background: Strictly configured */}
                <div className="absolute inset-0 pointer-events-none opacity-60">
                    <TechBackground
                        mode="absolute"
                        backgroundColor="transparent"
                        colors={['#4cc9f0', '#00f5d4', '#0b132b']}
                    />
                </div>
            </div>

            {/* Modal Card */}
            <div
                className={`
                    relative z-10 w-full max-w-[420px] mx-4
                    bg-white dark:bg-neutral-900
                    rounded-2xl 
                    shadow-[0_0_40px_rgba(76,201,240,0.3)]
                    p-8 flex flex-col items-center
                    transform transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)
                    ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-[0.92] opacity-0 translate-y-4'}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button (Discrete) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-neutral-300 hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-300 transition-colors rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    aria-label="Close"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* Avatar with Glow */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-secondary-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                    <img
                        src={member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                        alt={member.name}
                        className="relative w-28 h-28 rounded-full object-cover border-4 border-white dark:border-neutral-800 shadow-md"
                    />
                </div>

                {/* Header Info */}
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white text-center mb-1">{member.name}</h2>
                <div className="flex items-center gap-2 mb-6">
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary-500 shadow-[0_0_5px_#4cc9f0]"></span>
                    <p className="text-xs font-bold text-secondary-600 dark:text-secondary-400 uppercase tracking-widest">
                        {member.role === 'member' ? 'Membro' : member.role}
                    </p>
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary-500 shadow-[0_0_5px_#4cc9f0]"></span>
                </div>

                {/* Bio / Status */}
                <div className="w-full text-center space-y-4 mb-8">
                    {member.bio && (
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed px-2 font-light">
                            {member.bio}
                        </p>
                    )}

                    {member.isActive !== undefined && (
                        <div className={`
                            inline-flex items-center px-3 py-1 rounded-full border 
                            ${member.isActive
                                ? 'bg-success-50 border-success-100 text-success-700 dark:bg-success-900/20 dark:border-success-800 dark:text-success-400'
                                : 'bg-neutral-50 border-neutral-100 text-neutral-500 dark:bg-neutral-800/50 dark:border-neutral-700 dark:text-neutral-500'}
                        `}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${member.isActive ? 'bg-success-500' : 'bg-neutral-400'}`}></span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                {member.isActive ? 'Ativo' : 'Ex-membro'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Contact & Socials */}
                <div className="w-full space-y-3">
                    {member.email && (
                        <div className="flex items-center justify-center gap-2 text-neutral-400 dark:text-neutral-500 hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors group cursor-pointer">
                            <FaEnvelope size={12} className="group-hover:animate-bounce" />
                            <a href={`mailto:${member.email}`} className="text-sm font-medium">{member.email}</a>
                        </div>
                    )}

                    <div className="flex justify-center gap-6 mt-4 pt-6 border-t border-neutral-100 dark:border-neutral-800 w-full">
                        {member.linkedin && (
                            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-neutral-300 dark:text-neutral-600 hover:text-[#0077b5] dark:hover:text-[#0077b5] transition-all hover:scale-110 hover:-translate-y-1">
                                <FaLinkedin size={22} />
                            </a>
                        )}
                        {member.github && (
                            <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-neutral-300 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-white transition-all hover:scale-110 hover:-translate-y-1">
                                <FaGithub size={22} />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberModal;
