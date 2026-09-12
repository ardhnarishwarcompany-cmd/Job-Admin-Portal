import { USER_API_ENDPOINT } from "./utils/data";
import { setUser } from "./redux/authSlice";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import React from "react";
import CustomCursor from "./components/components_lite/CustomCursor";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import ScrollToTop from "./components/components_lite/ScrollToTop";

const Layout = () => (
  <>
    <ScrollToTop />
    <Outlet />
  </>
);


// Auth
import AdminLogin from "./components/authentication/AdminLogin";
import AdminRegister from "./components/authentication/AdminRegister";
import ForgotPassword from "./components/authentication/ForgotPassword";
import ResetPassword from "./components/authentication/ResetPassword";

// Shared admin data components (reused as-is, same backend)
import Companies from "./components/admincomponent/Companies";
import CompanyCreate from "./components/admincomponent/CompanyCreate";
import CompanySetup from "./components/admincomponent/CompanySetup";
import PostJob from "./components/admincomponent/PostJob";
import PendingJobs from "./components/admin/PendingJobs";
import Description from "./components/components_lite/Description";
import Applicants from "./components/admincomponent/Applicants";
import AdminRoute from "./components/admincomponent/AdminRoute";
import ContactRequests from "./components/admin/ContactRequests";
import AdminChats from "./components/admin/AdminChats";
import AdminComplaints from "./components/admin/AdminComplaints";

// Admin system
import AdminDashboard from "./components/admin/AdminDashboard";
import GlobalWorkforceOversight from "./components/admin/GlobalWorkforceOversight";
import ManageUsers from "./components/admin/ManageUsers";
import UserDetail from "./components/admin/UserDetail";
import ManageJobs from "./components/admin/ManageJobs";
import JobEditRequests from "./components/admin/JobEditRequests";
import FeatureRequests from "./components/admin/FeatureRequests";
import ManageApplications from "./components/admin/ManageApplications";
import RecruiterApprovals from "./components/admin/RecruiterApprovals";
import ApplicantApprovals from "./components/admin/ApplicantApprovals";
import AccessKeys from "./components/admin/AccessKeys";
import AiInterviewsOversight from "./components/admin/AiInterviewsOversight";
import NovaAiInterviews from "./components/admin/NovaAiInterviews";
import RecruiterNovaAiInterviews from "./components/admin/RecruiterNovaAiInterviews";
import RecruiterRoute from "./components/admincomponent/RecruiterRoute";
import RecruiterProfiles from "./components/admin/RecruiterProfiles";
import AdminMassHiring from "./components/admin/AdminMassHiring";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // Straight to login — no landing page, no candidate/recruiter options
      { path: "/", element: <AdminLogin /> },
  { path: "/login", element: <AdminLogin /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password/:token", element: <ResetPassword /> },
  { path: "/admin/register", element: <AdminRegister /> },

  // Admin routes — all guarded, Admin role only
  { path: "/admin/dashboard", element: <AdminRoute><AdminDashboard /></AdminRoute> },
  { path: "/admin/workforce", element: <AdminRoute><GlobalWorkforceOversight /></AdminRoute> },
  { path: "/admin/mass-hiring", element: <AdminRoute><AdminMassHiring /></AdminRoute> },
  { path: "/admin/requests", element: <AdminRoute><ContactRequests /></AdminRoute> },
  { path: "/admin/users", element: <AdminRoute><ManageUsers /></AdminRoute> },
  { path: "/admin/recruiter-profiles", element: <AdminRoute><RecruiterProfiles /></AdminRoute> },
  { path: "/admin/users/:id", element: <AdminRoute><UserDetail /></AdminRoute> },
  { path: "/admin/access-keys", element: <AdminRoute><AccessKeys /></AdminRoute> },
  { path: "/admin/ai-interviews", element: <AdminRoute><AiInterviewsOversight /></AdminRoute> },
  { path: "/admin/nova-ai-interviews", element: <AdminRoute><NovaAiInterviews /></AdminRoute> },
  { path: "/recruiter/nova-ai-interviews", element: <RecruiterRoute><RecruiterNovaAiInterviews /></RecruiterRoute> },
  { path: "/admin/jobs", element: <AdminRoute><ManageJobs /></AdminRoute> },
  { path: "/admin/job-edits", element: <AdminRoute><JobEditRequests /></AdminRoute> },
  { path: "/admin/feature-requests", element: <AdminRoute><FeatureRequests /></AdminRoute> },
  { path: "/description/:id", element: <AdminRoute><Description /></AdminRoute> },
  { path: "/admin/applications", element: <AdminRoute><ManageApplications /></AdminRoute> },
  { path: "/admin/recruiter-approvals", element: <AdminRoute><RecruiterApprovals /></AdminRoute> },
  { path: "/admin/applicant-approvals", element: <AdminRoute><ApplicantApprovals /></AdminRoute> },
  { path: "/admin/jobs/pending", element: <AdminRoute><PendingJobs /></AdminRoute> },
  { path: "/admin/chats", element: <AdminRoute><AdminChats /></AdminRoute> },
  { path: "/admin/complaints", element: <AdminRoute><AdminComplaints /></AdminRoute> },

  {
    path: "/admin/companies",
    element: (
      <AdminRoute>
        <Companies />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/companies/create",
    element: (
      <AdminRoute>
        <CompanyCreate />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/companies/:id",
    element: (
      <AdminRoute>
        <CompanySetup />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/jobs/create",
    element: (
      <AdminRoute>
        <PostJob />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/jobs/:id/applicants",
    element: (
      <AdminRoute>
        <Applicants />
      </AdminRoute>
    ),
  },

  // Any unknown path falls back to the login screen
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

function App() {
  const dispatch = useDispatch();
  const sidebarCollapsed = useSelector((state) => state.auth.sidebarCollapsed);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get(`${USER_API_ENDPOINT}/profile`, { withCredentials: true });
        if (res.data.success) {
          dispatch(setUser(res.data.user));
        }
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          dispatch(setUser(null));
        }
      }
    };
    checkSession();
  }, [dispatch]);

  useEffect(() => {
    if (sidebarCollapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
  }, [sidebarCollapsed]);

  return (
    <div>
      <CustomCursor />
      <RouterProvider router={appRouter} />
    </div>
  );
}

export default App;
