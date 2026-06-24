"use client";
import axios from "axios";

const Api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
});

Api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("user-token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

Api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("user-token");
        localStorage.removeItem("userId");
        window.location.href = "/presignin";
      }
    }
    return Promise.reject(error);
  }
);

export default Api;
