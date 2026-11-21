import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table, Badge, Button } from 'react-bootstrap';
import { useSearchParams, Link } from 'react-router-dom';
import { GitCompare, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import api from '../services/api';
import ReliabilityBadge from '../components/ReliabilityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import RouteComparisonChart from '../components/charts/RouteComparisonChart';

export const ComparePage = () => {
  const [searchParams] = useSearchParams();
  const [allRoutes, setAllRoutes] = useState([]);
  const [selectedRouteA, setSelectedRouteA] = useState(searchParams.get('routeA') || 'TNSTC_77');
  const [selectedRouteB, setSelectedRouteB] = useState('TNSTC_48');
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRoutesList();
  }, []);

  useEffect(() => {
    if (selectedRouteA && selectedRouteB && selectedRouteA !== selectedRouteB) {
      runComparison(selectedRouteA, selectedRouteB);
    }
  }, [selectedRouteA, selectedRouteB]);

  const fetchRoutesList = async () => {
    setLoading(true);
    try {
      const res = await api.getRoutes();
      setAllRoutes(res.data || []);
      if (!searchParams.get('routeA') && res.data?.length > 1) {
        setSelectedRouteA(res.data[0].route_id);
        setSelectedRouteB(res.data[1].route_id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load routes list');
    } finally {
      setLoading(false);
    }
  };

  const runComparison = async (rA, rB) => {
    setComparing(true);
    try {
      const res = await api.compareRoutes(`${rA},${rB}`);
      setComparisonData(res.data);
    } catch (err) {
      alert(err.message || 'Comparison failed');
    } finally {
      setComparing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading route benchmarking data..." />;
  }

  if (error) {
    return (
      <Container className="py-5">
        <ErrorMessage message={error} onRetry={fetchRoutesList} />
      </Container>
    );
  }

  const routes = comparisonData?.routes || [];

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="mb-4">
        <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 mb-2">
          Module 4: Route Comparison
        </Badge>
        <h2 className="fw-bold text-dark mb-1">Side-by-Side Route Benchmarking</h2>
        <p className="text-muted small mb-0">
          Compare punctuality, average arrival delays, and temporal predictability between multiple public corridors.
        </p>
      </div>

      {/* Selector Card */}
      <Card className="tp-card mb-4">
        <Card.Body className="p-4">
          <Row className="g-3 align-items-center">
            <Col md={5}>
              <Form.Group>
                <Form.Label className="small fw-semibold text-muted">SELECT FIRST CORRIDOR</Form.Label>
                <Form.Select
                  value={selectedRouteA}
                  onChange={(e) => setSelectedRouteA(e.target.value)}
                >
                  {allRoutes.map((r) => (
                    <option key={r.route_id} value={r.route_id} disabled={r.route_id === selectedRouteB}>
                      {r.route_short_name} – {r.route_long_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2} className="text-center pt-md-4">
              <div className="p-2 d-inline-flex rounded-circle bg-light text-primary">
                <GitCompare size={20} />
              </div>
            </Col>

            <Col md={5}>
              <Form.Group>
                <Form.Label className="small fw-semibold text-muted">SELECT SECOND CORRIDOR</Form.Label>
                <Form.Select
                  value={selectedRouteB}
                  onChange={(e) => setSelectedRouteB(e.target.value)}
                >
                  {allRoutes.map((r) => (
                    <option key={r.route_id} value={r.route_id} disabled={r.route_id === selectedRouteA}>
                      {r.route_short_name} – {r.route_long_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Comparison Matrix */}
      {comparing ? (
        <LoadingSpinner message="Calculating comparative metrics..." />
      ) : routes.length < 2 ? (
        <div className="p-4 text-center text-muted">Please select two distinct routes to compare.</div>
      ) : (
        <>
          {/* Insights Callout */}
          {comparisonData?.insights && (
            <Card className="tp-card bg-primary bg-opacity-10 border-primary mb-4">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center gap-2">
                  <CheckCircle size={20} className="text-primary flex-shrink-0" />
                  <div>
                    <strong className="text-dark">Analytical Recommendation:</strong>{' '}
                    <span className="text-dark">
                      Route <strong>{comparisonData.insights.most_reliable_route}</strong> offers higher historical reliability and punctuality compared to alternative choices.
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Visual Plotly Comparison Chart */}
          <Card className="tp-card shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom py-3">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <GitCompare size={18} className="text-primary" />
                Visual Metric Comparison (Plotly Grouped Bar Chart)
              </h6>
            </Card.Header>
            <Card.Body className="p-3">
              <RouteComparisonChart routes={routes} />
            </Card.Body>
          </Card>

          {/* Side by Side Matrix Table */}
          <Card className="tp-card shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="fw-bold text-dark mb-0">Performance Comparison Matrix</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table bordered className="align-middle mb-0 text-center">
                  <thead className="table-light text-muted small text-uppercase">
                    <tr>
                      <th style={{ width: '25%' }} className="text-start">Metric</th>
                      <th style={{ width: '37.5%' }}>
                        <Badge bg="primary" className="fs-6 me-2">{routes[0].route_short_name}</Badge>
                        <span className="fw-bold text-dark">{routes[0].route_long_name}</span>
                      </th>
                      <th style={{ width: '37.5%' }}>
                        <Badge bg="primary" className="fs-6 me-2">{routes[1].route_short_name}</Badge>
                        <span className="fw-bold text-dark">{routes[1].route_long_name}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-start fw-semibold">Reliability Score</td>
                      <td>
                        <ReliabilityBadge score={routes[0].reliability_score} />
                      </td>
                      <td>
                        <ReliabilityBadge score={routes[1].reliability_score} />
                      </td>
                    </tr>
                    <tr>
                      <td className="text-start fw-semibold">Average Delay</td>
                      <td className={routes[0].average_delay_minutes < routes[1].average_delay_minutes ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                        +{routes[0].average_delay_minutes} min
                      </td>
                      <td className={routes[1].average_delay_minutes < routes[0].average_delay_minutes ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                        +{routes[1].average_delay_minutes} min
                      </td>
                    </tr>
                    <tr>
                      <td className="text-start fw-semibold">Median Delay</td>
                      <td>+{routes[0].median_delay_minutes} min</td>
                      <td>+{routes[1].median_delay_minutes} min</td>
                    </tr>
                    <tr>
                      <td className="text-start fw-semibold">On-Time Arrival %</td>
                      <td className="fw-bold">{routes[0].on_time_percentage}%</td>
                      <td className="fw-bold">{routes[1].on_time_percentage}%</td>
                    </tr>
                    <tr>
                      <td className="text-start fw-semibold">Delayed Trips %</td>
                      <td>{routes[0].delayed_percentage}%</td>
                      <td>{routes[1].delayed_percentage}%</td>
                    </tr>
                    <tr>
                      <td className="text-start fw-semibold">Schedule Variance (Std Dev)</td>
                      <td>&plusmn;{routes[0].std_delay_minutes} min</td>
                      <td>&plusmn;{routes[1].std_delay_minutes} min</td>
                    </tr>
                    <tr>
                      <td className="text-start fw-semibold">Observation Sample Size</td>
                      <td>{routes[0].observation_count.toLocaleString()}</td>
                      <td>{routes[1].observation_count.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="text-start fw-semibold">Actions</td>
                      <td>
                        <Button as={Link} to={`/routes/${routes[0].route_id}`} variant="outline-primary" size="sm">
                          View {routes[0].route_short_name} Dossier
                        </Button>
                      </td>
                      <td>
                        <Button as={Link} to={`/routes/${routes[1].route_id}`} variant="outline-primary" size="sm">
                          View {routes[1].route_short_name} Dossier
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default ComparePage;
