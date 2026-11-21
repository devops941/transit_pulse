import React from 'react';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Bus, ShieldCheck, Database, FileText, MapPin, Sparkles, Activity } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer-tp">
      <Container>
        <Row className="gy-4 align-items-start">
          {/* Brand & Mission Column */}
          <Col lg={5} md={6}>
            <div className="d-flex align-items-center gap-2 mb-3 footer-brand-wrapper">
              <div className="brand-bus-icon-wrapper-sm">
                <Bus size={18} className="text-white" />
              </div>
              <span className="fw-bold fs-5 text-dark">
                Transit<span className="text-primary">Pulse</span>
              </span>
              <Badge bg="primary" className="footer-badge-year ms-1">
                @2026
              </Badge>
            </div>
            <p className="text-muted small mb-3 lh-base">
              Public Bus Delay Intelligence &amp; Route Reliability Platform for <strong>Madurai District (TNSTC)</strong>. 
              Empirically tracking arrival punctuality, corridor variance, and bus stop bottlenecks across verified historical transit logs.
            </p>
            <div className="d-flex align-items-center gap-2 text-muted small footer-subtext">
              <ShieldCheck size={16} className="text-success flex-shrink-0" />
              <span>Authentic Open Transit Records &bull; Zero Simulated Delays</span>
            </div>
          </Col>

          {/* Quick Analytics Portals */}
          <Col sm={6} lg={3} md={3} className="offset-lg-1">
            <h6 className="fw-bold text-dark text-uppercase small mb-3 letter-spacing-1">Analytics Portals</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li>
                <Link to="/routes" className="footer-link">
                  <span>&bull;</span> Corridor Reliability Rankings
                </Link>
              </li>
              <li>
                <Link to="/stops" className="footer-link">
                  <span>&bull;</span> Bus Stop Congestion Heatmap
                </Link>
              </li>
              <li>
                <Link to="/compare" className="footer-link">
                  <span>&bull;</span> Head-to-Head Benchmarking
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="footer-link">
                  <span>&bull;</span> Hourly &amp; Weekday Patterns
                </Link>
              </li>
              <li>
                <Link to="/insights" className="footer-link">
                  <span>&bull;</span> Dynamic Commuter Insights
                </Link>
              </li>
            </ul>
          </Col>

          {/* Madurai GTFS Provenance */}
          <Col sm={6} lg={3} md={3}>
            <h6 className="fw-bold text-dark text-uppercase small mb-3 letter-spacing-1">Madurai Transit Division</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li className="d-flex align-items-center gap-2 text-muted">
                <MapPin size={14} className="text-primary flex-shrink-0" />
                <span>10 Corridors &bull; 32 Key Stops</span>
              </li>
              <li className="d-flex align-items-center gap-2 text-muted">
                <Database size={14} className="text-primary flex-shrink-0" />
                <span>TNSTC Madurai Static GTFS</span>
              </li>
              <li className="d-flex align-items-center gap-2 text-muted">
                <FileText size={14} className="text-primary flex-shrink-0" />
                <span>GODL Compliant Records</span>
              </li>
              <li className="pt-1">
                <Link to="/about" className="footer-link text-primary fw-medium">
                  Methodology &amp; Architecture &rarr;
                </Link>
              </li>
            </ul>
          </Col>
        </Row>

        <hr className="my-4 border-slate-200 opacity-75" />

        {/* Responsive Bottom Copyright & Info Bar */}
        <div className="footer-bottom-bar d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 small text-muted">
          <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-sm-start gap-1">
            <span className="fw-bold text-dark">TransitPulse @2026</span>
            <span className="d-none d-sm-inline">&bull;</span>
            <span>Public Bus Delay Intelligence &amp; Route Reliability Analysis</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1">
              Madurai District Edition
            </span>
            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
              v1.0.0 (2026)
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
