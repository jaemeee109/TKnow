import axios from "axios";

const BASE_URL = "http://localhost:9090/ticketnow"; // 백엔드 URL

export const login = async (memberId, password) => {
  return axios.post(`${BASE_URL}/auth/login`, {
    memberId,
    password
  });
};

export const signup = async (memberId, password, memberName) => {
  return axios.post(`${BASE_URL}/auth/signup`, {
    memberId,
    password,
    memberName
  });
};

