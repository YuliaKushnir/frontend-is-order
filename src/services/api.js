import axios from "axios";

// const API_URL = window.location.origin + '/api';
const API_URL = '/api';

const api = axios.create({
    baseURL:API_URL
});

api.interceptors.request.use((config) => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');


    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log("config.headers['Authorization'] = `Bearer ${token}`; = ", config.headers['Authorization'])
    }

    if (userId) {
        config.headers['X-User-ID'] = userId;
                console.log("config.headers['X-User-ID'] ", config.headers['X-User-ID'])

    }
    

    return config;
}
);

const unauthorizedApi = axios.create({ baseURL:API_URL});


export const getAllProducts = (filters) => unauthorizedApi.post('/products/_list', filters);
export const addProduct = (formData) => api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" }, });
export const getProductById = (id) => unauthorizedApi.get(`/products/${id}`);
export const updateProduct = (id, formData) => api.patch(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }, });
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const searchProducts = (query) => unauthorizedApi.get(`/products/search?query=${query}`);

export const getAllCategories = () => unauthorizedApi.get('/categories');
export const addCategory = (category) => api.post("/categories", category);
export const getCategoryById = (id) => unauthorizedApi.get(`/categories/${id}`);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// --- Stock ---
export const addOrUpdateStock = (dto) => api.post("/stocks", dto);
export const getStockByProduct = (productId) => unauthorizedApi.get(`/stocks/product/${productId}`);
export const getStockByProductAlt = (productId) => api.get(`/stocks/by-product/${productId}`);
export const incrementStock = (id, dto) => api.patch(`/stocks/${id}/increment`, dto);
export const decrementStock = (id, quantity) => api.patch(`/stocks/${id}/decrement?quantity=${quantity}`);
export const getAllStock = () => api.get("/stocks/all");

// Images 
// export const generateImage =(prompt) => unauthorizedApi.post("/images/generate", {prompt});

/* ===================== PRINTS ===================== */
export const getAllPrintTypes = () => unauthorizedApi.get("/print-types");
export const getPrintPricesByType = (typeId) => unauthorizedApi.get(`/print-prices/${typeId}`);
export const getPrintPrice = (typeId, size) => unauthorizedApi.get(`/print-prices/price?typeId=${typeId}&size=${size}`);

/* ===================== USERS ===================== */
export const registerUser = (user) => api.post("/users/register", user);
export const getAllUsers = () => api.get("/users");
export const getUserById = (userId) => api.get(`/users/${userId}`);
export const validateUser = (userId) => api.get(`/users/${userId}/validate`);
export const updateUserPersonalData = (userId, data) => api.put(`/users/${userId}/personal-data`, data);
export const deleteUser = (keycloakId) => api.delete(`/users/${keycloakId}`);
export const updateUserRole = (keycloakId, role) => api.put(`/users/${keycloakId}/role`, { role });
export const getUsersByRole = (role) => api.get(`/users/role/${role}`);

/* ===================== ORDERS ===================== */
export const createOrder = (formData) => api.post("/orders", formData, {
    headers: { "Content-Type": "multipart/form-data" }, });
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const patchOrder = (id, data) => api.patch(`/orders/${id}`, data);
export const getAllOrders = (params) => api.get("/orders", { params });
export const getUserOrders = (userId) => api.get(`/orders/user/${userId}`);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);
export const updateOrder = (id, formData) => api.put(`/orders/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getOrderStatistics = (data) => api.post("/orders/statistics", data);
