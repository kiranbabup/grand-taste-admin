import API from "./api";

/**
 * Get monthly income data
 * @returns {Promise<Object>}
 */
export const getMonthlyIncome = async () => {
  try {
    const response = await API.get("/admin/monthly-income");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get yearly income data
 * @returns {Promise<Object>}
 */
export const getYearlyIncome = async () => {
  try {
    const response = await API.get("/admin/yearly-income");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get total sales report
 * @returns {Promise<Object>}
 */
export const getTotalSalesReport = async () => {
  try {
    const response = await API.get("/admin/total-sale-report");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get dashboard stats
 * @returns {Promise<Object>}
 */
export const getDashboardStats = async () => {
  try {
    const response = await API.get("/admin/dashboard-stats");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get all admins with pagination
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<Object>}
 */
export const getAllAdmins = async (page = 1, limit = 10) => {
  try {
    const response = await API.get(`/admin/all-admins?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get all supervisors with pagination
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<Object>}
 */
export const getAllSupervisors = async (page = 1, limit = 10) => {
  try {
    const response = await API.get(`/admin/all-supervisors?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get all employees with pagination
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<Object>}
 */
export const getAllEmployees = async (page = 1, limit = 10) => {
  try {
    const response = await API.get(`/admin/all-employees?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get all customers
 * @returns {Promise<Object>}
 */
export const getAllCustomers = async () => {
  try {
    const response = await API.get("/users/getUsersByRole/customer");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get all orders with pagination (role-based scoping handled by backend)
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<Object>}
 */
export const getAllOrders = async (page = 1, limit = 10) => {
  try {
    const response = await API.get(`/orders/getAllOrders?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update order status
 * @param {string} id
 * @param {string} status
 * @returns {Promise<Object>}
 */
export const updateOrderStatus = async (id, status) => {
  try {
    const response = await API.put(`/orders/updateOrderStatus/${id}`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
