import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Member } from '../models/Member';
import type { Tutor } from '../models/Tutor';
import type { Content } from '../models/Content';

export const useLiaoData = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [notices, setNotices] = useState<Content[]>([]);
    const [faqs, setFaqs] = useState<Content[]>([]);
    const [videos, setVideos] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [membersRes, tutorsRes, noticesRes, faqsRes, videosRes] =
                await Promise.all([
                    apiService.getMembers(),
                    apiService.getTutors(),
                    apiService.getContentByType('notice'),
                    apiService.getContentByType('faq'),
                    apiService.getContentByType('video'),
                ]);

            setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
            setTutors(Array.isArray(tutorsRes.data) ? tutorsRes.data : []);
            setNotices(Array.isArray(noticesRes.data) ? noticesRes.data : []);
            setFaqs(Array.isArray(faqsRes.data) ? faqsRes.data : []);
            setVideos(Array.isArray(videosRes.data) ? videosRes.data : []);
        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        members,
        tutors,
        notices,
        faqs,
        videos,
        loading,
        error,
        refetch: fetchData,
    };
};
