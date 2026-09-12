import { USER_API_ENDPOINT } from "./utils/data";
import { setUser } from "./redux/authSlice";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import ScrollToTop from "./components/components_lite/ScrollToTop";

const Layout = () => (
  <>
    <ScrollToTop />
    <Outlet />
  </>
);

// Pages
import Home from "./components/components_lite/Home";
import Login from "./components/authentication/Login";
import Register from "./components/authentication/Register";
import RecruiterRegister from "./components/authentication/RecruiterRegister";
import ForgotPassword from "./components/authentication/ForgotPassword";
import ResetPassword from "./components/authentication/ResetPassword";
import PrivacyPolicy from "./components/components_lite/PrivacyPolicy.jsx";
import TermsofService from "./components/components_lite/TermsofService.jsx";
import Jobs from "./components/components_lite/Jobs.jsx";
import Profile from "./components/components_lite/Profile.jsx";
import EditProfile from "./components/components_lite/EditProfile.jsx";
import Description from "./components/components_lite/Description.jsx";
import SavedJobs from "./components/components_lite/SavedJobs.jsx";

// CV Maker
import CVMaker from "./components/components_lite/CVMaker.jsx";

// New Candidate Components
import CvBuilder from "./components/components_lite/CvBuilder.jsx";
import AiJobMatching from "./components/components_lite/AiJobMatching.jsx";
import ResumeScanner from "./components/components_lite/ResumeScanner.jsx";
import SaasToolPage from "./components/components_lite/SaasToolPage.jsx";

// Recruiter components
import Companies from "./components/admincomponent/Companies";
import CompanyCreate from "./components/admincomponent/CompanyCreate";
import CompanySetup from "./components/admincomponent/CompanySetup";
import AdminJobs from "./components/admincomponent/AdminJobs.jsx";
import PostJob from "./components/admincomponent/PostJob";
import JDMaker from "./components/admincomponent/JDMaker";
import RecruiterChats from "./components/admincomponent/RecruiterChats";
import CandidateChats from "./components/employee/CandidateChats";
import Applicants from "./components/admincomponent/Applicants";
import JobDetailsRecruiter from "./components/admincomponent/JobDetailsRecruiter";
import ProtectedRoute from "./components/admincomponent/ProtectedRoute";
import RecruiterDashboard from "./components/admincomponent/RecruiterDashboard";
import ManageApplicationsRecruiter from "./components/admincomponent/ManageApplications";
import CandidateAppliedJobs from "./components/employee/CandidateAppliedJobs";
import CandidateRoute from "./components/admincomponent/CandidateRoute";
import RecruiterProfile from "./components/admincomponent/RecruiterProfile";
import FindCandidates from "./components/admincomponent/FindCandidates";
import RecruiterComplaints from "./components/admincomponent/RecruiterComplaints";
import MyComplaints from "./components/components_lite/MyComplaints";

// Role dashboards
import Creator from "./components/creator/Creator.jsx";
import EmployeeDashboard from "./components/employee/EmployeeDashboard";

// AI Video Interview
import CandidateInterviewHub from "./components/interview/CandidateInterviewHub.jsx";
import VideoInterviewSession from "./components/interview/VideoInterviewSession.jsx";
import InterviewResult from "./components/interview/InterviewResult.jsx";
import SendInterview from "./components/interview/SendInterview.jsx";
import RecruiterInterviewHub from "./components/interview/RecruiterInterviewHub.jsx";
import RecruiterInterviewResult from "./components/interview/RecruiterInterviewResult.jsx";
import NovaAiInterview from "./components/interview/NovaAiInterview.jsx";
import NovaAiInterviewReview from "./components/interview/NovaAiInterviewReview.jsx";
import CandidateNovaAiResult from "./components/interview/CandidateNovaAiResult.jsx";

// Chatbot
import CustomCursor from "./components/components_lite/CustomCursor";
import FeatureGuard from "./components/admincomponent/FeatureGuard";

// New Tool Components
import AiInterview from "./components/tools/AiInterview";
import CvShortlisted from "./components/tools/CvShortlisted";
import PricingPlans from "./components/more/PricingPlans";
import GlobalWorkforceHub from "./components/more/GlobalWorkforceHub";
import RecruiterWorkforceHub from "./components/admincomponent/RecruiterWorkforceHub";

