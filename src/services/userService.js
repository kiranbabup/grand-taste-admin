import API from "./api";

/**
 * Get current user profile
 * @returns {Promise<Object>}
 */
export const getUserProfile = async () => {
  try {
    const response = await API.get("/users/profile");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update current user profile
 * @param {Object} profileData 
 * @returns {Promise<Object>}
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await API.put("/users/profile", profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get all users (Admin only)
 * @returns {Promise<Array>}
 */
export const getUsers = async () => {
  try {
    const response = await API.get("/users/getUsers");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get users by role (Admin only)
 * @param {string} role 
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<Object>}
 */
export const getUsersByRole = async (role, page = 1, limit = 10) => {
  try {
    const response = await API.get(`/users/getUsersByRole/${role}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


/**
 * Search users by string (Admin only)
 * @param {string} searchString 
 * @returns {Promise<Array>}
 */
export const getUserBySearch = async (searchString) => {
  try {
    const response = await API.get(`/users/users/search/${searchString}`);
    // console.log(response.data);
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get single user by referral code (Admin only)
 * @param {string} referralCode 
 * @returns {Promise<Object>}
 */
export const getUserByReferralCode = async (referralCode) => {
  try {
    const response = await API.get(`/users/getUserByReferalCode/${referralCode}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get list of users by referral code (Admin only)
 * @param {string} referralCode 
 * @returns {Promise<Array>}
 */
export const getUsersByReferralCode = async (referralCode) => {
  try {
    const response = await API.get(`/users/getUsersByReferalCode/${referralCode}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update user by ID (Admin only)
 * @param {string} id 
 * @param {Object} userData 
 * @returns {Promise<Object>}
 */
export const updateUserById = async (id, userData) => {
  try {
    const response = await API.put(`/users/users/status/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getUserById = async (userid) => {
  try {
    const response = await API.get(`/users/users/${userid}`);
    // console.log(response.data);
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
