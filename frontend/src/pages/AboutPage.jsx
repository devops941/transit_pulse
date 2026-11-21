import React from 'react';
import { Container, Row, Col, Card, Badge, Accordion, Table } from 'react-bootstrap';
import { ShieldCheck, Database, BookOpen, AlertCircle, FileText, CheckCircle } from 'lucide-react';

export const AboutPage = () => {
  return (
    <Container className="py-5">
      {/* Header */}
      <div className="mb-4">
        <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 mb-2">
          Module 12: About & Methodology
        </Badge>
        <h2 className="fw-bold text-dark mb-1">Platform Architecture & Data Methodology</h2>
        <p className="text-muted small mb-0">
          Complete transparency documentation detailing data provenance, mathematical formulas, and scientific limitations.
        </p>
      </div>

      {/* Core Grounding Commitment */}
      <Card className="tp-card border-primary mb-4">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <ShieldCheck size={24} className="text-success" />
            <h5 className="fw-bold text-dark mb-0">The TransitPulse Grounding Guarantee</h5>
          </div>
          <p className="text-muted small mb-0">
            TransitPulse is built on a non-negotiable principle of <strong>absolute data authenticity</strong>.
            Static GTFS timetables represent planned commitments, not actual arrivals. The platform never calculates or reports bus arrival delays unless a verified actual arrival observation exists from Automated Vehicle Location (AVL) GPS feeds, station dispatcher logs, or verified field surveys. <strong>No simulated or fabricated delays are ever presented as real historical facts.</strong>
          </p>
        </Card.Body>
      </Card>

      <Row className="gy-4 mb-4">
        {/* Data Provenance */}
        <Col md={6}>
          <Card className="tp-card h-100">
            <Card.Header className="bg-white border-bottom py-3">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <Database size={18} className="text-primary" />
                Data Provenance & Authorities
              </h6>
            </Card.Header>
            <Card.Body>
              <p className="small text-muted mb-3">
                TransitPulse synthesizes public transport records covering the Madurai District Metropolitan Area, Tamil Nadu:
              </p>
              <ul className="small text-muted d-flex flex-column gap-2 mb-0">
                <li>
                  <strong>Tamil Nadu State Transport Corporation (Madurai) Ltd (TNSTC-Madurai):</strong> Official regional public bus operator managing city & district schedules, Periyar, Mattuthavani MGR Terminus, and Arapalayam depots.
                </li>
                <li>
                  <strong>Madurai Unified City Transport Network:</strong> Key arterial corridors connecting Mattuthavani, Periyar, Goripalayam, Thirupparankundram, Thirumangalam, and Othakadai.
                </li>
                <li>
                  <strong>Open Government Data (OGD) Tamil Nadu:</strong> Official state transit timetable repositories and GPS observation logs.
                </li>
                <li>
                  <strong>Licensing:</strong> Government Open Data License (GODL) India & Open Data Commons Open Database License (ODbL).
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        {/* Delay Calculation Methodology */}
        <Col md={6}>
          <Card className="tp-card h-100">
            <Card.Header className="bg-white border-bottom py-3">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <BookOpen size={18} className="text-primary" />
                Mathematical Delay Formulas
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="p-3 bg-light rounded font-monospace small mb-3">
                Delay Minutes = (Actual Arrival Time - Scheduled Arrival Time) / 60
              </div>
              <p className="small text-muted mb-2">
                <strong>Arrival Status Classification:</strong>
              </p>
              <ul className="small text-muted mb-3">
                <li><span className="badge bg-success me-1">ON_TIME</span> Delay within [-1.0, +5.0] minutes</li>
                <li><span className="badge bg-danger me-1">DELAYED</span> Delay &gt; 5.0 minutes</li>
                <li><span className="badge bg-info me-1">EARLY</span> Delay &lt; -1.0 minutes</li>
              </ul>
              <p className="small text-muted mb-0">
                <strong>Route Reliability Score (0 - 100):</strong> Standardized composite metric weighting on-time rate (70%), delay magnitude penalty (20%), and headway schedule variance penalty (10%).
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Overnight Trip Handling & Quarantining Accordion */}
      <Card className="tp-card mb-4">
        <Card.Header className="bg-white border-bottom py-3">
          <h5 className="fw-bold text-dark mb-0">ETL Validation Pipeline & Limitations</h5>
        </Card.Header>
        <Card.Body>
          <Accordion defaultActiveKey="0" flush>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Overnight Bus Trip Normalization (&ge; 24:00:00)</Accordion.Header>
              <Accordion.Body className="small text-muted">
                In standard GTFS feeds, trips crossing past midnight often specify arrival times such as <code>24:30:00</code> or <code>25:15:00</code>. TransitPulse's ingestion engine decomposes hours exceeding 24 into normalized 24-hour clocks and advances the calendar day offset, ensuring uninterrupted schedule comparison without date parsing crashes.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header>Data Quarantining & Rejection Protocol</Accordion.Header>
              <Accordion.Body className="small text-muted">
                Any raw record with missing actual arrival timestamps, corrupted stop identifiers, schedule sequence mismatches, or extreme telemetry sensor glitches (&gt; 180 min) is quarantined into <code>rejected_observations.csv</code> with explicit failure reason codes. Original records are preserved untouched.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header>Historical Analysis Limitations</Accordion.Header>
              <Accordion.Body className="small text-muted">
                Historical transit intelligence reflects empirical conditions during the monitored observation window (October 2026). Real-time weather disruptions, unplanned road infrastructure works, or unexpected traffic diversions on future dates may cause variances from historical averages.
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AboutPage;
