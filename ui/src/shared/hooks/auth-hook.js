import { useState, useCallback, useEffect } from "react";

export const useAuth = () => {
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = useCallback((uid, userEmail) => {
    setUserId(uid);
    setEmail(userEmail || null);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setUserId(null);
    setEmail(null);
    setIsLoggedIn(false);
    window.api.invoke("logoutUser").catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;

    const verifyUser = async () => {
      try {
        const res = await window.api.invoke("verifyUser");
        if (mounted && res.success && res.userExists) {
          login(res.userId, res.email);
        } else if (mounted) {
          logout();
        }
      } catch (err) {
        console.error("User verification failed:", err);
        logout();
      }
    };

    verifyUser();

    const interval = setInterval(verifyUser, 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [login, logout]);

  return { isLoggedIn, userId, email, login, logout };
};
