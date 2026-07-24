import React, { useEffect, useState } from 'react';
import { FiMail } from 'react-icons/fi';
import { apiService } from '../../services/api';
import FadeInSection from '../EventDetails/FadeInSection';

const PartnershipCTA: React.FC = () => {
    const [email, setEmail] = useState('contato@liao.com');

    useEffect(() => {
        const fetchEmail = async () => {
            try {
                const response = await apiService.getConfig('CONTACT_EMAIL');
                if (response.success && response.data) {
                    setEmail(response.data);
                }
            } catch (error) {
                console.error('Error fetching contact email:', error);
            }
        };
        fetchEmail();
    }, []);

    return (
        <FadeInSection delay="delay-500" className="pt-8">
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Torne-se um parceiro LIAO
                    </h2>
                    <p className="text-primary-50/90 text-lg mb-8">
                        Sua empresa pode colaborar com pesquisas de ponta, eventos exclusivos e recrutamento de talentos excepcionais.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a 
                            href={`mailto:${email}`}
                            className="bg-white text-primary-700 hover:bg-neutral-100 px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 shadow-lg"
                        >
                            <FiMail size={18} /> Solicitar Proposta
                        </a>
                    </div>
                </div>
                
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full -mr-48 -mb-48 blur-3xl"></div>
            </div>
        </FadeInSection>
    );
};

export default PartnershipCTA;
