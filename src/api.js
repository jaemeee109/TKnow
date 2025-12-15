// src/api.js
import axios from "axios";

// baseURL 우선순위: REACT_APP_API_BASE > proxy(개발용) > fallback
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // (쿠키 안 쓰면 없어도 됨. 써도 무방)
});

// 요청 시 토큰 자동 첨부
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