// Redirect all admin traffic to port 5174
const AdminRedirect = () => {
  React.useEffect(() => {
    window.location.replace("http://localhost:5174/admin/dashboard");
  }, []);
  return null;
};

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/admin/*", element: <AdminRedirect /> },
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password/:token", element: <ResetPassword /> },
  { path: "/register", element: <Register /> },
  { path: "/recruiter/register", element: <RecruiterRegister /> },

  { path: "/description/:id", element: <Description /> },
  {
    path: "/profile",
    element: (
      <CandidateRoute>
        <Profile />
      </CandidateRoute>
    ),
  },
  {
    path: "/profile/edit",
    element: (
      <CandidateRoute>
        <EditProfile />
      </CandidateRoute>
    ),
  },
  {
    path: "/candidate/chats",
    element: (
      <CandidateRoute>
        <CandidateChats />
      </CandidateRoute>
    ),
  },
  {
    path: "/candidate/applied-jobs",
    element: (
      <CandidateRoute>
        <CandidateAppliedJobs />
      </CandidateRoute>
    ),
  },
  {
    path: "/cv-maker",
    element: (
      <CandidateRoute>
        <CVMaker />
      </CandidateRoute>
    ),
  },

  // AI Video Interview — candidate
  {
    path: "/candidate/interviews",
    element: (
      <CandidateRoute>
        <CandidateInterviewHub />
      </CandidateRoute>
    ),
  },
  {
    path: "/candidate/interviews/:id/session",
    element: (
      <CandidateRoute>
        <VideoInterviewSession />
      </CandidateRoute>
    ),
  },
  {
    path: "/candidate/interviews/:id/result",
    element: (
      <CandidateRoute>
        <InterviewResult />
      </CandidateRoute>
    ),
  },

  // NOVA AI Interview — full proctored AI-conducted interview
  {
    path: "/candidate/nova-ai-interview",
    element: (
      <CandidateRoute>
        <NovaAiInterview />
      </CandidateRoute>
    ),
  },
  {
    path: "/candidate/nova-ai-interview/:id",
    element: (
      <CandidateRoute>
        <NovaAiInterview />
      </CandidateRoute>
    ),
  },
  {
    path: "/candidate/nova-ai-interview/:id/result",
    element: (
      <CandidateRoute>
        <CandidateNovaAiResult />
      </CandidateRoute>
    ),
  },

  // AI Video Interview — recruiter
  {
    path: "/recruiter/interviews",
    element: (
      <ProtectedRoute>
        <FeatureGuard feature="nova">
          <RecruiterInterviewHub />
        </FeatureGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/interviews/new",
    element: (
      <ProtectedRoute>
        <FeatureGuard feature="nova">
          <SendInterview />
        </FeatureGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/interviews/:id",
    element: (
      <ProtectedRoute>
        <FeatureGuard feature="nova">
          <RecruiterInterviewResult />
        </FeatureGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/nova-ai-interviews/:id",
    element: (
      <ProtectedRoute>
        <FeatureGuard feature="nova">
          <NovaAiInterviewReview />
        </FeatureGuard>
      </ProtectedRoute>
    ),
  },

  // New Candidate Routes
  {
    path: "/cv-builder",
    element: (
      <CandidateRoute>
        <CvBuilder />
      </CandidateRoute>
    ),
  },
  {
    path: "/resume-scanner",
    element: (
      <CandidateRoute>
        <ResumeScanner />
      </CandidateRoute>
    ),
  },
  // { path: "/ai-job-matching", element: <CandidateRoute><AiJobMatching /></CandidateRoute> },
  {
    path: "/my-complaints",
    element: (
      <CandidateRoute>
        <MyComplaints />
      </CandidateRoute>
    ),
  },
  {
    path: "/tools/jd-maker",
    element: (
      <ProtectedRoute>
        <SaasToolPage type="jd-maker" />
      </ProtectedRoute>
    ),
  },
  // { path: "/tools/ai-interview", element: <AiInterview /> },
  // { path: "/tools/cv-shortlisted", element: <CvShortlisted /> },
  {
    path: "/tools/resume-matching",
    element: <SaasToolPage type="resume-matching" />,
  },
  // {
  //     path: "/tools/ai-recruiter",
  //     element: (
  //       <ProtectedRoute>
  //         <SaasToolPage type="ai-recruiter" />
  //       </ProtectedRoute>
  //     ),
  //   },
  { path: "/more/contact-us", element: <SaasToolPage type="contact-us" /> },

  { path: "/more/pricing-plans", element: <PricingPlans /> },

  { path: "/workforce", element: <CandidateRoute><GlobalWorkforceHub /></CandidateRoute> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/terms", element: <TermsofService /> },

  { path: "/jobs", element: <Jobs /> },
  { path: "/saved-jobs", element: <SavedJobs /> },

  // dashboards
  { path: "/creator", element: <Creator /> },
  {
    path: "/employee-dashboard",
    element: (
      <CandidateRoute>
        <EmployeeDashboard />
      </CandidateRoute>
    ),
  },
  {
    path: "/recruiter/dashboard",
    element: (
      <ProtectedRoute>
        <RecruiterDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/profile",
    element: (
      <ProtectedRoute>
        <RecruiterProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/companies",
    element: (
      <ProtectedRoute>
        <Companies />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/companies/create",
    element: (
      <ProtectedRoute>
        <CompanyCreate />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/companies/:id",
    element: (
      <ProtectedRoute>
        <CompanySetup />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/jobs",
    element: (
      <ProtectedRoute>
        <AdminJobs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/jobs/create",
    element: (
      <ProtectedRoute>
        <PostJob />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/jobs/edit/:id",
    element: (
      <ProtectedRoute>
        <PostJob />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/jobs/:id",
    element: (
      <ProtectedRoute>
        <JobDetailsRecruiter />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/jd-maker",
    element: (
      <ProtectedRoute>
        <JDMaker />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/chats",
    element: (
      <ProtectedRoute>
        <FeatureGuard feature="chat">
          <RecruiterChats />
        </FeatureGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/find-candidates",
    element: (
      <ProtectedRoute>
        <FeatureGuard feature="find_candidates">
          <FindCandidates />
        </FeatureGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/complaints",
    element: (
      <ProtectedRoute>
        <RecruiterComplaints />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/mass-workforce",
    element: (
      <ProtectedRoute>
        <RecruiterWorkforceHub />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/jobs/:id/applicants",
    element: (
      <ProtectedRoute>
        <Applicants />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/applications",
    element: (
      <ProtectedRoute>
        <ManageApplicationsRecruiter />
      </ProtectedRoute>
    ),
  },
    ],
  },
]);

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get(`${USER_API_ENDPOINT}/profile`, {
          withCredentials: true,
        });
        if (res.data.success) {
          if (res.data.user?.role === "Admin") {
            // Admin should not be logged in on candidate/recruiter portal
            dispatch(setUser(null));
          } else {
            dispatch(setUser(res.data.user));
          }
        }
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          dispatch(setUser(null));
        }
      }
    };
    checkSession();
  }, [dispatch]);

  return (
    <div>
      <CustomCursor />

      <RouterProvider router={appRouter} />
    </div>
  );
}

export default App;
