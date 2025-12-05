// src/utils/token.js
export const setToken = (access, refresh) => {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
};

export const getToken = () => ({
  access: localStorage.getItem("accessToken"),
  refresh: localStorage.getItem("refreshToken")
});

export const removeToken = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};
