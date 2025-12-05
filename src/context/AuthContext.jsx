// src/context/AuthContext.jsx
import { createContext, useState } from "react";
import { setToken, removeToken } from "../utils/token";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const loginUser = (access, refresh, memberId) => {
    setToken(access, refresh);
    setUser({ memberId });
  };

  const logoutUser = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
