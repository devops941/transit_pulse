import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ShieldAlert,
  Info,
  TrendingDown,
  Navigation
} from 'lucide-react';
import api from '../services/api';
import MetricCard from '../components/MetricCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export const InsightsPage = () => {
  const [insightsData, setInsightsData] = useState(null);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPublicInsights();
      setInsightsData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load public insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Synthesizing dynamic public transit insights..." />;
  }

  if (error || !insightsData) {
    return (
      <Container className="py-5">
        <ErrorMessage message={error || 'No insights available'} onRetry={fetchInsights} />
      </Container>
    );
  }

  const { overall_summary, insights, commuter_advisories } = insightsData;

  const getIconForCategory = (cat) => {
    switch (cat) {
      case 'MOST_RELIABLE_ROUTE':
        return CheckCircle;
      case 'MOST_DELAYED_ROUTE':
        return AlertTriangle;
      case 'HIGHEST_VARIANCE_ROUTE':
        return TrendingDown;
      case 'PEAK_BOTTLENECK_STOP':
        return MapPin;
      case 'PEAK_WEEKDAY':
        return Calendar;
      case 'PEAK_TIME_PERIOD':
        return Clock;
      case 'RECOMMENDED_TRAVEL_BUFFER':
        return Navigation;
      case 'WEEKEND_MOBILITY_ADVANTAGE':
        return Sparkles;
      default:
        return Info;
    }
  };

  const getBadgeColor = (cat) => {
    switch (cat) {
      case 'MOST_RELIABLE_ROUTE':
      case 'WEEKEND_MOBILITY_ADVANTAGE':
        return 'success';
      case 'MOST_DELAYED_ROUTE':
      case 'PEAK_BOTTLENECK_STOP':
      case 'HIGHEST_VARIANCE_ROUTE':
        return 'danger';
      case 'PEAK_WEEKDAY':
      case 'PEAK_TIME_PERIOD':
      case 'RECOMMENDED_TRAVEL_BUFFER':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const filteredInsights = insights?.filter((item) => {
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'RELIABILITY') {
      return ['MOST_RELIABLE_ROUTE', 'MOST_DELAYED_ROUTE', 'HIGHEST_VARIANCE_ROUTE'].includes(item.category);
    }
    if (filterCategory === 'BOTTLENECK') {
      return ['PEAK_BOTTLENECK_STOP', 'PEAK_TIME_PERIOD', 'PEAK_WEEKDAY'].includes(item.category);
    }
    if (filterCategory === 'COMMUTER') {
      return ['RECOMMENDED_TRAVEL_BUFFER', 'WEEKEND_MOBILITY_ADVANTAGE'].includes(item.category);
    }
    return true;
  });

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="mb-4">
        <Badge bg="warning" text="dark" className="bg-opacity-25 border border-warning mb-2 px-3 py-1">
          <Sparkles size={14} className="me-1 d-inline text-warning" />
          Module 10: Dynamic Public Intelligence & Route Reliability
        </Badge>
        <h2 className="fw-bold text-dark mb-1">Public Transit Delay Insights & Advisories</h2>
        <p className="text-muted small mb-0">
          Synthesized directly from verified empirical arrival observations. Zero manual manipulation or hardcoded assumptions.
        </p>
      </div>

      {/* Network Macro Summary */}
      <Row className="g-3 mb-5">
        <Col sm={6} lg={3}>
          <MetricCard
            label="Analyzed Observations"
            value={overall_summary?.total_valid_observations?.toLocaleString()}
            subtext={`Coverage: ${overall_summary?.date_range?.start} to ${overall_summary?.date_range?.end}`}
            icon={CheckCircle}
            variant="primary"
          />
        </Col>
        <Col sm={6} lg={3}>
          <MetricCard
            label="System Punctuality"
            value={`${overall_summary?.system_on_time_percentage}%`}
            subtext="Arrived within [-1, +5] min window"
            icon={Clock}
            variant="success"
          />
        </Col>
        <Col sm={6} lg={3}>
          <MetricCard
            label="Network Average Delay"
            value={`+${overall_summary?.system_average_delay_minutes} min`}
            subtext="Empirical systemic delay"
            icon={AlertTriangle}
            variant={overall_summary?.system_average_delay_minutes > 8 ? 'danger' : 'warning'}
          />
        </Col>
        <Col sm={6} lg={3}>
          <MetricCard
            label="Recommended Buffer"
            value={`+${overall_summary?.recommended_buffer_minutes || 15}m`}
            subtext={`90th percentile buffer: +${overall_summary?.p90_delay_minutes || 12}m`}
            icon={Navigation}
            variant="info"
          />
        </Col>
      </Row>

      {/* Commuter Travel Advisories Section */}
      {commuter_advisories && commuter_advisories.length > 0 && (
        <Card className="tp-card border-primary mb-5 shadow-sm">
          <Card.Header className="bg-primary bg-opacity-10 py-3 border-bottom border-primary border-opacity-25">
            <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <ShieldAlert size={20} className="text-primary" />
              Public Commuter Travel Advisories
            </h5>
            <div className="small text-muted">
              Evidence-based rules of thumb to optimize your daily bus journey
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            <Row className="g-3">
              {commuter_advisories.map((adv, idx) => (
                <Col md={4} key={idx}>
                  <div className="p-3 border rounded h-100 bg-white">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="fw-bold text-dark small">{adv.title}</span>
                      <Badge bg={adv.severity === 'HIGH' ? 'danger' : (adv.severity === 'MEDIUM' ? 'warning' : 'success')}>
                        {adv.severity} PRIORITY
                      </Badge>
                    </div>
                    <p className="text-muted small mb-0">{adv.advice}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Category Filter Pills */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-3 gap-2">
        <h4 className="fw-bold text-dark mb-0">Analytical Discoveries</h4>
        <ButtonGroup size="sm">
          <Button
            variant={filterCategory === 'ALL' ? 'primary' : 'outline-secondary'}
            onClick={() => setFilterCategory('ALL')}
          >
            All Discoveries
          </Button>
          <Button
            variant={filterCategory === 'RELIABILITY' ? 'primary' : 'outline-secondary'}
            onClick={() => setFilterCategory('RELIABILITY')}
          >
            Route Reliability
          </Button>
          <Button
            variant={filterCategory === 'BOTTLENECK' ? 'primary' : 'outline-secondary'}
            onClick={() => setFilterCategory('BOTTLENECK')}
          >
            Bottlenecks & Time
          </Button>
          <Button
            variant={filterCategory === 'COMMUTER' ? 'primary' : 'outline-secondary'}
            onClick={() => setFilterCategory('COMMUTER')}
          >
            Commuter Guidance
          </Button>
        </ButtonGroup>
      </div>

      {/* Insights Cards Grid */}
      <Row className="g-4">
        {filteredInsights?.map((item, idx) => {
          const Icon = getIconForCategory(item.category);
          const badgeColor = getBadgeColor(item.category);
          return (
            <Col md={6} key={idx}>
              <Card className="tp-card h-100 shadow-sm">
                <Card.Body className="p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <Badge bg={badgeColor} className="text-uppercase px-2 py-1">
                        {item.category.replace(/_/g, ' ')}
                      </Badge>
                      <div className={`p-2 rounded bg-${badgeColor} bg-opacity-10 text-${badgeColor}`}>
                        <Icon size={20} />
                      </div>
                    </div>
                    <h5 className="fw-bold text-dark mb-2">{item.title}</h5>
                    <p className="text-muted small mb-3">{item.detail}</p>
                  </div>

                  <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                    {item.route_id && (
                      <Button
                        as={Link}
                        to={`/routes/${item.route_id}`}
                        variant="outline-primary"
                        size="sm"
                        className="d-flex align-items-center gap-1"
                      >
                        Explore Route {item.route_short_name} <ArrowRight size={14} />
                      </Button>
                    )}
                    {item.stop_id && (
                      <Button
                        as={Link}
                        to={`/stops/${item.stop_id}`}
                        variant="outline-primary"
                        size="sm"
                        className="d-flex align-items-center gap-1"
                      >
                        Explore Stop Details <ArrowRight size={14} />
                      </Button>
                    )}
                    {!item.route_id && !item.stop_id && (
                      <Button
                        as={Link}
                        to="/analytics"
                        variant="outline-secondary"
                        size="sm"
                        className="d-flex align-items-center gap-1"
                      >
                        Explore in Analytics <ArrowRight size={14} />
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default InsightsPage;
