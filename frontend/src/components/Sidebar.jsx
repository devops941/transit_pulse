import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Bus,
  LayoutDashboard,
  MapPin,
  GitCompare,
  BarChart3,
  Sparkles,
  Info,
  Home,
  ShieldCheck,
  ChevronRight,
  X
} from 'lucide-react';
import BusDelayAnimation from './BusDelayAnimation';

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop when open */}
      {isOpen && (
        <div
          className="sidebar-mobile-backdrop d-lg-none"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`tp-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Sidebar Header with Brand */}
        <div className="sidebar-brand-header d-flex align-items-center justify-content-between p-3 border-bottom">
          <Link to="/" className="sidebar-brand-link text-decoration-none d-flex align-items-center gap-2">
            <div className="brand-bus-icon-wrapper-sm">
              <Bus size={18} className="text-white" />
            </div>
            <div className="d-flex flex-column">
              <span className="sidebar-brand-title">
                Transit<span className="text-primary">Pulse</span>
              </span>
              <span className="sidebar-brand-sub">Madurai Transport @2026</span>
            </div>
          </Link>
          {/* Mobile Close Button */}
          <button
            type="button"
            className="btn btn-sm btn-link text-muted d-lg-none p-1"
            onClick={onClose}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Bus Moving & Time Delay Animation Widget */}
        <div className="sidebar-animation-wrapper p-3 border-bottom">
          <BusDelayAnimation compact={true} />
        </div>

        {/* Main Navigation Links */}
        <div className="sidebar-nav-container p-2 flex-grow-1 overflow-auto">
          <span className="sidebar-section-heading text-uppercase px-3 py-2 d-block">
            Analytics Command
          </span>

          <nav className="nav flex-column gap-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <LayoutDashboard size={18} className="sidebar-nav-icon" />
              <span>Dashboard</span>
              <ChevronRight size={14} className="sidebar-nav-arrow ms-auto" />
            </NavLink>

            <NavLink
              to="/routes"
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <Bus size={18} className="sidebar-nav-icon" />
              <span>Corridors</span>
              <ChevronRight size={14} className="sidebar-nav-arrow ms-auto" />
            </NavLink>

            <NavLink
              to="/stops"
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <MapPin size={18} className="sidebar-nav-icon" />
              <span>Bus Stops</span>
              <ChevronRight size={14} className="sidebar-nav-arrow ms-auto" />
            </NavLink>

            <NavLink
              to="/compare"
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <GitCompare size={18} className="sidebar-nav-icon" />
              <span>Benchmark</span>
              <ChevronRight size={14} className="sidebar-nav-arrow ms-auto" />
            </NavLink>

            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <BarChart3 size={18} className="sidebar-nav-icon" />
              <span>Analytics</span>
              <ChevronRight size={14} className="sidebar-nav-arrow ms-auto" />
            </NavLink>

            <NavLink
              to="/insights"
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <Sparkles size={18} className="sidebar-nav-icon text-warning" />
              <span>Insights</span>
              <ChevronRight size={14} className="sidebar-nav-arrow ms-auto" />
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <Info size={18} className="sidebar-nav-icon" />
              <span>About &amp; GTFS</span>
              <ChevronRight size={14} className="sidebar-nav-arrow ms-auto" />
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Footer with Return to Landing & Data Trust */}
        <div className="sidebar-footer-container p-3 border-top mt-auto">
          <Link
            to="/"
            className="sidebar-landing-btn d-flex align-items-center justify-content-center gap-2 mb-2 text-decoration-none"
            onClick={onClose}
          >
            <Home size={15} />
            <span>Return to Landing Page</span>
          </Link>
          <div className="d-flex align-items-center justify-content-between text-muted micro-text pt-1">
            <span className="d-flex align-items-center gap-1">
              <ShieldCheck size={13} className="text-success" />
              <span>Zero Mock Delays</span>
            </span>
            <span className="badge bg-secondary bg-opacity-10 text-secondary border px-1">
              Madurai TNSTC
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
