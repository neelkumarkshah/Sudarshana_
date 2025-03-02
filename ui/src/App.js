import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import MainNav from "./shared/components/header/Header";
import PenTest from "./penTesting/pages/PenTest";
import Dashboard from "./dashboard/pages/Dashboard";
import LoginForm from "./authentication/loginForm";
import RegistrationForm from "./authentication/registrationForm";
import { AuthContext } from "./shared/context/auth-context";
import { useAuth } from "./shared/hooks/auth-hook";

const App = () => {
  const { token, login, logout, userId } = useAuth();

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/users/verifyUsers`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("User verification failed!");
          }

          const responseData = await response.json();
          if (!responseData.userExists) {
            logout();
          }
        } catch (err) {
          logout();
        }
      }
    };

    verifyUser();

    const intervalId = setInterval(verifyUser, 60000);
    return () => {
      clearInterval(intervalId);
    };
  }, [token, logout]);

  let routes;

  if (token) {
    routes = (
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/pentesting" element={<PenTest />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    );
  } else {
    routes = (
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/signup" element={<RegistrationForm />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        login: login,
        logout: logout,
      }}
    >
      <Router>
        <main>{routes}</main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
