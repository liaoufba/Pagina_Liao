import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import type { Partner } from '../../models/Partner';
import CollectionLayout from '../layouts/CollectionLayout';
import FadeInSection from '../../components/EventDetails/FadeInSection';
import PartnerCard from '../../components/domain/PartnerCard';
import PartnershipCTA from '../../components/domain/PartnershipCTA';
import { FiMail } from 'react-icons/fi';

const Partnerships: React.FC = () => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const response = await apiService.getPartners();
                const allPartners = response.data || [];
                // Filter league-wide partners
                setPartners(allPartners.filter((p: Partner) => p.isLeaguePartner));
            } catch (error) {
                console.error('Error fetching partners:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPartners();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600"></div>
            </div>
        );
    }

    return (
        <CollectionLayout
            title="Nossos Parceiros"
            subtitle="Conectando academia e indústria através de parcerias estratégicas."
        >
            {(viewMode) => (
                <div className="col-span-full">
                    {partners.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border dark:border-neutral-800 transition-colors">
                            <p className="text-neutral-500 dark:text-neutral-400 text-xl font-medium">
                                Estamos em busca de novas parcerias para expandir horizontes!
                            </p>
                            <a 
                                href="mailto:contato@liao.com"
                                className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-full font-bold hover:bg-primary-700 transition-colors inline-flex items-center gap-2 mx-auto"
                            >
                                <FiMail /> Entre em contato
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-16">
                            <div className={`
                                grid gap-8 
                                ${viewMode === 'card' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : ''}
                                ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5' : ''}
                                ${viewMode === 'list' ? 'grid-cols-1' : ''}
                            `}>
                                {partners.map((partner, index) => (
                                    <FadeInSection key={partner.id} delay={`delay-${index * 100}`}>
                                        <PartnerCard partner={partner} viewMode={viewMode} />
                                    </FadeInSection>
                                ))}
                            </div>

                            <PartnershipCTA />
                        </div>
                    )}
                </div>
            )}
        </CollectionLayout>
    );
};

export default Partnerships;
