import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ClientLayout, SidebarLayout } from './layout/Layouts';

// Public Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { PendingApproval } from './pages/PendingApproval';

// Client Pages
import { ClientDashboard } from './pages/ClientDashboard';
import { MyDocuments } from './pages/MyDocuments';
import { MyProfile } from './pages/MyProfile';
import { MyProjects } from './pages/MyProjects';
import { NeedsAssessment } from './pages/NeedsAssessment';
import { ProjectCommandCenter } from './pages/ProjectCommandCenter';

// Agent Pages
import { AgentDashboard } from './pages/AgentDashboard';
import { AgentClients } from './pages/AgentClients';
import { AgentProjects } from './pages/AgentProjects';
import { AgentProfile } from './pages/AgentProfile';
import { ProposalBuilder } from './pages/ProposalBuilder';
import { AgentProjectManagement } from './pages/AgentProjectManagement';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminApprovals } from './pages/AdminApprovals';
import { AdminAgents } from './pages/AdminAgents';
import { AdminRequests } from './pages/AdminRequests';
import { AdminSettings } from './pages/AdminSettings';
import { AdminServices } from './pages/AdminServices';
import { AdminClients } from './pages/AdminClients';   // <-- New
import { AdminProjects } from './pages/AdminProjects'; // <-- New

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen">
          <Toaster position="top-right" richColors />
          
          <Routes>
            {/* --- Public Routes (No Layout or specific internal layout) --- */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/pending-approval" element={<PendingApproval />} />

            {/* --- Client Routes (Uses ClientLayout with Header) --- */}
            <Route element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientLayout />
              </ProtectedRoute>
            }>
              <Route path="/client-dashboard" element={<ClientDashboard />} />
              <Route path="/my-documents" element={<Navigate to="/client-dashboard" replace />} />
              <Route path="/my-profile" element={<MyProfile />} />
              <Route path="/my-projects" element={<MyProjects />} />
              <Route path="/needs-assessment" element={<NeedsAssessment />} />
              <Route path="/project/:id" element={<ProjectCommandCenter />} />
            </Route>

            {/* --- Agent Routes (Uses SidebarLayout) --- */}
            <Route element={
              <ProtectedRoute allowedRoles={['agent']}>
                <SidebarLayout role="agent" />
              </ProtectedRoute>
            }>
              <Route path="/agent/dashboard" element={<AgentDashboard />} />
              <Route path="/agent/clients" element={<AgentClients />} />
              <Route path="/agent/projects" element={<AgentProjects />} />
              <Route path="/agent/profile" element={<AgentProfile />} />
              <Route path="/agent/proposal-builder/:requestId" element={<ProposalBuilder />} />
              <Route path="/agent/project-management/:id" element={<AgentProjectManagement />} />
            </Route>

            {/* --- Admin Routes (Uses SidebarLayout) --- */}
            <Route element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SidebarLayout role="admin" />
              </ProtectedRoute>
            }>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/approvals" element={<AdminApprovals />} />
              <Route path="/admin/agents" element={<AdminAgents />} />
              <Route path="/admin/services" element={<AdminServices />} />
              <Route path="/admin/requests" element={<AdminRequests />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/clients" element={<AdminClients />} />   {/* <-- New */}
              <Route path="/admin/projects" element={<AdminProjects />} /> {/* <-- New */}
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}