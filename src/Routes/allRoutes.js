import React from "react";
import { Navigate } from "react-router-dom";

//Dashboard
import DashboardEcommerce from "../pages/DashboardEcommerce";

//pages
import Starter from "../pages/Pages/Starter/Starter";
import Maintenance from "../pages/Pages/Maintenance/Maintenance";
import ComingSoon from "../pages/Pages/ComingSoon/ComingSoon";

//login
import Login from "../pages/Authentication/Login";
import ForgetPasswordPage from "../pages/Authentication/ForgetPassword";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";

// User Profile
import UserProfile from "../pages/Authentication/user-profile";
import RegistrationTwo from "../pages/Authentication/RegistrationStep02";
// import Products from "../pages/Pages/Products/Products";
import ConfirmOtp from "../pages/Authentication/ConfirmOtp";
// import UserManagement from "../pages/Pages/User Mangement/UserManagement";
import StaffManagement from "../pages/UserMangement/StaffManagement";
import CustomerManagement from "../pages/UserMangement/CustomerManagement";

const authProtectedRoutes = [
  { path: "/dashboard", component: <DashboardEcommerce /> },
  { path: "/index", component: <DashboardEcommerce /> },
  // {path: "/products", exact: true, component: <Products/>},

  //Pages
  // { path: "/pages-starter", component: <Starter /> },

  //User Profile
  // { path: "/profile", component: <UserProfile /> },

  {
    path: "/",
    exact: true,
    component: <Navigate to="/dashboard" />,
  },
  { path: "*", component: <Navigate to="/dashboard" /> },

  // { path: "/user-management", component: <UserManagement /> },

  { path: "/staff-management", exact: true, component: <StaffManagement /> },
  {
    path: "/customer-management",
    exact: true,
    component: <CustomerManagement />,
  },
];

const publicRoutes = [
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  { path: "/forgot-password", component: <ForgetPasswordPage /> },
  { path: "/confirm-otp", component: <ConfirmOtp /> },
  { path: "/register", component: <Register /> },

  { path: "/pages-maintenance", component: <Maintenance /> },
  { path: "/pages-coming-soon", component: <ComingSoon /> },

  { path: "/login-next-step", component: <RegistrationTwo /> },
];

export { authProtectedRoutes, publicRoutes };
