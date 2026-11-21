import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppNavbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Menu, Bus } from 'lucide-react';

export const MainLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLandingPage = location.pathname === '/' || location.pathname === '/landing';

  return (
    <div className={`app-shell ${!isLandingPage ? 'has-sidebar-layout' : ''}`}>
      {/* Dynamic Ambient Glassmorphism Lighting Blobs */}
      <div className="ambient-blob ambient-blob-1" aria-hidden="true"></div>
      <div className="ambient-blob ambient-blob-2" aria-hidden="true"></div>
      <div className="ambient-blob ambient-blob-3" aria-hidden="true"></div>

      {isLandingPage ? (
        // Landing Page: Full-width presentation with Top Landing Navbar
        <>
          <AppNavbar />
          <main className="main-content">
            <Outlet />
          </main>
          <Footer />
        </>
      ) : (
        // Dashboard & App Pages: Modern Left Glassmorphic Sidebar Layout
        <div className="app-layout-sidebar-container">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Slim Top Bar on Mobile to toggle Sidebar */}
          <div className="sidebar-mobile-topbar d-lg-none d-flex align-items-center justify-content-between p-2 px-3 border-bottom">
            <button
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 py-1 px-2"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open Sidebar Menu"
            >
              <Menu size={18} />
              <span className="small fw-semibold">Menu</span>
            </button>
            <div className="d-flex align-items-center gap-2">
              <Bus size={18} className="text-primary" />
              <span className="fw-bold small text-dark">TransitPulse @2026</span>
            </div>
            <span className="pulse-beacon"></span>
          </div>

          <div className="app-main-with-sidebar">
            <main className="main-content">
              <Outlet />
            </main>
            <Footer />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
