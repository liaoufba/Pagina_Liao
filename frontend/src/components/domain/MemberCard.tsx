import { FaLinkedin, FaGithub } from 'react-icons/fa';

interface MemberCardProps {
    member: {
        id: number;
        name: string;
        role: string;
        photo?: string;
        bio?: string;
        linkedin?: string;
        github?: string;
        isFounder?: boolean;
        isActive?: boolean;
        course?: string;
    };
    onSelect: (member: any) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, onSelect }) => {
    return (
        <div
            onClick={() => onSelect(member)}
            className="group relative w-[230px] min-h-[350px] flex flex-col rounded-2xl p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer items-center text-center gap-2"
        >
            {/* Avatar with Subtle Border */}
            <div className="relative mb-1">
                <div className="w-24 h-24 p-0.5 rounded-full border-2 border-neutral-200 dark:border-neutral-700 group-hover:border-primary-500 transition-colors">
                    <img
                        src={member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                        alt={member.name}
                        className="w-full h-full object-cover rounded-full"
                    />
                </div>
            </div>

                {/* Typography */}
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-sans leading-tight">{member.name}</h3>

                {member.course && (
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300 italic mb-1">
                        {member.course}
                    </p>
                )}

                <p className="text-xs font-medium text-transparent bg-clip-text bg-gradient-to-r from-danger-600 to-success-600 uppercase tracking-wide">
                    {member.role === 'member' ? 'Membro' : member.role}
                </p>

                {/* Status Text (Vigente / Não Vigente) */}
                {member.isActive !== undefined && (
                    <p className={`text-[10px] font-semibold ${member.isActive ? 'text-success-600' : 'text-danger-500'}`}>
                        {member.isActive ? 'Vigente 2026' : 'Ex-membro'}
                    </p>
                )}

                {/* Social Links */}
                <div className="flex justify-center gap-3 mb-2 mt-2" onClick={(e) => e.stopPropagation()}>
                    {member.linkedin ? (
                        <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-400 hover:text-primary-600 transition-colors transform hover:scale-110"
                        >
                            <FaLinkedin size={20} />
                        </a>
                    ) : (
                        <span className="text-neutral-200"><FaLinkedin size={20} /></span>
                    )}

                    {member.github ? (
                        <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-400 hover:text-neutral-900 transition-colors transform hover:scale-110"
                        >
                            <FaGithub size={20} />
                        </a>
                    ) : (
                        <span className="text-neutral-200"><FaGithub size={20} /></span>
                    )}
                </div>

                <div className="flex-grow"></div>

                {/* Pill Button - LIAO Green Secondary */}
                <button
                    className="w-3/5 py-1.5 px-4 rounded-full text-white font-semibold text-xs shadow-md transform transition-transform group-hover:scale-105 active:scale-95 bg-liao-green hover:bg-success-700 transition-colors"
                >
                    Sobre
                </button>
        </div>
    );
};

export default MemberCard;
