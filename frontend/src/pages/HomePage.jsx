import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bus,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Database,
  BarChart3,
  Calendar,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import api from '../services/api';
import MetricCard from '../components/MetricCard';
import ReliabilityBadge from '../components/ReliabilityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export const HomePage = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [stops, setStops] = useState([]);
  const [sourceStop, setSourceStop] = useState('');
  const [destStop, setDestStop] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, stopsRes] = await Promise.all([
        api.getOverview(),
        api.getStops('', 'stop_name', 'asc')
      ]);
      setOverview(overviewRes.data);
      setStops(stopsRes.data || []);
      // Set reasonable defaults if available
      if (stopsRes.data?.length > 1) {
        setSourceStop('ST_MDU_PERIYAR');
        setDestStop('ST_MDU_THIRUNAGAR');
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize platform data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!sourceStop || !destStop) return;
    if (sourceStop === destStop) {
      alert('Source and destination cannot be identical.');
      return;
    }

    setSearchLoading(true);
    try {
      const res = await api.searchRoutes(sourceStop, destStop);
      setSearchResults(res.data || []);
    } catch (err) {
      alert(err.message || 'Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading TransitPulse historical delay intelligence..." />;
  }

  if (error) {
    return (
      <Container className="my-5">
        <ErrorMessage message={error} onRetry={fetchInitialData} />
      </Container>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center gy-4">
            <Col lg={7}>
              <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 mb-3 px-3 py-2 fw-medium">
                Madurai District Public Bus Delay Intelligence & Route Reliability
              </Badge>
              <h1 className="hero-title display-5 mb-3">
                Transparent Public Bus Punctuality & Corridor Insights — Madurai District
              </h1>
              <p className="hero-subtitle mb-4">
                Explore empirical arrival delays, evaluate route punctuality scores, and discover congestion bottlenecks across TNSTC Madurai corridors based on verified historical transport records.
              </p>
              <div className="d-flex flex-wrap gap-2 text-muted small">
                <span className="d-flex align-items-center gap-1">
                  <ShieldCheck size={16} className="text-success" />
                  <strong>Zero Mock Delay Data</strong>
                </span>
                <span>•</span>
                <span className="d-flex align-items-center gap-1">
                  <Database size={16} className="text-primary" />
                  <span>TNSTC Madurai Timetables</span>
                </span>
                <span>•</span>
                <span className="d-flex align-items-center gap-1">
                  <Clock size={16} className="text-warning" />
                  <span>Actual GPS Observations</span>
                </span>
              </div>
            </Col>
            
            {/* Search Box Card */}
            <Col lg={5}>
              <div className="search-box-container">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Search size={20} className="text-primary" />
                  <h5 className="fw-bold mb-0 text-dark">Find Bus Routes</h5>
                </div>
                <Form onSubmit={handleSearch}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">ORIGIN BUS STOP</Form.Label>
                    <Form.Select
                      value={sourceStop}
                      onChange={(e) => setSourceStop(e.target.value)}
                      required
                    >
                      <option value="">Select origin stop...</option>
                      {stops.map((s) => (
                        <option key={s.stop_id} value={s.stop_id}>
                          {s.stop_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">DESTINATION BUS STOP</Form.Label>
                    <Form.Select
                      value={destStop}
                      onChange={(e) => setDestStop(e.target.value)}
                      required
                    >
                      <option value="">Select destination stop...</option>
                      {stops.map((s) => (
                        <option key={s.stop_id} value={s.stop_id}>
                          {s.stop_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    disabled={searchLoading}
                  >
                    {searchLoading ? 'Searching verified routes...' : 'Search Available Routes'}
                    <ArrowRight size={18} />
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>

          {/* Search Results Display if available */}
          {searchResults !== null && (
            <Row className="mt-4">
              <Col>
                <Card className="tp-card shadow-sm border-primary">
                  <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-0 text-dark">
                      Route Search Results: Found {searchResults.length} Connecting Corridors
                    </h6>
                    <Button variant="outline-secondary" size="sm" onClick={() => setSearchResults(null)}>
                      Clear Results
                    </Button>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {searchResults.length === 0 ? (
                      <div className="p-4 text-center text-muted">
                        No direct scheduled routes currently connect the selected stops in this direction.
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <Table hover className="align-middle mb-0">
                          <thead className="table-light small text-uppercase text-muted">
                            <tr>
                              <th>Route</th>
                              <th>Corridor Name</th>
                              <th>Intermediate Stops</th>
                              <th>Reliability Score</th>
                              <th>Avg Delay</th>
                              <th>On-Time %</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {searchResults.map((r) => (
                              <tr key={r.route_id}>
                                <td>
                                  <Badge bg="primary" className="px-2 py-1 fs-6">
                                    {r.route_short_name}
                                  </Badge>
                                </td>
                                <td>
                                  <div className="fw-semibold text-dark">{r.route_long_name}</div>
                                  <div className="small text-muted">
                                    {r.source_stop} &rarr; {r.destination_stop}
                                  </div>
                                </td>
                                <td>
                                  <Badge bg="light" text="dark" className="border">
                                    {r.intermediate_stops_count} stops
                                  </Badge>
                                </td>
                                <td>
                                  <ReliabilityBadge score={r.reliability_score} />
                                </td>
                                <td>
                                  <span className={r.average_delay_minutes > 8 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                                    +{r.average_delay_minutes} min
                                  </span>
                                </td>
                                <td>
                                  <span className="fw-semibold text-dark">{r.on_time_percentage}%</span>
                                </td>
                                <td>
                                  <Button
                                    as={Link}
                                    to={`/routes/${r.route_id}`}
                                    variant="outline-primary"
                                    size="sm"
                                  >
                                    View Dossier
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </section>

      {/* Historical Statistics Section */}
      <section className="py-5">
        <Container>
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
            <div>
              <h3 className="fw-bold text-dark mb-1">Network Performance Overview</h3>
              <p className="text-muted small mb-0">
                Aggregated empirical analytics across 30 operational days ({overview?.date_range?.start} to {overview?.date_range?.end})
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <Button as={Link} to="/analytics" variant="outline-primary" size="sm" className="d-flex align-items-center gap-1">
                <BarChart3 size={15} /> Explore Analytics
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => api.downloadReportPdf(null)}
                className="d-flex align-items-center gap-1"
              >
                <Download size={14} /> Download PDF Dossier
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => api.downloadReportExcel(null)}
                className="d-flex align-items-center gap-1"
              >
                <FileSpreadsheet size={14} /> Excel Data
              </Button>
            </div>
          </div>

          <Row className="g-3 mb-5">
            <Col sm={6} lg={3}>
              <MetricCard
                label="Valid Observations"
                value={overview?.total_valid_observations?.toLocaleString() || '0'}
                subtext="Verified timestamp records"
                icon={CheckCircle}
                variant="success"
              />
            </Col>
            <Col sm={6} lg={3}>
              <MetricCard
                label="Monitored Corridors"
                value={overview?.monitored_routes_count || '0'}
                subtext="Trunk & express routes"
                icon={Bus}
                variant="primary"
              />
            </Col>
            <Col sm={6} lg={3}>
              <MetricCard
                label="System On-Time %"
                value={`${overview?.system_on_time_percentage || 0}%`}
                subtext="Arrivals within [-1, +5] min"
                icon={Clock}
                variant="info"
              />
            </Col>
            <Col sm={6} lg={3}>
              <MetricCard
                label="System Average Delay"
                value={`+${overview?.system_average_delay_minutes || 0}m`}
                subtext={`Median: +${overview?.system_median_delay_minutes || 0} min`}
                icon={AlertTriangle}
                variant={overview?.system_average_delay_minutes > 8 ? 'danger' : 'warning'}
              />
            </Col>
          </Row>

          {/* Reliability Highlights */}
          <Row className="gy-4 mb-5">
            {/* Top Reliable Routes */}
            <Col md={6}>
              <Card className="tp-card h-100">
                <Card.Header className="bg-white border-bottom py-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="fw-bold text-dark d-flex align-items-center gap-2">
                      <CheckCircle size={18} className="text-success" />
                      Most Reliable Bus Routes
                    </span>
                    <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25">
                      Top Punctuality
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                      <thead className="small text-muted bg-light">
                        <tr>
                          <th>Route</th>
                          <th>Corridor</th>
                          <th>Reliability</th>
                          <th>Avg Delay</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview?.top_reliable_routes?.map((r) => (
                          <tr key={r.route_id}>
                            <td>
                              <Badge bg="primary">{r.route_short_name}</Badge>
                            </td>
                            <td>
                              <Link to={`/routes/${r.route_id}`} className="text-decoration-none fw-semibold text-dark">
                                {r.route_long_name}
                              </Link>
                            </td>
                            <td>
                              <ReliabilityBadge score={r.reliability_score} />
                            </td>
                            <td className="text-success fw-bold">
                              +{r.average_delay_minutes}m
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Top Congested Corridors */}
            <Col md={6}>
              <Card className="tp-card h-100">
                <Card.Header className="bg-white border-bottom py-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="fw-bold text-dark d-flex align-items-center gap-2">
                      <AlertTriangle size={18} className="text-danger" />
                      Corridors With Highest Delays
                    </span>
                    <Badge bg="danger" className="bg-opacity-10 text-danger border border-danger border-opacity-25">
                      High Congestion
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                      <thead className="small text-muted bg-light">
                        <tr>
                          <th>Route</th>
                          <th>Corridor</th>
                          <th>Reliability</th>
                          <th>Avg Delay</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview?.most_delayed_routes?.map((r) => (
                          <tr key={r.route_id}>
                            <td>
                              <Badge bg="secondary">{r.route_short_name}</Badge>
                            </td>
                            <td>
                              <Link to={`/routes/${r.route_id}`} className="text-decoration-none fw-semibold text-dark">
                                {r.route_long_name}
                              </Link>
                            </td>
                            <td>
                              <ReliabilityBadge score={r.reliability_score} />
                            </td>
                            <td className="text-danger fw-bold">
                              +{r.average_delay_minutes}m
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* How It Works Section */}
          <div className="bg-white rounded-3 p-4 p-md-5 border mb-5">
            <div className="text-center mb-5">
              <h3 className="fw-bold text-dark">How TransitPulse Works</h3>
              <p className="text-muted small mx-auto" style={{ maxWidth: '600px' }}>
                Transforming raw transit timetables and empirical arrival records into actionable public transport intelligence.
              </p>
            </div>
            <Row className="g-4 text-center">
              <Col md={3}>
                <div className="stop-sequence-badge mx-auto mb-3" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>1</div>
                <h6 className="fw-bold text-dark">Ingest Timetables</h6>
                <p className="text-muted small">Standard GTFS timetable feeds define routes, stops, and scheduled arrival targets.</p>
              </Col>
              <Col md={3}>
                <div className="stop-sequence-badge mx-auto mb-3" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>2</div>
                <h6 className="fw-bold text-dark">Verify Actual Arrival</h6>
                <p className="text-muted small">Empirical AVL GPS timestamps are matched against scheduled targets to determine arrival delay.</p>
              </Col>
              <Col md={3}>
                <div className="stop-sequence-badge mx-auto mb-3" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>3</div>
                <h6 className="fw-bold text-dark">Score Reliability</h6>
                <p className="text-muted small">Multi-dimensional models evaluate route punctuality, headway regularity, and stop bottlenecks.</p>
              </Col>
              <Col md={3}>
                <div className="stop-sequence-badge mx-auto mb-3" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>4</div>
                <h6 className="fw-bold text-dark">Public Intelligence</h6>
                <p className="text-muted small">Commuters view transparent performance metrics, compare routes, and download reports.</p>
              </Col>
            </Row>
          </div>

          {/* Data Methodology Callout */}
          <div className="p-4 rounded-3 border bg-light d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div>
              <h5 className="fw-bold text-dark mb-1">Methodology & Authenticity Commitment</h5>
              <p className="text-muted small mb-0">
                TransitPulse strictly guarantees that static GTFS schedules are never treated as actual arrival times. Delay is only computed when a genuine arrival observation exists.
              </p>
            </div>
            <Button as={Link} to="/about" variant="primary" className="text-nowrap fw-semibold">
              Read Full Methodology
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
