import axios from "axios";
import LsService from "./localstorage";

const API = axios.create({
  // baseURL: "https://single-vendor-e-commerce-node.onrender.com/api",
  // baseURL: "http://localhost:5000/api",
  baseURL: "https://gtapi.invtechnologies.in/api",
});

API.interceptors.request.use((config) => {
  const user = LsService.getCurrentUser();
  const token = user?.token;
  // console.log(token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;