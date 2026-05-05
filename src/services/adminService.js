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
    const response = await API.get(`/users/users/by-role/admin?page=${page}&limit=${limit}`);
    // console.log(response.data);

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
export const getAllStaffByRole = async (role, page = 1, limit = 10) => {
  try {
    const response = await API.get(`/users/users/by-role/${role}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get downline members by referral code
 * @param {string} referalcode
 * @returns {Promise<Object>}
 */
export const getDownlineMembers = async (referalcode) => {
  try {
    const response = await API.get(`/users/users/downline/${referalcode}`);
    // console.log(response.data);

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


