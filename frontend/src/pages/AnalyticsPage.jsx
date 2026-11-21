import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table, Badge, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { BarChart3, Clock, Calendar, TrendingUp, AlertTriangle, Filter, CheckCircle, Download, FileText, FileSpreadsheet } from 'lucide-react';
import api from '../services/api';
import MetricCard from '../components/MetricCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import DelayDistributionChart from '../components/charts/DelayDistributionChart';
import WeekdayDelayChart from '../components/charts/WeekdayDelayChart';
import TimeOfDayChart from '../components/charts/TimeOfDayChart';
import TrendTimeSeriesChart from '../components/charts/TrendTimeSeriesChart';

export const AnalyticsPage = () => {
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedStop, setSelectedStop] = useState('');
  const [delayStats, setDelayStats] = useState(null);
  const [weekdayStats, setWeekdayStats] = useState([]);
  const [timeStats, setTimeStats] = useState([]);
  const [distributionStats, setDistributionStats] = useState(null);
  const [trendStats, setTrendStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedRoute, selectedStop]);

  const fetchFilterOptions = async () => {
    try {
      const [rRes, sRes] = await Promise.all([
        api.getRoutes(),
        api.getStops('', 'stop_name', 'asc'),
      ]);
      setRoutes(rRes.data || []);
      setStops(sRes.data || []);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedRoute) params.route_id = selectedRoute;
      if (selectedStop) params.stop_id = selectedStop;

      const [delayRes, weekdayRes, timeRes, distRes, trendRes] = await Promise.all([
        api.getDelayAnalytics(params),
        api.getWeekdayAnalytics(params),
        api.getTimePeriodAnalytics(params),
        api.getDelayDistribution(params),
        api.getTrendAnalytics(params),
      ]);

      setDelayStats(delayRes.data);
      setWeekdayStats(weekdayRes.data || []);
      setTimeStats(timeRes.data || []);
      setDistributionStats(distRes.data);
      setTrendStats(trendRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedRoute('');
    setSelectedStop('');
  };

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 mb-2">
            Modules 6–11: Delay Analytics & Reporting
          </Badge>
          <h2 className="fw-bold text-dark mb-1">Public Bus Delay Analytics</h2>
          <p className="text-muted small mb-0">
            In-depth multi-dimensional exploration of bus punctuality, delay distribution, weekday rush hours, and diurnal trends.
          </p>
        </div>
        <div className="d-flex gap-2">
          <DropdownButton
            id="analytics-export-dropdown"
            title={
              <span className="d-inline-flex align-items-center gap-1">
                <Download size={14} /> Export Report
              </span>
            }
            variant="outline-primary"
            size="sm"
          >
            <Dropdown.Item onClick={() => api.downloadReportPdf(selectedRoute || null)} className="d-flex align-items-center gap-2 py-2">
              <FileText size={16} className="text-danger" />
              <div>
                <div className="fw-semibold">PDF Analytical Dossier</div>
                <div className="small text-muted">{selectedRoute ? 'Filtered corridor report' : 'Complete network report'}</div>
              </div>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => api.downloadReportExcel(selectedRoute || null)} className="d-flex align-items-center gap-2 py-2">
              <FileSpreadsheet size={16} className="text-success" />
              <div>
                <div className="fw-semibold">Excel Workbook (.xlsx)</div>
                <div className="small text-muted">Multi-sheet dataset & telemetry log</div>
              </div>
            </Dropdown.Item>
          </DropdownButton>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="tp-card mb-4">
        <Card.Body className="p-3">
          <Row className="g-3 align-items-center">
            <Col md={5}>
              <Form.Group>
                <Form.Label className="small fw-semibold text-muted">FILTER BY ROUTE CORRIDOR</Form.Label>
                <Form.Select
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                >
                  <option value="">All Monitored Routes (Entire Network)</option>
                  {routes.map((r) => (
                    <option key={r.route_id} value={r.route_id}>
                      Route {r.route_short_name} – {r.route_long_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={5}>
              <Form.Group>
                <Form.Label className="small fw-semibold text-muted">FILTER BY BUS STOP</Form.Label>
                <Form.Select
                  value={selectedStop}
                  onChange={(e) => setSelectedStop(e.target.value)}
                >
                  <option value="">All Bus Stops</option>
                  {stops.map((s) => (
                    <option key={s.stop_id} value={s.stop_id}>
                      {s.stop_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2} className="pt-md-4">
              <Button
                variant="outline-secondary"
                size="sm"
                className="w-100 py-2 d-flex align-items-center justify-content-center gap-1"
                onClick={handleResetFilters}
              >
                <Filter size={14} /> Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Content */}
      {loading ? (
        <LoadingSpinner message="Rendering interactive analytical dashboards..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchAnalyticsData} />
      ) : (
        <>
          {/* Summary KPIs */}
          <Row className="g-3 mb-4">
            <Col sm={6} lg={3}>
              <MetricCard
                label="Average Delay"
                value={`+${delayStats?.average_delay_minutes ?? 0} min`}
                subtext={`Standard Dev: ±${delayStats?.std_delay_minutes ?? 0}m`}
                icon={AlertTriangle}
                variant={delayStats?.average_delay_minutes > 8 ? 'danger' : 'warning'}
              />
            </Col>
            <Col sm={6} lg={3}>
              <MetricCard
                label="Median Delay (p50)"
                value={`+${delayStats?.median_delay_minutes ?? 0} min`}
                subtext={`90th Percentile: +${delayStats?.percentiles?.p90 ?? 0}m`}
                icon={Clock}
                variant="primary"
              />
            </Col>
            <Col sm={6} lg={3}>
              <MetricCard
                label="On-Time Percentage"
                value={`${delayStats?.on_time_percentage ?? 0}%`}
                subtext={`Delayed: ${delayStats?.delayed_percentage ?? 0}%`}
                icon={CheckCircle}
                variant="success"
              />
            </Col>
            <Col sm={6} lg={3}>
              <MetricCard
                label="Observations"
                value={delayStats?.observation_count?.toLocaleString()}
                subtext={`Range: ${delayStats?.date_range?.start} to ${delayStats?.date_range?.end}`}
                icon={BarChart3}
                variant="info"
              />
            </Col>
          </Row>

          {/* Module 6: Delay Distribution Chart */}
          <Card className="tp-card mb-4">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <BarChart3 size={18} className="text-primary" />
                Module 6: Delay Distribution (Plotly Histogram)
              </h5>
              <div className="small text-muted">
                Interactive arrival distribution across standard punctuality and delay buckets
              </div>
            </Card.Header>
            <Card.Body className="p-3">
              <DelayDistributionChart bins={distributionStats?.bins} />
            </Card.Body>
          </Card>

          {/* Modules 7 & 8: Weekday and Diurnal Charts Grid */}
          <Row className="gy-4 mb-4">
            {/* Weekday Analysis */}
            <Col lg={6}>
              <Card className="tp-card h-100">
                <Card.Header className="bg-white border-bottom py-3">
                  <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <Calendar size={18} className="text-primary" />
                    Module 7: Weekday Delay & Punctuality
                  </h6>
                  <div className="small text-muted">Monday through Sunday congestion comparison</div>
                </Card.Header>
                <Card.Body className="p-3">
                  <WeekdayDelayChart weekdayData={weekdayStats} />
                </Card.Body>
              </Card>
            </Col>

            {/* Diurnal Time of Day Analysis */}
            <Col lg={6}>
              <Card className="tp-card h-100">
                <Card.Header className="bg-white border-bottom py-3">
                  <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <Clock size={18} className="text-primary" />
                    Module 8: Time-of-Day Diurnal Performance
                  </h6>
                  <div className="small text-muted">Arrival delays across operational diurnal windows</div>
                </Card.Header>
                <Card.Body className="p-3">
                  <TimeOfDayChart timeData={timeStats} />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Module 9: Longitudinal Daily Trend Series */}
          <Card className="tp-card shadow-sm">
            <Card.Header className="bg-white border-bottom py-3">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <TrendingUp size={18} className="text-primary" />
                Module 9: Historical Longitudinal Delay Trends (Plotly Time Series)
              </h6>
              <div className="small text-muted">
                Daily arrival delay trajectory over the 30-day monitoring window
              </div>
            </Card.Header>
            <Card.Body className="p-3">
              <TrendTimeSeriesChart trendData={trendStats} />
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default AnalyticsPage;
