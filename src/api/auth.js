//src/api/auth.js
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE;

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
