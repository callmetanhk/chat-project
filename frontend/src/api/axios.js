import axios from "axios";
import { isTokenExpired } from "../utils/auth";

const instance = axios.create({
  baseURL: "http://localhost:8000/api",
});

instance.interceptors.request.use(async (config) => {
  let access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  // nếu access hết hạn → refresh
  if (isTokenExpired(access) && refresh) {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/token/refresh/",
        { refresh }
      );

      access = res.data.access;
      localStorage.setItem("access", access);
    } catch (err) {
      localStorage.clear();
      window.location.href = "/login";
    }
  }

  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }

  return config;
});

export default instance;