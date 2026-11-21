import React from 'react';
import { Navbar, Nav, Container, Badge, Button } from 'react-bootstrap';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Bus,
  GitCompare,
  BarChart3,
  MapPin,
  Sparkles,
  Info,
  LayoutDashboard,
  ArrowRight,
  Home
} from 'lucide-react';

export const AppNavbar = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/' || location.pathname === '/landing';

  return (
    <Navbar expand="lg" className="navbar-transitpulse sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="navbar-brand-logo">
          <div className="brand-bus-icon-wrapper">
            <Bus size={22} className="text-white" />
          </div>
          <div className="d-flex flex-column">
            <span className="brand-title">
              Transit<span className="brand-highlight">Pulse</span>
            </span>
            <span className="brand-subtitle">Madurai Transport Analytics</span>
          </div>
          <div className="live-pulse-pill ms-2 d-none d-sm-flex align-items-center gap-1">
            <span className="pulse-beacon"></span>
            <span>TNSTC Live</span>
          </div>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="main-navbar-nav" className="border-0 shadow-none" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="ms-auto align-items-lg-center gap-1">
            {isLandingPage ? (
              /* =========================================================
                 LANDING PAGE NAV: Clean Presentation & "Launch Dashboard"
                 ========================================================= */
              <>
                <Nav.Link as={Link} to="/#features" className="nav-link-tp">
                  Features
                </Nav.Link>
                <Nav.Link as={Link} to="/#corridors" className="nav-link-tp">
                  Madurai Corridors
                </Nav.Link>
                <Nav.Link as={Link} to="/#pipeline" className="nav-link-tp">
                  Architecture
                </Nav.Link>
                <Nav.Link as={NavLink} to="/about" className="nav-link-tp">
                  <Info size={15} className="me-1 d-inline" /> About
                </Nav.Link>
                <Button
                  as={Link}
                  to="/dashboard"
                  variant="primary"
                  className="ms-lg-3 px-3 py-1 fw-bold d-inline-flex align-items-center gap-2 shadow-sm rounded-pill"
                >
                  <LayoutDashboard size={15} />
                  <span>Launch Dashboard</span>
                  <ArrowRight size={14} />
                </Button>
              </>
            ) : (
              /* =========================================================
                 APP & DASHBOARD NAV: Full Suite of Next-Next Pages
                 ========================================================= */
              <>
                <Nav.Link as={NavLink} to="/dashboard" className="nav-link-tp">
                  <LayoutDashboard size={15} className="me-1 d-inline text-primary" /> Dashboard
                </Nav.Link>
                <Nav.Link as={NavLink} to="/routes" className="nav-link-tp">
                  <Bus size={15} className="me-1 d-inline" /> Corridors
                </Nav.Link>
                <Nav.Link as={NavLink} to="/stops" className="nav-link-tp">
                  <MapPin size={15} className="me-1 d-inline" /> Bus Stops
                </Nav.Link>
                <Nav.Link as={NavLink} to="/compare" className="nav-link-tp">
                  <GitCompare size={15} className="me-1 d-inline" /> Benchmark
                </Nav.Link>
                <Nav.Link as={NavLink} to="/analytics" className="nav-link-tp">
                  <BarChart3 size={15} className="me-1 d-inline" /> Analytics
                </Nav.Link>
                <Nav.Link as={NavLink} to="/insights" className="nav-link-tp">
                  <Sparkles size={15} className="me-1 d-inline text-warning" /> Insights
                </Nav.Link>
                <Nav.Link as={NavLink} to="/about" className="nav-link-tp">
                  <Info size={15} className="me-1 d-inline" /> About
                </Nav.Link>
                <Button
                  as={Link}
                  to="/"
                  variant="outline-secondary"
                  size="sm"
                  className="ms-lg-2 px-2 py-1 glass-btn d-inline-flex align-items-center gap-1 rounded-pill small"
                  title="Return to Landing Page"
                >
                  <Home size={13} />
                  <span>Landing</span>
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
