import API from "./api";

/**
 * Register a new user
 * @param {Object} userData - User registration details
 * @returns {Promise<Object>}
 */
export const register = async (userData) => {
  try {
    const response = await API.post("/users/register", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Login a user
 * @param {Object} credentials - User login credentials (email/phone and password)
 * @returns {Promise<Object>}
 */
export const login = async (credentials) => {
  try {
    const response = await API.post("/users/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Google authentication
 * @param {string} idToken - Google ID token
 * @returns {Promise<Object>}
 */
export const googleAuth = async (idToken) => {
  try {
    const response = await API.post("/users/google", { idToken });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
