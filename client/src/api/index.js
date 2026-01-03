import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Teams API
export const teamsApi = {
    getAll: () => api.get('/teams'),
    getById: (id) => api.get(`/teams/${id}`),
    create: (data) => api.post('/teams', data),
    update: (id, data) => api.put(`/teams/${id}`, data),
    delete: (id) => api.delete(`/teams/${id}`),
    getPlayers: (id) => api.get(`/teams/${id}/players`),
};

// Players API
export const playersApi = {
    getAll: (filters = {}) => api.get('/players', { params: filters }),
    getById: (id) => api.get(`/players/${id}`),
    create: (data) => api.post('/players', data),
    update: (id, data) => api.put(`/players/${id}`, data),
    delete: (id) => api.delete(`/players/${id}`),
};

// Stats API
export const statsApi = {
    get: () => api.get('/stats'),
};

export default api;
