import { createBrowserRouter, Navigate } from "react-router";
import { Dashboard } from "./components/Dashboard";
import { DashboardHome } from "./pages/DashboardHome";
import { MyCourses } from "./pages/MyCourses";
import { CourseDetail } from "./pages/CourseDetail";
import { Schedule } from "./pages/Schedule";
import { Certificates } from "./pages/Certificates";
import { Community } from "./pages/Community";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminDashboardHome } from "./pages/admin/AdminDashboardHome";
import { CourseManagement } from "./pages/admin/CourseManagement";
import { UserManagement } from "./pages/admin/UserManagement";
import { TeamManagement } from "./pages/admin/TeamManagement";
import { AdminAnalytics } from "./pages/admin/AdminAnalytics";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { ScheduleManagement } from "./pages/admin/ScheduleManagement";
import { CommunityManagement } from "./pages/admin/CommunityManagement";
import { CertificateManagement } from "./pages/admin/CertificateManagement";

import { BrowseCourses } from "./pages/BrowseCourses";
import { Messages } from "./pages/Messages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
    children: [
      { index: true, Component: DashboardHome },
      { path: "courses", Component: MyCourses },
      { path: "browse", Component: BrowseCourses },
      { path: "courses/:courseId", Component: CourseDetail },
      { path: "schedule", Component: Schedule },
      { path: "certificates", Component: Certificates },
      { path: "community", Component: Community },
      { path: "profile", Component: Profile },
      { path: "settings", Component: Settings },
      { path: "messages", Component: Messages },
    ],
  },
  {
    path: "/admin/dashboard",
    Component: AdminDashboard,
    children: [
      { index: true, Component: AdminDashboardHome },
      { path: "courses", Component: CourseManagement },
      { path: "users", Component: UserManagement },
      { path: "teams", Component: TeamManagement },
      { path: "schedules", Component: ScheduleManagement },
      { path: "community", Component: CommunityManagement },
      { path: "certificates", Component: CertificateManagement },
      { path: "analytics", Component: AdminAnalytics },
      { path: "settings", Component: AdminSettings },
      { path: "messages", Component: Messages },
    ],
  },
]);
