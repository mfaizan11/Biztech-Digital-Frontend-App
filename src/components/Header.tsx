import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logoImage from 'figma:asset/8c308caf909810f493480578c4eab6aa4f6235bf.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderProps {
  variant?: 'default' | 'transparent';
}

export function Header({ variant = 'default' }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (user?.role === 'agent' || user?.role === 'admin') {
    return null;
  }

  const headerClass = variant === 'transparent' 
    ? "bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50"
    : "bg-white border-b border-gray-200 sticky top-0 z-50";

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return isActive
      ? "text-[#2EC4B6] border-b-2 border-[#2EC4B6] pb-1 font-medium text-sm lg:text-base"
      : "text-gray-600 hover:text-[#1A202C] pb-1 font-medium text-sm lg:text-base transition-colors";
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className={headerClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 z-10 cursor-pointer" onClick={() => navigate(isAuthenticated ? '/client-dashboard' : '/')}>
            <img src={logoImage} alt="BizTech" className="h-7 sm:h-8" />
          </div>

          {/* === DESKTOP NAVIGATION === */}
          <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 gap-4 lg:gap-6">
            {!isAuthenticated ? (
              <></> 
            ) : (
              <>
                <button onClick={() => navigate('/client-dashboard')} className={getLinkClass('/client-dashboard')}>
                  Dashboard
                </button>
                <button onClick={() => navigate('/my-projects')} className={getLinkClass('/my-projects')}>
                  My Projects
                </button>
                <button onClick={() => navigate('/my-profile')} className={getLinkClass('/my-profile')}>
                  My Profile
                </button>
              </>
            )}
          </nav>

          {/* === RIGHT SIDE ACTIONS === */}
          <div className="flex items-center gap-3 z-10">
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="text-[#1A202C] hover:text-[#2EC4B6] transition-colors text-sm font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-[#2EC4B6] to-[#26a599] text-white px-5 py-2 rounded-lg hover:shadow-md transition-all text-sm font-medium"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <div className="w-8 h-8 bg-[#0D1B2A] rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:bg-[#1a2d42] transition-colors">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/my-profile')} className="cursor-pointer hover:bg-gray-100">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 hover:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[#0D1B2A] p-1"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* === MOBILE MENU === */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col gap-3">
              {!isAuthenticated ? (
                <>
                  <button 
                    onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                    className="w-full text-center border-2 border-[#0D1B2A] text-[#0D1B2A] py-2 rounded-lg font-medium"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                    className="w-full text-center bg-[#2EC4B6] text-white py-2 rounded-lg font-medium"
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => { navigate('/client-dashboard'); setMobileMenuOpen(false); }}
                    className={`text-left font-medium py-2 px-4 rounded-lg ${location.pathname === '/client-dashboard' ? 'text-[#2EC4B6] bg-[#F0FDFA]' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => { navigate('/my-projects'); setMobileMenuOpen(false); }}
                    className={`text-left font-medium py-2 px-4 rounded-lg ${location.pathname === '/my-projects' ? 'text-[#2EC4B6] bg-[#F0FDFA]' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    My Projects
                  </button>
                  <button 
                    onClick={() => { navigate('/my-profile'); setMobileMenuOpen(false); }}
                    className={`text-left font-medium py-2 px-4 rounded-lg ${location.pathname === '/my-profile' ? 'text-[#2EC4B6] bg-[#F0FDFA]' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    My Profile
                  </button>
                  <hr className="border-gray-100 my-1" />
                  <button 
                    onClick={handleLogout}
                    className="text-left text-red-600 font-medium py-2 px-4 hover:bg-red-50 rounded-lg flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}