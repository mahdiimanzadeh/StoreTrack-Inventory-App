// src/App.js
import React, { useContext, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthContext from "./AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NoPageFound from "./pages/NoPageFound";
import TransactionHistory from "./pages/TransactionHistory";
import OrderList from "./pages/OrderList";
import Store from "./pages/Store";
import Notification from "./components/Notification";

const App = () => {
  const [user, setUser] = useState(null); // Initially null, then holds the complete user object (including token)
  const [loader, setLoader] = useState(true); // For displaying the initial loading page
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  useEffect(() => {
    // This useEffect runs only once when App mounts
    // and is responsible for reading the user from localStorage and setting the initial state
    const myLoginUser = JSON.parse(localStorage.getItem("user"));
    if (myLoginUser && myLoginUser._id && myLoginUser.token) {
      setUser(myLoginUser); // Save the entire user object, including token
    } else {
      setUser(null); // If there is no user in localStorage or it is incomplete
    }
    setLoader(false); // After checking localStorage, set loader to false
  }, []); // No dependencies, runs only once

  const signin = (newUserObject, callback) => {
    setUser(newUserObject); // Save the entire user object (with token) in state
    localStorage.setItem("user", JSON.stringify(newUserObject)); // And in localStorage
    callback(); // For redirecting the user
  };

  const signout = () => {
    setUser(null);
    localStorage.removeItem("user"); // Remove user from localStorage
  };

  let value = { user, signin, signout };

  // PrivateRoute to protect routes
  const PrivateRoute = ({ children }) => {
    if (loader) {
      // If we are still in the initial loading state (i.e., localStorage not checked), show the loading page
      return (
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <h1>در حال بارگذاری...</h1>
        </div>
      );
    }
    // If loader is false (i.e., localStorage check is done):
    // If the user exists and has a token, allow access to the protected content
    // Otherwise, redirect to the login page
    return user && user.token ? children : <Navigate to="/login" />;
  };

  return (
    <AuthContext.Provider value={value}>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login showNotification={showNotification} />} />
          <Route path="/register" element={<Register showNotification={showNotification} />} />

          {/* Protected routes controlled by PrivateRoute */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            {/* Page components that fetch protected data */}
            <Route index element={<Dashboard showNotification={showNotification} />} />
            <Route path="/inventory" element={<Inventory showNotification={showNotification} />} />
            <Route path="/purchase-details" element={<TransactionHistory showNotification={showNotification} />} />
            <Route path="/sales" element={<OrderList showNotification={showNotification} />} />
            <Route path="/manage-store" element={<Store showNotification={showNotification} />} />
          </Route>

          {/* 404 route for not found pages */}
          <Route path="*" element={<NoPageFound />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
