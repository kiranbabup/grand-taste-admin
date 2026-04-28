import axios from "axios";

const API = axios.create({
  // baseURL: "https://single-vendor-e-commerce-node.onrender.com/api",
  // baseURL: "http://localhost:5000/api",
  baseURL: "https://gtapi.invtechnologies.in/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;