"use client";
import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useParams,
  useLocation,
} from "react-router-dom";
import {
  CustomSidebarProvider,
  SidebarInset,
} from "@/components/layout/custom-sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";

// Lazy-load pages
const Dashboard = React.lazy(() => import("@/pages/dashboard.tsx"));
const Setting = React.lazy(() => import("@/pages/setting.tsx"));
const DataLibrary = React.lazy(() => import("@/pages/data-library.tsx"));
const Monitoring = React.lazy(() => import("@/pages/monitoring.tsx"));
const Analytics = React.lazy(() => import("@/pages/analytics.tsx"));
const Models = React.lazy(() => import("@/pages/models.tsx"));
const Team = React.lazy(() => import("@/pages/team.tsx"));
const Reports = React.lazy(() => import("@/pages/reports"));
const Help = React.lazy(() => import("@/pages/help.tsx"));
const Documentation = React.lazy(() => import("@/pages/documentation.tsx"));
const Search = React.lazy(() => import("@/pages/search.tsx"));
const Login = React.lazy(() => import("@/pages/login.tsx"));

const SandboxPage = import.meta.env.DEV
  ? React.lazy(() => import("@/pages/sandbox.tsx"))
  : null;

import { SiteHeader } from "@/components/layout/site-header";
import { SocketProvider } from "@/contexts/SocketContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ScrollToTop } from "@/components/custom/scroll-to-top";
import { Toaster } from "@/components/ui/sonner";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { TopProgressBar } from "@/components/custom/top-progress-bar";
import { PageLoadingOverlay } from "@/components/custom/page-loading-overlay";

/**
 * 🛡️ PROTOCOL GUARD: Bảo vệ Route theo cấp bậc Owner > Admin > OP
 */
const RoleProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode, 
  allowedRoles: string[] 
}) => {
  const { role, isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  // Kiểm tra xem vai trò hiện tại có nằm trong danh sách cho phép không
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const RouteScrollReset = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    const container = document.getElementById("main-scroll-container");
    if (container) container.scrollTop = 0;
  }, [pathname]);
  return null;
};

/**
 * Layout chính với kiểm soát Prefix (admin/user)
 */
const PrefixGuardedLayout = () => {
  const { prefix } = useParams<{ prefix: string }>();
  const { routePrefix, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (prefix !== routePrefix) {
    if (!routePrefix) {
      const subPath = location.pathname.slice(`/${prefix}`.length) || "/";
      return <Navigate to={subPath} replace />;
    }
    const segments = location.pathname.split("/");
    segments[1] = routePrefix;
    return <Navigate to={segments.join("/")} replace />;
  }

  return <Outlet />;
};

const ViewerGuardedLayout = () => {
  const { routePrefix, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  // Nếu là tài khoản có prefix (owner/admin) mà truy cập path trống -> đẩy về path có prefix
  if (routePrefix && location.pathname === "/") {
    return <Navigate to={`/${routePrefix}/dashboard`} replace />;
  }

  return <Outlet />;
};

const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }
  return <>{children}</>;
};

const RootLayout = () => (
  <ThemeProvider>
    <AuthProvider>
      <TopProgressBar />
      <LoadingProvider>
        <SocketProvider>
          <CustomSidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <RouteScrollReset />
              <SiteHeader />
              <main className="relative flex flex-1 flex-col">
                <PageLoadingOverlay />
                <AuthGate>
                  <React.Suspense fallback={null}>
                    <Outlet />
                  </React.Suspense>
                </AuthGate>
              </main>
            </SidebarInset>
          </CustomSidebarProvider>
          <ScrollToTop />
        </SocketProvider>
      </LoadingProvider>
    </AuthProvider>
    <Toaster richColors position="top-right" />
  </ThemeProvider>
);

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <ThemeProvider>
        <AuthProvider>
          <React.Suspense fallback={null}>
            <Login />
          </React.Suspense>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    ),
  },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: ":prefix",
        element: <PrefixGuardedLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "monitoring", element: <Monitoring /> },
          { path: "analytics", element: <Analytics /> },
          { path: "models", element: <Models /> },
          { path: "reports", element: <Reports /> },
          { path: "data-library", element: <DataLibrary /> },
          { path: "help", element: <Help /> },
          { path: "search", element: <Search /> },
          { path: "documentation", element: <Documentation /> },

          // 🔒 NHÓM TRANG BẢO MẬT CAO (Chỉ dành cho Owner)
          { 
            path: "team", 
            element: <RoleProtectedRoute allowedRoles={['owner']}><Team /></RoleProtectedRoute> 
          },
          { 
            path: "settings", 
            element: <RoleProtectedRoute allowedRoles={['owner']}><Setting /></RoleProtectedRoute> 
          },
          ...(import.meta.env.DEV && SandboxPage ? [{ 
            path: "sandbox", 
            element: <RoleProtectedRoute allowedRoles={['owner']}><SandboxPage /></RoleProtectedRoute> 
          }] : []),
        ],
      },
      // Mặc định cho người dùng không có prefix (Viewer/OP)
      {
        element: <ViewerGuardedLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          // ... Các route khác tương tự cho Viewer nếu cần
        ]
      }
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}