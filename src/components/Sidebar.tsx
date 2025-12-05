import React from 'react';
import { LayoutDashboard, Users, User, LogOut, Settings, FileText, Briefcase, Menu, X, Layers, FolderOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  role: 'client' | 'agent' | 'admin';
  activePage: string;
  onNavigate: (page: string) => void;
  userName?: string;
}

export function Sidebar({ role, activePage, onNavigate, userName = 'User' }: SidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { logout } = useAuth();
  
  const agentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/agent/dashboard' },
    { id: 'clients', label: 'Clients', icon: Users, path: '/agent/clients' },
    { id: 'projects', label: 'Projects', icon: Briefcase, path: '/agent/projects' },
    { id: 'profile', label: 'Profile', icon: User, path: '/agent/profile' },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'approvals', label: 'User Approvals', icon: Users, path: '/admin/approvals' },
    { id: 'services', label: 'Services', icon: Layers, path: '/admin/services' },
    { id: 'clients', label: 'Clients', icon: Users, path: '/admin/clients' }, // Added
    { id: 'agents', label: 'Agents', icon: User, path: '/admin/agents' },
    { id: 'requests', label: 'Requests', icon: FileText, path: '/admin/requests' },
    { id: 'projects', label: 'All Projects', icon: FolderOpen, path: '/admin/projects' }, // Added
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const menuItems = role === 'admin' ? adminMenuItems : agentMenuItems;

  const handleNavigation = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#0D1B2A] border-b border-white/10 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2EC4B6] rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">BT</span>
            </div>
            <span className="text-white text-lg font-semibold">BizSetup</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 mt-[64px]"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={`
          fixed top-0 left-0 h-screen bg-[#0D1B2A] text-white flex flex-col z-50
          transition-transform duration-300 ease-in-out
          w-64
          lg:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:mt-0 mt-[64px]
        `}
      >
        <div className="hidden lg:block p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2EC4B6] rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">BT</span>
            </div>
            <span className="text-white text-xl font-semibold">BizSetup</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.path;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#2EC4B6] text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 bg-[#2EC4B6] rounded-full flex items-center justify-center">
              <span className="text-white text-sm">{userName.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-white text-sm truncate max-w-[140px]">{userName}</p>
              <p className="text-gray-400 text-xs capitalize">{role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}