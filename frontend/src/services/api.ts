import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// --- Cache Implementation ---
class RequestCache {
    private cache = new Map<string, { data: any; timestamp: number }>();
    private ttl = 5 * 60 * 1000; // 5 minutes Default TTL

    get(key: string) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        if (Date.now() - cached.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        return cached.data;
    }

    set(key: string, data: any) {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    clear(keyPattern: string) {
        for (const key of this.cache.keys()) {
            if (key.includes(keyPattern)) {
                this.cache.delete(key);
            }
        }
    }

    // Helper to generate cache keys
    generateKey(url: string, params?: any) {
        return `${url}:${JSON.stringify(params || {})}`;
    }
}

const reqCache = new RequestCache();

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling and data unwrapping
api.interceptors.response.use(
    (response) => {
        // Automatically extract the main data payload so components don't need to do response.data.data
        return response.data;
    },
    (error: AxiosError) => {
        if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Helper for Cached GET requests
const getCached = async (url: string, params?: any) => {
    const key = reqCache.generateKey(url, params);
    const cached = reqCache.get(key);

    if (cached) {
        // Return a promise that resolves immediately with cached data
        return Promise.resolve(cached);
    }

    const response = await api.get(url, { params });
    // Since interceptor now returns response.data directly, we just store and return it
    reqCache.set(key, response);
    return response;
};

// API methods
export const apiService = {
    // Auth (No Caching)
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),

    register: (email: string, password: string, name: string, permissions: string[] = []) =>
        api.post('/auth/register', { email, password, name, permissions }),

    getCurrentUser: () => api.get('/auth/me'),
    getAdmins: () => api.get('/auth/admins'),
    deleteAdmin: (id: number) => api.delete(`/auth/users/${id}`),

    // Members
    getMembers: () => getCached('/members'),
    getMemberById: (id: number) => getCached(`/members/${id}`),
    createMember: (data: any) => {
        reqCache.clear('/members'); // Invalidate members cache
        return api.post('/members', data);
    },
    updateMember: (id: number, data: any) => {
        reqCache.clear('/members');
        return api.put(`/members/${id}`, data);
    },
    deleteMember: (id: number) => {
        reqCache.clear('/members');
        return api.delete(`/members/${id}`);
    },

    // Tutors
    getTutors: () => getCached('/tutors'),
    getTutorById: (id: number) => api.get(`/tutors/${id}`),
    createTutor: (data: any) => {
        reqCache.clear('/tutors');
        return api.post('/tutors', data);
    },
    updateTutor: (id: number, data: any) => {
        reqCache.clear('/tutors');
        return api.put(`/tutors/${id}`, data);
    },
    deleteTutor: (id: number) => {
        reqCache.clear('/tutors');
        return api.delete(`/tutors/${id}`);
    },

    // Content
    getContentByType: (type: 'notice' | 'faq' | 'video') =>
        getCached(`/content/${type}`), // Cache each type
    getContentById: (id: number) => getCached(`/content/item/${id}`),
    createContent: (data: any) => {
        reqCache.clear('/content');
        return api.post('/content', data);
    },
    updateContent: (id: number, data: any) => {
        reqCache.clear('/content');
        return api.put(`/content/${id}`, data);
    },
    deleteContent: (id: number) => {
        reqCache.clear('/content');
        return api.delete(`/content/${id}`);
    },

    // ProSel
    getProSelInfo: () => getCached('/prosel'),
    submitApplication: (data: any) => api.post('/prosel/apply', data),
    getApplications: () => api.get('/prosel/applications'), // Admin - unlikely to need aggressive caching, but could add
    updateApplicationStatus: (id: number, status: string) =>
        api.put(`/prosel/applications/${id}`, { status }),

    // System Config
    getConfig: (key: string) => getCached(`/config/${key}`),
    updateConfig: (key: string, value: string) => {
        reqCache.clear('/config');
        return api.put(`/config/${key}`, { value });
    },

    // Projects
    getProjects: (params?: any) => getCached('/projects', params),
    createProject: (data: any) => {
        reqCache.clear('/projects');
        return api.post('/projects', data);
    },
    updateProject: (id: number, data: any) => {
        reqCache.clear('/projects');
        return api.put(`/projects/${id}`, data);
    },
    deleteProject: (id: number) => {
        reqCache.clear('/projects');
        return api.delete(`/projects/${id}`);
    },

    // Articles (Newsletter)
    getArticles: () => getCached('/articles'),
    createArticle: (data: any) => {
        reqCache.clear('/articles');
        return api.post('/articles', data);
    },
    updateArticle: (id: number, data: any) => {
        reqCache.clear('/articles');
        return api.put(`/articles/${id}`, data);
    },
    deleteArticle: (id: number) => {
        reqCache.clear('/articles');
        return api.delete(`/articles/${id}`);
    },
    likeArticle: (id: number, action: 'like' | 'unlike') => {
        reqCache.clear('/articles');
        return api.post(`/articles/${id}/like`, { action });
    },

    // Partners
    getPartners: () => getCached('/partners'),
    createPartner: (data: any) => {
        reqCache.clear('/partners');
        return api.post('/partners', data);
    },
    updatePartner: (id: number, data: any) => {
        reqCache.clear('/partners');
        return api.put(`/partners/${id}`, data);
    },
    deletePartner: (id: number) => {
        reqCache.clear('/partners');
        return api.delete(`/partners/${id}`);
    },

    // Events
    getEvents: () => getCached('/events'),
    getEventBySlug: (slug: string) => getCached(`/events/${slug}`),
    createEvent: (data: any) => {
        reqCache.clear('/events');
        return api.post('/events', data);
    },
    updateEvent: (id: number, data: any) => {
        reqCache.clear('/events');
        return api.put(`/events/${id}`, data);
    },
    deleteEvent: (id: number, password?: string) => {
        reqCache.clear('/events');
        return api.post(`/events/${id}/delete`, { password });
    },
    // FAQs
    getFAQsByEvent: (eventId: number) => api.get(`/faqs/event/${eventId}`),
    createFAQ: (data: { eventId: number; question: string; answer: string; order?: number }) => {
        reqCache.clear('/events');
        return api.post('/faqs', data);
    },
    updateFAQ: (id: number, data: { question?: string; answer?: string; order?: number }) => {
        reqCache.clear('/events');
        return api.put(`/faqs/${id}`, data);
    },
    deleteFAQ: (id: number) => {
        reqCache.clear('/events');
        return api.delete(`/faqs/${id}`);
    },
    // Audit Logs
    getAuditLogs: (resource?: string, startDate?: string, endDate?: string) => {
        const params: Record<string, string> = {};
        if (resource) params.resource = resource;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        return api.get('/audit', { params });
    },
};

export default api;
