// src/api.js
import axios from "axios";

// 공통 Axios 인스턴스 생성
const api = axios.create({
  baseURL: "http://localhost:9090/ticketnow", // 여기서 자동으로 /ticketnow 붙음
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 시 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
