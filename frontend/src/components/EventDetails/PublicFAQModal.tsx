import React from 'react';
import { IoCloseOutline as Close, IoHelpCircleOutline as Help } from 'react-icons/io5';
import EventFAQ from './EventFAQ';

interface PublicFAQModalProps {
    isOpen: boolean;
    onClose: () => void;
    faqs: any[];
    eventTitle: string;
    palette: string[];
}

const PublicFAQModal: React.FC<PublicFAQModalProps> = ({ 
    isOpen, 
    onClose, 
    faqs, 
    eventTitle,
    palette 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            {/* Backdrop with extreme blur and dark tint */}
            <div 
                className="absolute inset-0 bg-neutral-950/80 backdrop-blur-xl animate-in fade-in duration-500"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-neutral-900/90 border border-white/10 rounded-[var(--event-radius-lg)] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-500">
                
                {/* Visual Accent - Top Gradient Line */}
                <div 
                    className="h-1.5 w-full bg-gradient-to-r"
                    style={{ 
                        backgroundImage: `linear-gradient(to right, ${palette[0]}, ${palette[1] || palette[0]})` 
                    }}
                ></div>

                {/* Header */}
                <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div 
                            className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10"
                            style={{ color: palette[0] }}
                        >
                            <Help size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-white leading-none">Dúvidas Frequentes</h2>
                            <p className="text-neutral-500 text-sm mt-1">{eventTitle}</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={onClose}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all hover:scale-110 active:scale-95"
                    >
                        <Close size={24} />
                    </button>
                </div>

                {/* FAQ Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                    {faqs.length > 0 ? (
                        <div className="max-w-3xl mx-auto">
                           <EventFAQ faqs={faqs} isEmbedded={true} />
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-neutral-500 text-center">
                            <Help size={48} className="mb-4 opacity-20" />
                            <p>Nenhuma dúvida cadastrada ainda.</p>
                        </div>
                    )}
                </div>

                {/* Footer / CTA inside modal */}
                <div className="p-6 bg-white/[0.02] border-t border-white/5 text-center">
                    <p className="text-neutral-500 text-sm">
                        Ainda tem dúvidas? Entre em contato com a equipe organizadora.
                    </p>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
};

export default PublicFAQModal;
