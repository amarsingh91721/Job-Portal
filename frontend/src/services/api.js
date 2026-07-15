import axios from "axios";

const api = axios.create({
  baseURL: "https://job-portal-backend-hnv4.onrender.com/api",
});

export default api;