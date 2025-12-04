/**
 * BizTech Biz Digital - Centralized Type Definitions
 */

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export type UserRole = 'client' | 'agent' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  company?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  companyName?: string;
  phone?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export type RequestStatus = 
  | 'new'
  | 'pending-review' 
  | 'awaiting-quote' 
  | 'action-required'
  | 'proposal-sent'
  | 'accepted'
  | 'rejected'
  | 'in-progress'
  | 'completed';

export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ServiceRequest {
  id: string;
  client: string;
  clientId?: string;
  clientEmail: string;
  agent?: string;
  agentId?: string;
  category: string;
  subcategory?: string;
  title?: string;
  description?: string;
  details: string;
  status: string;
  priority?: string;
  budget?: string;
  timeline?: string;
  dateSubmitted: string;
  createdAt: string;
  updatedAt?: string;
  proposalAmount?: string;
  proposalSent?: boolean;
  proposalId?: string; // Added
  pdfPath?: string;    // Added
  attachments?: any[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedDate: string;
  uploadedBy: string;
}

// ============================================================================
// CLIENT TYPES
// ============================================================================

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  industry: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'pending';
  projectsCount: number;
  activeProjects?: number;
  totalSpent?: number;
  joinedDate: string;
  lastActivity?: string;
}

// ============================================================================
// AGENT TYPES
// ============================================================================

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  expertise: string[];
  status: 'active' | 'inactive' | 'on-leave';
  activeProjects: number;
  completedProjects: number;
  rating?: number;
  revenue?: number;
  joinedDate: string;
  avatar?: string;
}

export interface AgentStats {
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  avgRating: number;
}

// ============================================================================
// PROJECT TYPES
// ============================================================================

export type ProjectStatus = 'planning' | 'in-progress' | 'review' | 'completed' | 'delivered' | 'pending' | 'on-hold';

export interface Project {
  id: string;
  name: string;
  client: string;
  clientId?: string;
  clientEmail?: string;
  agent?: string;
  agentId?: string;
  category: string;
  status: string;
  progress: number;
  startDate?: string;
  deadline?: string;
  ecd?: string;
  estimatedCompletion?: string;
  budget?: string | number;
  spent?: number;
  description?: string;
  milestones?: any[];
  deliverables?: any[];
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  completedDate?: string;
  progress: number;
}

export interface Deliverable {
  id: string;
  name: string;
  description?: string;
  type: 'file' | 'link' | 'document';
  status: 'pending' | 'delivered' | 'approved' | 'rejected';
  url?: string;
  uploadedDate?: string;
  approvedDate?: string;
}

// ============================================================================
// PROPOSAL TYPES
// ============================================================================

export interface Proposal {
  id: string;
  requestId: string;
  agentId: string;
  clientId: string;
  title: string;
  description: string;
  scope: string[];
  deliverables: any[];
  timeline: string;
  budget: number;
  terms?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdDate: string;
  sentDate?: string;
  expiryDate?: string;
  acceptedDate?: string;
}

export interface ProposalDeliverable {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
}

// ============================================================================
// DOCUMENT & VAULT TYPES
// ============================================================================

export type DocumentType = 'credential' | 'contract' | 'invoice' | 'report' | 'other';
export type DocumentStatus = 'active' | 'archived' | 'expired';

export interface Document {
  id: string;
  name: string;
  type: string;
  category?: string;
  description?: string;
  url?: string;
  size?: number;
  uploadedDate: string;
  uploadedBy: string;
  lastAccessed?: string;
  expiryDate?: string;
  status: string;
  isEncrypted?: boolean;
  sharedWith?: string[];
}

export interface VaultCredential {
  id: string;
  service: string;
  username: string;
  password?: string; // Encrypted
  url?: string;
  notes?: string;
  category: string;
  createdDate: string;
  lastModified: string;
  sharedWith: string[];
  isActive: boolean;
}

// ============================================================================
// NEEDS ASSESSMENT TYPES
// ============================================================================

export interface NeedsAssessmentData {
  serviceType: string;
  subcategory?: string;
  projectTitle?: string;
  projectDescription: string;
  goals: string[];
  targetAudience?: string;
  technicalRequirements?: string[];
  platforms?: string[];
  integrations?: string[];
  timeline: string;
  budget: string;
  flexibleTimeline?: boolean;
  flexibleBudget?: boolean;
  hasExistingAssets?: boolean;
  existingAssets?: string;
  competitorReferences?: string;
  additionalNotes?: string;
  attachments?: File[];
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

// ============================================================================
// DASHBOARD STATS TYPES
// ============================================================================

export interface ClientDashboardStats {
  activeProjects: number;
  completedProjects: number;
  pendingRequests: number;
  totalSpent: number;
}

export interface AgentDashboardStats {
  activeProjects: number;
  totalClients: number;
  pendingRequests: number;
  monthlyRevenue: number;
}

export interface AdminDashboardStats {
  totalClients: number;
  totalAgents: number;
  activeProjects: number;
  pendingApprovals: number;
  monthlyRevenue: number;
  newRequests: number;
}

// ============================================================================
// APPROVAL TYPES
// ============================================================================

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ApprovalType = 'user-registration' | 'agent-application' | 'project-proposal';

export interface Approval {
  id: string;
  type: ApprovalType;
  applicantName: string;
  applicantEmail: string;
  dateSubmitted: string;
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewedDate?: string;
  notes?: string;
  details?: any; // Type-specific details
}

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export interface PlatformSettings {
  platformName: string;
  platformEmail: string;
  platformPhone?: string;
  supportEmail: string;
  allowClientRegistration: boolean;
  requireAdminApproval: boolean;
  enableNotifications: boolean;
  enableTwoFactor: boolean;
  defaultCommissionRate?: number;
  currency: string;
  timezone: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireStrongPassword: boolean;
}

export interface UserSettings {
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  twoFactorEnabled: boolean;
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  fullName: string;
  companyName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  industry?: string;
  agreeToTerms?: boolean;
}

export interface ProfileFormData {
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  industry?: string;
  companySize?: string;
  address?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
  projects: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  order: SortOrder;
}

export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'in';
  value: any;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  sort?: SortConfig;
  filters?: FilterConfig[];
}

export interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'outlined';
}

export interface ProgressCircleProps {
  progress?: number;
  percentage?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export interface SidebarProps {
  role: 'client' | 'agent' | 'admin';
  activePage: string;
  onNavigate: (page: string) => void;
  userName?: string;
}