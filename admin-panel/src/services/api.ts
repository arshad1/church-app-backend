import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor to handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const isLoginRequest = error.config.url.includes('/auth/login');
            if (!isLoginRequest) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                //do not redirect if it is login page
                if (window.location.pathname !== '/admin/login') {
                    window.location.href = '/admin/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    register: (data: any) => api.post('/auth/register', data),
};

// Admin - Members
export const membersAPI = {
    getAll: (params?: any) => api.get('/admin/members', { params }),
    getById: (id: number) => api.get(`/admin/members/${id}`),
    create: (data: any) => api.post('/admin/members', data),
    update: (id: number, data: any) => api.put(`/admin/members/${id}`, data),
    delete: (id: number) => api.delete(`/admin/members/${id}`),
    deleteBulk: (ids: number[]) => api.post('/admin/members/delete-bulk', { ids }),
    approve: (id: number) => api.post(`/admin/members/${id}/approve`),
    getByFamily: (familyId: number) => api.get(`/admin/members/family/${familyId}`),
};

// Admin - Families
export const familiesAPI = {
    getAll: () => api.get('/admin/families'),
    getById: (id: number) => api.get(`/admin/families/${id}`),
    create: (data: any) => api.post('/admin/families', data),
    update: (id: number, data: any) => api.put(`/admin/families/${id}`, data),
    delete: (id: number) => api.delete(`/admin/families/${id}`),
    addRelated: (id: number, relatedFamilyId: number) => api.post(`/admin/families/${id}/related`, { relatedFamilyId }),
    removeRelated: (id: number, relatedFamilyId: number) => api.delete(`/admin/families/${id}/related/${relatedFamilyId}`),
};

// Admin - Ministries
export const ministriesAPI = {
    getAll: () => api.get('/admin/ministries'),
    getById: (id: number) => api.get(`/admin/ministries/${id}`),
    create: (data: any) => api.post('/admin/ministries', data),
    update: (id: number, data: any) => api.put(`/admin/ministries/${id}`, data),
    delete: (id: number) => api.delete(`/admin/ministries/${id}`),
    addMember: (id: number, userId: number) => api.post(`/admin/ministries/${id}/members`, { userId }),
    removeMember: (id: number, userId: number) => api.delete(`/admin/ministries/${id}/members/${userId}`),
    assignLeader: (id: number, userId: number) => api.post(`/admin/ministries/${id}/leader`, { userId }),
};

// Admin - Events
export const eventsAPI = {
    getAll: () => api.get('/admin/events'),
    getById: (id: number) => api.get(`/admin/events/${id}`),
    create: (data: any) => api.post('/admin/events', data),
    update: (id: number, data: any) => api.put(`/admin/events/${id}`, data),
    delete: (id: number) => api.delete(`/admin/events/${id}`),
    publish: (id: number) => api.post(`/admin/events/${id}/publish`),
};

// Admin - Sacraments
export const sacramentsAPI = {
    getAll: (params?: any) => api.get('/admin/sacraments', { params }),
    getByMember: (memberId: number) => api.get(`/admin/sacraments/member/${memberId}`),
    create: (data: any) => api.post('/admin/sacraments', data),
    update: (id: number, data: any) => api.put(`/admin/sacraments/${id}`, data),
    delete: (id: number) => api.delete(`/admin/sacraments/${id}`),
};

// Admin - Reports
export const reportsAPI = {
    getDashboard: () => api.get('/admin/reports/dashboard'),
    getMemberGrowth: (months?: number) =>
        api.get('/admin/reports/member-growth', { params: { months } }),
};

// Admin - Gallery
export const galleryAPI = {
    // Categories
    createCategory: (name: string) => api.post('/admin/gallery/categories', { name }),
    getAllCategories: () => api.get('/admin/gallery/categories'),
    updateCategory: (id: number, name: string) => api.put(`/admin/gallery/categories/${id}`, { name }),
    deleteCategory: (id: number) => api.delete(`/admin/gallery/categories/${id}`),

    // Albums
    createAlbum: (data: any) => api.post('/admin/gallery/albums', data),
    getAllAlbums: (categoryId?: number) => api.get('/admin/gallery/albums', { params: { categoryId } }),
    getAlbumById: (id: number) => api.get(`/admin/gallery/albums/${id}`),
    updateAlbum: (id: number, data: any) => api.put(`/admin/gallery/albums/${id}`, data),
    deleteAlbum: (id: number) => api.delete(`/admin/gallery/albums/${id}`),

    // Images
    addImages: (albumId: number, imageUrls: string[]) => api.post(`/admin/gallery/albums/${albumId}/images`, { imageUrls }),
    deleteImage: (id: number) => api.delete(`/admin/gallery/images/${id}`),
};

// Admin - Settings
export const settingsAPI = {
    get: () => api.get('/admin/settings'),
    update: (data: any) => api.put('/admin/settings', data),
};

export const uploadsAPI = {
    upload: (file: File, onProgress?: (progress: number) => void) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/common/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            },
        });
    },
};

export const notificationsAPI = {
    // Admin: Send to specific user
    sendToUser: (userId: number, title: string, body: string, data?: object) =>
        api.post('/notifications/send-user', { userId, title, body, data }),

    // Admin: Broadcast
    broadcast: (title: string, body: string, data?: object, draft: boolean = false) =>
        api.post('/notifications/broadcast', { title, body, data, draft }),

    // Admin: Update Broadcast (Draft)
    updateBroadcast: (id: number, title: string, body: string, data?: object, sendNow: boolean = false) =>
        api.put(`/notifications/broadcast/${id}`, { title, body, data, sendNow }),

    // Admin: History
    getHistory: () => api.get('/notifications/broadcasts'),
};

export const usersAPI = {
    getAll: (params?: any) => api.get('/users', { params }),
    getById: (id: number) => api.get(`/users/${id}`),
    create: (data: any) => api.post('/users', data),
    update: (id: number, data: any) => api.put(`/users/${id}`, data),
    delete: (id: number) => api.delete(`/users/${id}`),
    deleteBulk: (userIds: number[]) => api.post('/users/delete-bulk', { userIds }),
};

export const housesAPI = {
    create: (data: { name: string; familyId: number; headMemberId?: number; headMemberData?: any }) =>
        api.post('/admin/houses', data),
    getByFamily: (familyId: number) => api.get(`/admin/houses/family/${familyId}`),
    getById: (id: number) => api.get(`/admin/houses/${id}`),
    update: (id: number, data: { name: string }) => api.put(`/admin/houses/${id}`, data),
    delete: (id: number) => api.delete(`/admin/houses/${id}`),
};

export const contentAPI = {
    // Generic Content (e.g., BIBLE_VERSE)
    getAll: (type: string) => api.get(`/admin/content/${type}`),
    create: (data: any) => api.post('/admin/content', data),
    update: (id: number, data: any) => api.put(`/admin/content/${id}`, data),
    delete: (id: number) => api.delete(`/admin/content/${id}`),
};

export default api;
