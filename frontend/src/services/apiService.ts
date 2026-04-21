import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            if (typeof config.headers.set === 'function') {
                config.headers.set('Authorization', `Bearer ${token}`);
            } else {
                (config.headers as any)['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Automatisch ausloggen wenn Token ungültig/abgelaufen (401 oder 403)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Prüfen ob es ein Auth-Endpoint ist (Login), dann nicht ausloggen
            const url = error.config?.url || '';
            if (!url.includes('/auth/')) {
                console.warn('Token ungültig oder abgelaufen. Benutzer wird ausgeloggt.');
                localStorage.removeItem('token');
                // Seite neu laden damit AuthContext reagiert
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

// A helper function to inject the auth token into every request
export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export default api;