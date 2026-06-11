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

export default Api;
