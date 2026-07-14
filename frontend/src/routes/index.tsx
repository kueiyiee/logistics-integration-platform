import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ClientLayout } from '../layouts/ClientLayout';
import { PlatformLayout } from '../layouts/PlatformLayout';
import { useAuth } from '../hooks/useAuth';

const HomePage = lazy(() => import('../pages/Landing').then(m => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('../pages/Auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/Auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const PendingApprovalPage = lazy(() => import('../pages/Auth/PendingApprovalPage').then(m => ({ default: m.PendingApprovalPage })));
const ForgotPasswordPage = lazy(() => import('../pages/Auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../pages/Auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const MfaChallengePage = lazy(() => import('../pages/Auth/MfaChallengePage').then(m => ({ default: m.MfaChallengePage })));
const DocsPage = lazy(() => import('../pages/Docs/DocsPage').then(m => ({ default: m.DocsPage })));

const DashboardPage = lazy(() => import('../pages/Admin/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ApiKeysPage = lazy(() => import('../pages/Admin/ApiKeysPage').then(m => ({ default: m.ApiKeysPage })));
const WebhooksPage = lazy(() => import('../pages/Admin/WebhooksPage').then(m => ({ default: m.WebhooksPage })));
const ReportsPage = lazy(() => import('../pages/Admin/ReportsPage').then(m => ({ default: m.ReportsPage })));
const DriversPage = lazy(() => import('../pages/Admin/DriversPage').then(m => ({ default: m.DriversPage })));
const RolesPage = lazy(() => import('../pages/Admin/RolesPage').then(m => ({ default: m.RolesPage })));
const UsersPage = lazy(() => import('../pages/Admin/UsersPage').then(m => ({ default: m.UsersPage })));
const AuditLogsPage = lazy(() => import('../pages/Admin/AuditLogsPage').then(m => ({ default: m.AuditLogsPage })));
const DeliveriesPage = lazy(() => import('../pages/Admin/DeliveriesPage').then(m => ({ default: m.DeliveriesPage })));
const CustomersPage = lazy(() => import('../pages/Admin/CustomersPage').then(m => ({ default: m.CustomersPage })));
const SettingsPage = lazy(() => import('../pages/Admin/SettingsPage').then(m => ({ default: m.SettingsPage })));
const SecurityCenterPage = lazy(() => import('../pages/Admin/SecurityCenterPage').then(m => ({ default: m.SecurityCenterPage })));
const ConsoleModulePage = lazy(() => import('../pages/Admin/ConsoleModulePage').then(m => ({ default: m.ConsoleModulePage })));

const ClientDashboardPage = lazy(() => import('../pages/Client/DashboardPage').then(m => ({ default: m.ClientDashboardPage })));
const PlatformDashboardPage = lazy(() => import('../pages/Platform/PlatformDashboardPage').then(m => ({ default: m.PlatformDashboardPage })));
const PlatformCompaniesPage = lazy(() => import('../pages/Platform/PlatformCompaniesPage').then(m => ({ default: m.PlatformCompaniesPage })));
const PlatformPendingApprovalsPage = lazy(() => import('../pages/Platform/PlatformPendingApprovalsPage').then(m => ({ default: m.PlatformPendingApprovalsPage })));
const PlatformUsersPage = lazy(() => import('../pages/Platform/PlatformUsersPage').then(m => ({ default: m.PlatformUsersPage })));
const PlatformRolesPage = lazy(() => import('../pages/Platform/PlatformRolesPage').then(m => ({ default: m.PlatformRolesPage })));
const PlatformDeliveriesPage = lazy(() => import('../pages/Platform/PlatformDeliveriesPage').then(m => ({ default: m.PlatformDeliveriesPage })));
const PlatformDriversPage = lazy(() => import('../pages/Platform/PlatformDriversPage').then(m => ({ default: m.PlatformDriversPage })));
const PlatformPage = lazy(() => import('../pages/Platform/PlatformPage').then(m => ({ default: m.PlatformPage })));

function PrivateRoute({ children }: { children: JSX.Element }) {
  const auth = useAuth();

  if (auth.loading) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#cbd5e1' }}>Loading account…</div>;
  }

  return auth.isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PlatformRoute({ children }: { children: JSX.Element }) {
  const auth = useAuth();

  if (auth.loading) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#cbd5e1' }}>Loading platform access…</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isPlatformOwner = auth.user?.is_system_owner || auth.hasPermission('manage.system');

  return isPlatformOwner ? children : <Navigate to="/admin" replace />;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}>Loading…</div>}>
        <Routes>
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
        <Route path="/admin/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
        <Route path="/platform/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
        <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />
        <Route path="/reset-password" element={<PublicLayout><ResetPasswordPage /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
        <Route path="/pending-approval" element={<PublicLayout><PendingApprovalPage /></PublicLayout>} />
        <Route path="/mfa-challenge" element={<PublicLayout><MfaChallengePage /></PublicLayout>} />
        <Route path="/docs" element={<PublicLayout><DocsPage /></PublicLayout>} />
        <Route path="/docs/getting-started" element={<PublicLayout><DocsPage /></PublicLayout>} />
        <Route path="/docs/api" element={<PublicLayout><DocsPage /></PublicLayout>} />
        <Route path="/docs/auth" element={<PublicLayout><DocsPage /></PublicLayout>} />

        <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="api-keys" element={<ApiKeysPage />} />
          <Route path="webhooks" element={<WebhooksPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="security" element={<SecurityCenterPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="deliveries" element={<DeliveriesPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="organizations" element={<PlatformCompaniesPage title="All Organizations" description="Manage every organization registered on the platform with lifecycle, verification, and governance controls." />} />
          <Route path="organizations/pending-approvals" element={<PlatformPendingApprovalsPage />} />
          <Route path="organizations/approved" element={<PlatformCompaniesPage title="Approved Organizations" description="Review the organizations already approved for platform access and production operations." filterStatus="active" />} />
          <Route path="organizations/suspended" element={<PlatformCompaniesPage title="Suspended Organizations" description="Inspect suspended organizations and restore service where appropriate." filterStatus="suspended" />} />
          <Route path="organizations/categories" element={<ConsoleModulePage title="Organization Categories" description="Organize tenants by business type, industry, and operating model for better governance and reporting." summary="Category-based segmentation helps platform leaders manage onboarding, support, and policy alignment at scale." highlights={["Classify organizations", "Align regional and industry policies", "Improve reporting segmentation", "Support platform onboarding"]} />} />
          <Route path="organizations/verification" element={<ConsoleModulePage title="Organization Verification" description="Track document validation, verification checkpoints, and review outcomes for onboarding workflows." summary="Verification status gives the platform owner visibility into trust and compliance readiness." highlights={["Verify submitted documents", "Review risk indicators", "Track authorization status", "Maintain approval history"]} />} />
          <Route path="docs" element={<DocsPage />} />
        </Route>

        <Route path="/platform/*" element={<PlatformRoute><PlatformLayout /></PlatformRoute>}>
          <Route index element={<PlatformDashboardPage />} />
          <Route path="companies" element={<PlatformCompaniesPage />} />
          <Route path="pending-approvals" element={<PlatformPendingApprovalsPage />} />
          <Route path="users" element={<PlatformUsersPage />} />
          <Route path="roles" element={<PlatformRolesPage />} />
          <Route path="deliveries" element={<PlatformDeliveriesPage />} />
          <Route path="drivers" element={<PlatformDriversPage />} />
          <Route path="map" element={<PlatformPage title="Live Fleet Map" description="View active company fleets and real-time delivery status." />} />
          <Route path="intelligence" element={<PlatformPage title="Business Intelligence" description="Analyze cross-tenant activity, trends, and platform health." />} />
          <Route path="analytics" element={<PlatformPage title="Analytics" description="Track platform metrics, KPIs, and growth signals." />} />
          <Route path="reports" element={<PlatformPage title="Reports" description="Generate compliance and operational reports for the platform." />} />
          <Route path="subscriptions" element={<PlatformPage title="Subscription Management" description="Manage tenant billing plans and subscription lifecycle." />} />
          <Route path="revenue" element={<PlatformPage title="Revenue Dashboard" description="Track platform revenue, margins, and financial performance." />} />
          <Route path="api-keys" element={<PlatformPage title="API Key Management" description="Provision and revoke platform API credentials." />} />
          <Route path="webhooks" element={<PlatformPage title="Webhook Management" description="Configure and test platform-wide webhook integrations." />} />
          <Route path="email" element={<PlatformPage title="Email Service" description="Monitor platform email delivery and notification workflows." />} />
          <Route path="notifications" element={<PlatformPage title="Notifications" description="Control platform alerts, notifications, and admin broadcasts." />} />
          <Route path="security" element={<PlatformPage title="Security Center" description="Manage platform security posture and access controls." />} />
          <Route path="audit-logs" element={<PlatformPage title="Audit Logs" description="Review audit trails and platform security events." />} />
          <Route path="configuration" element={<PlatformPage title="System Configuration" description="Adjust platform-level settings and system policies." />} />
          <Route path="localization" element={<PlatformPage title="Localization" description="Manage language, region and localization settings." />} />
          <Route path="monitoring" element={<PlatformPage title="Server Monitoring" description="View platform monitoring and operational status." />} />
          <Route path="database" element={<PlatformPage title="Database Health" description="Inspect database status and storage metrics." />} />
          <Route path="queue" element={<PlatformPage title="Queue Monitor" description="Observe platform queue and background job processing." />} />
          <Route path="mail" element={<PlatformPage title="Mail Queue" description="Review email queue and delivery operations." />} />
          <Route path="errors" element={<PlatformPage title="Error Monitoring" description="Track errors and system exception trends." />} />
          <Route path="activity" element={<PlatformPage title="Activity Timeline" description="Browse platform activity and admin actions." />} />
          <Route path="profile" element={<PlatformPage title="Administrator Profile" description="Manage your platform owner profile and preferences." />} />
          <Route path="help" element={<PlatformPage title="Help Center" description="Find help resources and platform documentation." />} />
        </Route>

        <Route path="/client" element={<PrivateRoute><ClientLayout /></PrivateRoute>}>
          <Route index element={<ClientDashboardPage />} />
          <Route path="docs" element={<DocsPage />} />
        </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
