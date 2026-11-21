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
  Download,
  FileSpreadsheet,
  GitCompare,
  Sparkles,
  Info,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Compass
} from 'lucide-react';
import api from '../services/api';
import MetricCard from '../components/MetricCard';
import ReliabilityBadge from '../components/ReliabilityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export const DashboardPage = () => {
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
      // Set reasonable defaults for Madurai
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
      alert('Origin and destination cannot be the same stop.');
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

  const swapStops = () => {
    const temp = sourceStop;
    setSourceStop(destStop);
    setDestStop(temp);
  };

  if (loading) {
    return <LoadingSpinner message="Loading TransitPulse Delay Intelligence Dashboard..." />;
  }

  if (error) {
    return (
      <Container className="my-5">
        <ErrorMessage message={error} onRetry={fetchInitialData} />
      </Container>
    );
  }

  return (
    <div className="dashboard-wrapper py-4">
      <Container>
        {/* =========================================================================
            EXECUTIVE DASHBOARD HEADER
            ========================================================================= */}
        <div className="dashboard-header-glass p-4 rounded-4 mb-4">
          <Row className="align-items-center gy-3">
            <Col lg={8}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="pulse-beacon"></span>
                <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1 fw-bold">
                  TNSTC Madurai Division &bull; Live Telemetry Feed
                </Badge>
                <span className="text-muted small">&bull; TransitPulse @2026</span>
              </div>
              <h2 className="fw-black text-dark mb-2">
                Madurai Public Bus Delay Intelligence Dashboard
              </h2>
              <p className="text-muted mb-0 small lh-base">
                Operational delay analytics across 10 trunk corridors and 32 bus stops. Grounded on 25,577 verified arrival records across 30 operational days ({overview?.date_range?.start} to {overview?.date_range?.end}).
              </p>
            </Col>
            <Col lg={4} className="text-lg-end">
              <div className="d-flex flex-wrap justify-content-lg-end gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => api.downloadReportPdf(null)}
                  className="d-flex align-items-center gap-1 shadow-sm"
                >
                  <Download size={14} /> Download PDF Dossier
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => api.downloadReportExcel(null)}
                  className="d-flex align-items-center gap-1 glass-btn"
                >
                  <FileSpreadsheet size={14} /> Excel Data
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={fetchInitialData}
                  className="glass-btn p-2"
                  title="Refresh Dashboard Data"
                >
                  <RefreshCw size={14} />
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {/* =========================================================================
            NEXT-PAGES EXPLORATION HUB (Click from Dashboard to Go to Next Pages)
            ========================================================================= */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <Layers size={20} className="text-primary" />
                <span>Next Pages &amp; Analytics Portals</span>
              </h5>
              <span className="small text-muted">Jump directly into specialized transit analytics views</span>
            </div>
          </div>

          <Row className="g-3">
            {/* Next Page 1: Corridors */}
            <Col sm={6} lg={4} xl={2}>
              <Link to="/routes" className="dashboard-hub-card text-decoration-none h-100 p-3 d-flex flex-column justify-content-between">
                <div>
                  <div className="hub-icon-circle bg-primary bg-opacity-10 text-primary mb-2">
                    <Bus size={20} />
                  </div>
                  <h6 className="fw-bold text-dark mb-1">Corridors</h6>
                  <p className="text-muted small mb-0 lh-sm">
                    10 Madurai routes, delay rankings &amp; P95 buffer.
                  </p>
                </div>
                <div className="hub-link-text mt-3 text-primary small fw-semibold d-flex align-items-center justify-content-between">
                  <span>Explore Corridors</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            </Col>

            {/* Next Page 2: Bus Stops */}
            <Col sm={6} lg={4} xl={2}>
              <Link to="/stops" className="dashboard-hub-card text-decoration-none h-100 p-3 d-flex flex-column justify-content-between">
                <div>
                  <div className="hub-icon-circle bg-danger bg-opacity-10 text-danger mb-2">
                    <MapPin size={20} />
                  </div>
                  <h6 className="fw-bold text-dark mb-1">Bus Stops</h6>
                  <p className="text-muted small mb-0 lh-sm">
                    32 Madurai stops &amp; bottleneck delay accretion.
                  </p>
                </div>
                <div className="hub-link-text mt-3 text-danger small fw-semibold d-flex align-items-center justify-content-between">
                  <span>Explore Stops</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            </Col>

            {/* Next Page 3: Route Benchmarking */}
            <Col sm={6} lg={4} xl={2}>
              <Link to="/compare" className="dashboard-hub-card text-decoration-none h-100 p-3 d-flex flex-column justify-content-between">
                <div>
                  <div className="hub-icon-circle bg-warning bg-opacity-10 text-warning mb-2">
                    <GitCompare size={20} />
                  </div>
                  <h6 className="fw-bold text-dark mb-1">Benchmark</h6>
                  <p className="text-muted small mb-0 lh-sm">
                    Head-to-head comparison between competing routes.
                  </p>
                </div>
                <div className="hub-link-text mt-3 text-warning small fw-semibold d-flex align-items-center justify-content-between">
                  <span>Compare Routes</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            </Col>

            {/* Next Page 4: Temporal Analytics */}
            <Col sm={6} lg={4} xl={2}>
              <Link to="/analytics" className="dashboard-hub-card text-decoration-none h-100 p-3 d-flex flex-column justify-content-between">
                <div>
                  <div className="hub-icon-circle bg-info bg-opacity-10 text-info mb-2">
                    <BarChart3 size={20} />
                  </div>
                  <h6 className="fw-bold text-dark mb-1">Analytics</h6>
                  <p className="text-muted small mb-0 lh-sm">
                    Peak hours, weekday trends &amp; delay distribution.
                  </p>
                </div>
                <div className="hub-link-text mt-3 text-info small fw-semibold d-flex align-items-center justify-content-between">
                  <span>View Analytics</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            </Col>

            {/* Next Page 5: Dynamic Insights */}
            <Col sm={6} lg={4} xl={2}>
              <Link to="/insights" className="dashboard-hub-card text-decoration-none h-100 p-3 d-flex flex-column justify-content-between">
                <div>
                  <div className="hub-icon-circle bg-success bg-opacity-10 text-success mb-2">
                    <Sparkles size={20} />
                  </div>
                  <h6 className="fw-bold text-dark mb-1">Insights</h6>
                  <p className="text-muted small mb-0 lh-sm">
                    Automated commuter advisories &amp; departure tips.
                  </p>
                </div>
                <div className="hub-link-text mt-3 text-success small fw-semibold d-flex align-items-center justify-content-between">
                  <span>View Advisories</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            </Col>

            {/* Next Page 6: Methodology & About */}
            <Col sm={6} lg={4} xl={2}>
              <Link to="/about" className="dashboard-hub-card text-decoration-none h-100 p-3 d-flex flex-column justify-content-between">
                <div>
                  <div className="hub-icon-circle bg-secondary bg-opacity-10 text-secondary mb-2">
                    <Info size={20} />
                  </div>
                  <h6 className="fw-bold text-dark mb-1">About</h6>
                  <p className="text-muted small mb-0 lh-sm">
                    Data provenance, GTFS schema &amp; math formulas.
                  </p>
                </div>
                <div className="hub-link-text mt-3 text-secondary small fw-semibold d-flex align-items-center justify-content-between">
                  <span>Methodology</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            </Col>
          </Row>
        </div>

        {/* =========================================================================
            REAL-TIME TELEMETRY KPI CARDS (4 Glass Metric Cards)
            ========================================================================= */}
        <Row className="g-3 mb-4">
          <Col sm={6} lg={3}>
            <MetricCard
              label="Valid Observations"
              value={overview?.total_valid_observations?.toLocaleString() || '25,577'}
              subtext="Empirically verified timestamps"
              icon={CheckCircle}
              variant="success"
            />
          </Col>
          <Col sm={6} lg={3}>
            <MetricCard
              label="Monitored Corridors"
              value={overview?.monitored_routes_count || '10'}
              subtext="Madurai trunk & feeder routes"
              icon={Bus}
              variant="primary"
            />
          </Col>
          <Col sm={6} lg={3}>
            <MetricCard
              label="System On-Time %"
              value={`${overview?.system_on_time_percentage || 68.4}%`}
              subtext="Arrivals within [-1, +5] min window"
              icon={Clock}
              variant="info"
            />
          </Col>
          <Col sm={6} lg={3}>
            <MetricCard
              label="System Average Delay"
              value={`+${overview?.system_average_delay_minutes || 6.8}m`}
              subtext={`Median: +${overview?.system_median_delay_minutes || 4.0} min`}
              icon={AlertTriangle}
              variant={overview?.system_average_delay_minutes > 8 ? 'danger' : 'warning'}
            />
          </Col>
        </Row>

        {/* =========================================================================
            LIVE ROUTE FINDER & DELAY CHECK WIDGET
            ========================================================================= */}
        <div className="mb-4">
          <div className="search-box-container p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <Search size={20} className="text-primary" />
                <h5 className="fw-bold mb-0 text-dark">Check Bus Delay Between Stops</h5>
              </div>
              <Button variant="link" size="sm" className="text-muted p-0" onClick={swapStops} title="Swap stops">
                <RefreshCw size={15} />
              </Button>
            </div>

            <Form onSubmit={handleSearch}>
              <Row className="g-3 align-items-end">
                <Col md={5}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Origin Bus Stop (புறப்படும் இடம்)</Form.Label>
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
                </Col>

                <Col md={5}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Destination Bus Stop (சேரும் இடம்)</Form.Label>
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
                </Col>

                <Col md={2}>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    disabled={searchLoading}
                  >
                    {searchLoading ? 'Checking...' : 'Check Delay'}
                    <ArrowRight size={16} />
                  </Button>
                </Col>
              </Row>
            </Form>

            {/* Search Results Display */}
            {searchResults !== null && (
              <div className="mt-4 pt-3 border-top">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-bold small text-dark">
                    Found {searchResults.length} Connecting Corridor(s)
                  </span>
                  <Button variant="link" size="sm" className="p-0 text-muted" onClick={() => setSearchResults(null)}>
                    Clear Results
                  </Button>
                </div>

                {searchResults.length === 0 ? (
                  <div className="p-3 text-center text-muted small bg-light rounded">
                    No direct scheduled routes connect the selected stops in this direction.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                      <thead className="table-light small text-uppercase text-muted">
                        <tr>
                          <th>Route</th>
                          <th>Corridor Name</th>
                          <th>Stops</th>
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
                              <div className="d-flex align-items-center gap-1">
                                <Badge bg="primary" className="px-2 py-1 fs-6">
                                  {r.route_short_name}
                                </Badge>
                                {r.direction && (
                                  <Badge bg="light" text="dark" className="border small">
                                    {r.direction}
                                  </Badge>
                                )}
                              </div>
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
                                View Dossier &rarr;
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            TOP RELIABLE VS HIGHEST DELAY VARIANCE CORRIDORS
            ========================================================================= */}
        <Row className="gy-4 mb-4">
          <Col md={6}>
            <Card className="tp-card h-100">
              <Card.Header className="bg-white border-bottom py-3">
                <div className="d-flex align-items-center justify-content-between">
                  <span className="fw-bold text-dark d-flex align-items-center gap-2">
                    <CheckCircle size={18} className="text-success" />
                    Most Reliable Corridors
                  </span>
                  <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25">
                    Highest Punctuality
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
                        <th>Action</th>
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
                          <td>
                            <span className="text-success fw-bold">+{r.average_delay_minutes}m</span>
                          </td>
                          <td>
                            <Link to={`/routes/${r.route_id}`} className="btn btn-outline-primary btn-sm py-0 px-2 small">
                              Dossier
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="tp-card h-100">
              <Card.Header className="bg-white border-bottom py-3">
                <div className="d-flex align-items-center justify-content-between">
                  <span className="fw-bold text-dark d-flex align-items-center gap-2">
                    <AlertTriangle size={18} className="text-danger" />
                    Corridors With Highest Delay Variance
                  </span>
                  <Badge bg="danger" className="bg-opacity-10 text-danger border border-danger border-opacity-25">
                    Bottlenecks
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
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview?.top_delayed_routes?.map((r) => (
                        <tr key={r.route_id}>
                          <td>
                            <Badge bg="danger">{r.route_short_name}</Badge>
                          </td>
                          <td>
                            <Link to={`/routes/${r.route_id}`} className="text-decoration-none fw-semibold text-dark">
                              {r.route_long_name}
                            </Link>
                          </td>
                          <td>
                            <ReliabilityBadge score={r.reliability_score} />
                          </td>
                          <td>
                            <span className="text-danger fw-bold">+{r.average_delay_minutes}m</span>
                          </td>
                          <td>
                            <Link to={`/routes/${r.route_id}`} className="btn btn-outline-danger btn-sm py-0 px-2 small">
                              Dossier
                            </Link>
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
      </Container>
    </div>
  );
};

export default DashboardPage;
