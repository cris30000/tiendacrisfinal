import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const clientesAPI = {
    getAll: () => api.get('/clientes'),
    getById: (id) => api.get(`/clientes/${id}`),
    create: (data) => api.post('/clientes', data),
    update: (id, data) => api.put(`/clientes/${id}`, data),
    delete: (id) => api.delete(`/clientes/${id}`)
};

export const productosAPI = {
    getAll: () => api.get('/productos'),
    getById: (id) => api.get(`/productos/${id}`),
    create: (data) => api.post('/productos', data),
    update: (id, data) => api.put(`/productos/${id}`, data),
    delete: (id) => api.delete(`/productos/${id}`)
};

export const proveedoresAPI = {
    getAll: () => api.get('/proveedores'),
    getById: (id) => api.get(`/proveedores/${id}`),
    create: (data) => api.post('/proveedores', data),
    update: (id, data) => api.put(`/proveedores/${id}`, data),
    delete: (id) => api.delete(`/proveedores/${id}`)
};

export const pedidosAPI = {
    getAll: () => api.get('/pedidos'),
    getById: (id) => api.get(`/pedidos/${id}`),
    create: (data) => api.post('/pedidos', data),
    update: (id, data) => api.put(`/pedidos/${id}`, data),
    delete: (id) => api.delete(`/pedidos/${id}`)
};