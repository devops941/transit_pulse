import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, ProgressBar, Dropdown, DropdownButton } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import {
  Bus,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Calendar,
  Download,
  Share2,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import api from '../services/api';
import MetricCard from '../components/MetricCard';
import ReliabilityBadge from '../components/ReliabilityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import WeekdayDelayChart from '../components/charts/WeekdayDelayChart';
import TimeOfDayChart from '../components/charts/TimeOfDayChart';
import TrendTimeSeriesChart from '../components/charts/TrendTimeSeriesChart';

export const RouteDetailPage = () => {
  const { routeId } = useParams();
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRouteDetails();
  }, [routeId]);

  const fetchRouteDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getRouteDetail(routeId);
      setRouteData(res.data);
    } catch (err) {
      setError(err.message || `Failed to retrieve route details for ${routeId}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message={`Loading route analytics dossier for ${routeId}...`} />;
  }

  if (error || !routeData) {
    return (
      <Container className="py-5">
        <ErrorMessage message={error || 'Route not found'} onRetry={fetchRouteDetails} />
        <Button as={Link} to="/routes" variant="outline-primary" size="sm" className="mt-3">
          <ArrowLeft size={16} className="me-1" /> Back to Routes
        </Button>
      </Container>
    );
  }

  const stats = routeData.summary_statistics;

  return (
    <Container className="py-5">
      {/* Navigation Breadcrumb & Header */}
      <div className="mb-4">
        <Link to="/routes" className="text-decoration-none small text-muted d-inline-flex align-items-center gap-1 mb-2">
          <ArrowLeft size={14} /> Back to Routes Catalog
        </Link>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Badge bg="primary" className="fs-5 px-3 py-1">
                Route {routeData.route_short_name}
              </Badge>
              <ReliabilityBadge score={routeData.reliability_score} />
            </div>
            <h2 className="fw-bold text-dark mb-0">{routeData.route_long_name}</h2>
            <div className="small text-muted">System Route ID: {routeData.route_id}</div>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <Button as={Link} to={`/compare?routeA=${routeData.route_id}`} variant="outline-primary" size="sm">
              Compare Corridor
            </Button>
            <DropdownButton
              id="export-dossier-dropdown"
              title={
                <span className="d-inline-flex align-items-center gap-1">
                  <Download size={14} /> Export Dossier
                </span>
              }
              variant="primary"
              size="sm"
            >
              <Dropdown.Item onClick={() => api.downloadReportPdf(routeData.route_id)} className="d-flex align-items-center gap-2 py-2">
                <FileText size={16} className="text-danger" />
                <div>
                  <div className="fw-semibold">PDF Dossier</div>
                  <div className="small text-muted">Formatted report with charts & tables</div>
                </div>
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => api.downloadReportExcel(routeData.route_id)} className="d-flex align-items-center gap-2 py-2">
                <FileSpreadsheet size={16} className="text-success" />
                <div>
                  <div className="fw-semibold">Excel Workbook (.xlsx)</div>
                  <div className="small text-muted">Multi-sheet data & observation logs</div>
                </div>
              </Dropdown.Item>
            </DropdownButton>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <MetricCard
            label="Reliability Score"
            value={`${routeData.reliability_score}/100`}
            subtext={routeData.reliability_score >= 80 ? 'Tier: Excellent' : 'Tier: Moderate/Congested'}
            icon={CheckCircle}
            variant="success"
          />
        </Col>
        <Col sm={6} lg={3}>
          <MetricCard
            label="Average Delay"
            value={`+${stats.average_delay_minutes} min`}
            subtext={`Median Delay: +${stats.median_delay_minutes} min`}
            icon={Clock}
            variant={stats.average_delay_minutes > 8 ? 'danger' : 'warning'}
          />
        </Col>
        <Col sm={6} lg={3}>
          <MetricCard
            label="On-Time Punctuality"
            value={`${stats.on_time_percentage}%`}
            subtext={`Delayed Trips: ${stats.delayed_percentage}%`}
            icon={TrendingUp}
            variant="info"
          />
        </Col>
        <Col sm={6} lg={3}>
          <MetricCard
            label="Observation Count"
            value={stats.observation_count?.toLocaleString()}
            subtext={`Coverage: ${stats.date_range?.start} to ${stats.date_range?.end}`}
            icon={Bus}
            variant="primary"
          />
        </Col>
      </Row>

      {/* Corridor Stops Performance */}
      <Card className="tp-card mb-4">
        <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <MapPin size={18} className="text-primary" />
              Corridor Stop Sequence & Punctuality
            </h5>
            <div className="small text-muted">
              Stop-level delay patterns and punctuality along the route
            </div>
          </div>
          <Badge bg="light" text="dark" className="border">
            {routeData.stops_performance?.length || 0} Monitored Stops
          </Badge>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light small text-uppercase text-muted">
                <tr>
                  <th style={{ width: '60px' }}>Seq</th>
                  <th>Stop Name</th>
                  <th>Obs Count</th>
                  <th>Average Delay</th>
                  <th>On-Time Rate</th>
                  <th>Punctuality Bar</th>
                </tr>
              </thead>
              <tbody>
                {routeData.stops_performance?.map((s, idx) => (
                  <tr key={s.stop_id}>
                    <td>
                      <span className="stop-sequence-badge">{idx + 1}</span>
                    </td>
                    <td>
                      <Link to={`/stops/${s.stop_id}`} className="text-decoration-none fw-semibold text-dark">
                        {s.stop_name}
                      </Link>
                      <div className="small text-muted">{s.stop_id}</div>
                    </td>
                    <td>
                      <span className="small text-muted">{s.observation_count}</span>
                    </td>
                    <td>
                      <span className={s.average_delay_minutes > 8 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                        +{s.average_delay_minutes} min
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark">{s.on_time_percentage}%</span>
                    </td>
                    <td style={{ width: '160px' }}>
                      <ProgressBar
                        now={s.on_time_percentage}
                        variant={s.on_time_percentage > 70 ? 'success' : (s.on_time_percentage > 40 ? 'warning' : 'danger')}
                        style={{ height: '6px' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Temporal Breakdown: Weekday and Time of Day Charts */}
      <Row className="gy-4 mb-4">
        {/* Weekday Breakdown Chart */}
        <Col md={6}>
          <Card className="tp-card h-100">
            <Card.Header className="bg-white border-bottom py-3">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <Calendar size={16} className="text-primary" />
                Weekday Arrival Punctuality
              </h6>
            </Card.Header>
            <Card.Body className="p-3">
              <WeekdayDelayChart weekdayData={routeData.weekday_performance} />
            </Card.Body>
          </Card>
        </Col>

        {/* Time of Day Breakdown Chart */}
        <Col md={6}>
          <Card className="tp-card h-100">
            <Card.Header className="bg-white border-bottom py-3">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <Clock size={16} className="text-primary" />
                Diurnal Performance (Time of Day)
              </h6>
            </Card.Header>
            <Card.Body className="p-3">
              <TimeOfDayChart timeData={routeData.time_period_performance} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Historical Trend Series for this route */}
      <Card className="tp-card shadow-sm">
        <Card.Header className="bg-white border-bottom py-3">
          <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            Corridor Historical Delay Trajectory (Plotly Time Series)
          </h6>
        </Card.Header>
        <Card.Body className="p-3">
          <TrendTimeSeriesChart trendData={routeData.trend_series} />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RouteDetailPage;
