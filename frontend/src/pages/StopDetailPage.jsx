import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ArrowLeft, Bus, Clock, Calendar, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import MetricCard from '../components/MetricCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export const StopDetailPage = () => {
  const { stopId } = useParams();
  const [stopData, setStopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStopDetails();
  }, [stopId]);

  const fetchStopDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getStopDetail(stopId);
      setStopData(res.data);
    } catch (err) {
      setError(err.message || `Failed to load details for stop ${stopId}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message={`Loading stop profile for ${stopId}...`} />;
  }

  if (error || !stopData) {
    return (
      <Container className="py-5">
        <ErrorMessage message={error || 'Stop not found'} onRetry={fetchStopDetails} />
        <Button as={Link} to="/stops" variant="outline-primary" size="sm" className="mt-3">
          <ArrowLeft size={16} className="me-1" /> Back to Stops
        </Button>
      </Container>
    );
  }

  const stats = stopData.summary_statistics;

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="mb-4">
        <Link to="/stops" className="text-decoration-none small text-muted d-inline-flex align-items-center gap-1 mb-2">
          <ArrowLeft size={14} /> Back to Bus Stops Directory
        </Link>
        <div className="d-flex align-items-center gap-2 mb-1">
          <MapPin size={24} className="text-primary" />
          <h2 className="fw-bold text-dark mb-0">{stopData.stop_name}</h2>
        </div>
        <div className="small text-muted">
          Stop ID: {stopData.stop_id} &bull; Coordinates: ({stopData.stop_lat || 'N/A'}, {stopData.stop_lon || 'N/A'})
        </div>
      </div>

      {/* KPI Cards */}
      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <MetricCard
            label="Average Delay"
            value={`+${stats.average_delay_minutes} min`}
            subtext={`Median: +${stats.median_delay_minutes} min`}
            icon={AlertTriangle}
            variant={stats.average_delay_minutes > 10 ? 'danger' : 'warning'}
          />
        </Col>
        <Col sm={6} lg={3}>
          <MetricCard
            label="On-Time Rate"
            value={`${stats.on_time_percentage}%`}
            subtext={`Late Arrivals: ${stats.delayed_percentage}%`}
            icon={Clock}
            variant="info"
          />
        </Col>
        <Col sm={6} lg={3}>
          <MetricCard
            label="Observations"
            value={stats.observation_count?.toLocaleString()}
            subtext="Verified arrival logs"
            icon={Bus}
            variant="primary"
          />
        </Col>
        <Col sm={6} lg={3}>
          <MetricCard
            label="Connected Routes"
            value={stopData.routes_count}
            subtext={stopData.routes_served?.join(', ')}
            icon={Bus}
            variant="success"
          />
        </Col>
      </Row>

      {/* Breakdowns */}
      <Row className="gy-4 mb-4">
        {/* Weekday breakdown */}
        <Col md={6}>
          <Card className="tp-card h-100">
            <Card.Header className="bg-white border-bottom py-3">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <Calendar size={16} className="text-primary" />
                Weekday Delay Breakdown
              </h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover className="align-middle mb-0 small">
                <thead className="table-light text-muted">
                  <tr>
                    <th>Day</th>
                    <th>Obs</th>
                    <th>Avg Delay</th>
                    <th>On-Time %</th>
                  </tr>
                </thead>
                <tbody>
                  {stopData.weekday_performance?.map((w) => (
                    <tr key={w.day_of_week}>
                      <td className="fw-semibold">{w.day_of_week}</td>
                      <td>{w.observation_count}</td>
                      <td className={w.average_delay_minutes > 8 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                        +{w.average_delay_minutes}m
                      </td>
                      <td>{w.on_time_percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Diurnal Breakdown */}
        <Col md={6}>
          <Card className="tp-card h-100">
            <Card.Header className="bg-white border-bottom py-3">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <Clock size={16} className="text-primary" />
                Time of Day Delay Breakdown
              </h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover className="align-middle mb-0 small">
                <thead className="table-light text-muted">
                  <tr>
                    <th>Period</th>
                    <th>Obs</th>
                    <th>Avg Delay</th>
                    <th>On-Time %</th>
                  </tr>
                </thead>
                <tbody>
                  {stopData.time_period_performance?.map((t) => (
                    <tr key={t.time_period}>
                      <td className="fw-semibold">{t.time_period_label || t.time_period}</td>
                      <td>{t.observation_count}</td>
                      <td className={t.average_delay_minutes > 8 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                        +{t.average_delay_minutes}m
                      </td>
                      <td>{t.on_time_percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Arrival Observation Sample */}
      <Card className="tp-card shadow-sm">
        <Card.Header className="bg-white border-bottom py-3">
          <h6 className="fw-bold text-dark mb-0">Recent Arrival Observation Logs</h6>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 small">
              <thead className="table-light text-muted">
                <tr>
                  <th>Observation ID</th>
                  <th>Route</th>
                  <th>Date</th>
                  <th>Scheduled Time</th>
                  <th>Actual Time</th>
                  <th>Delay (Min)</th>
                  <th>Status</th>
                  <th>Weather</th>
                </tr>
              </thead>
              <tbody>
                {stopData.recent_observations_sample?.map((obs) => (
                  <tr key={obs.observation_id}>
                    <td className="text-muted">{obs.observation_id}</td>
                    <td><Badge bg="primary">{obs.route_short_name}</Badge></td>
                    <td>{obs.observation_date}</td>
                    <td>{obs.scheduled_arrival_time}</td>
                    <td className="fw-semibold">{obs.actual_arrival_time}</td>
                    <td className={obs.delay_minutes > 5 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                      +{obs.delay_minutes}m
                    </td>
                    <td>
                      <Badge bg={obs.delay_status === 'ON_TIME' ? 'success' : (obs.delay_status === 'EARLY' ? 'info' : 'danger')}>
                        {obs.delay_status}
                      </Badge>
                    </td>
                    <td><span className="text-muted small">{obs.weather_condition}</span></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StopDetailPage;
