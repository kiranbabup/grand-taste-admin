// orderApis.js
import API from "./api";

// WEBSITE STAFF VIEW ROUTES
// router.get("/getAllOrders", protect, websiteStaff, getAllOrders);
// router.get("/searchByPhone/:phone", protect, websiteStaff, getOrdersBySearchPhone);

// SUPERVISOR / ADMIN / SUPERADMIN ROUTES
// router.put("/supervisorUpdateStatus/:id", protect, websiteStaff, supervisorUpdateOrderStatus);

// SUPERADMIN ROUTES
// router.put("/adminUpdateStatus/:id", protect, superAdminOnly, adminUpdateOrderStatus);

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
 * Get all orders with pagination (role-based scoping handled by backend)
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<Object>}
 */
export const searchByPhone = async (phone) => {
  try {
    const response = await API.get(`/orders/searchByPhone/${phone}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const staffUpdateOrderStatus = async (id, status) => {
  try {
    const response = await API.put(`/orders/supervisorUpdateStatus/${id}`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const superadminUpdateOrderStatus = async (id, status) => {
  try {
    const response = await API.put(`/orders/adminUpdateStatus/${id}`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
