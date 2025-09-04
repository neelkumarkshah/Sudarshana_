import { useState, useCallback, useEffect } from "react";

export const useAuth = () => {
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = useCallback((uid) => {
    setUserId(uid);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setUserId(null);
    setIsLoggedIn(false);
    window.api.invoke("logoutUser").catch(() => {});
  }, []);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await window.api.invoke("verifyUser");
        if (res.success && res.userExists) {
          login(res.userId);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    };

    verifyUser();

    const interval = setInterval(verifyUser, 60 * 1000);
    return () => clearInterval(interval);
  }, [login, logout]);

  return { isLoggedIn, userId, login, logout };
};
