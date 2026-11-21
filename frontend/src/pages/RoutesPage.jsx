import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table, Badge, Button, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Bus, Search, ArrowUpDown, Filter, Eye, Clock, CheckCircle } from 'lucide-react';
import api from '../services/api';
import ReliabilityBadge from '../components/ReliabilityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('reliability_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRoutes();
  }, [sortBy, sortOrder]);

  const fetchRoutes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getRoutes(sortBy, sortOrder);
      setRoutes(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve routes');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = routes.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.route_short_name.toLowerCase().includes(q) ||
      r.route_long_name.toLowerCase().includes(q) ||
      r.route_id.toLowerCase().includes(q)
    );
  });

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 mb-2">
            Module 2: Route Intelligence
          </Badge>
          <h2 className="fw-bold text-dark mb-1">Available Public Bus Corridors</h2>
          <p className="text-muted small mb-0">
            Compare historical arrival delays and punctuality scores across all monitored bus routes.
          </p>
        </div>
        <Button as={Link} to="/compare" variant="outline-primary" size="sm">
          Compare Selected Routes
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="tp-card mb-4">
        <Card.Body className="p-3">
          <Row className="g-3 align-items-center">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <Search size={18} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Filter by corridor name or route number (e.g. 570, 21G)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
              </InputGroup>
            </Col>
            <Col sm={6} md={3}>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="reliability_score">Sort by Reliability Score</option>
                <option value="average_delay_minutes">Sort by Average Delay</option>
                <option value="on_time_percentage">Sort by On-Time %</option>
                <option value="route_short_name">Sort by Route Number</option>
              </Form.Select>
            </Col>
            <Col sm={6} md={3}>
              <Form.Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="desc">Highest / Descending</option>
                <option value="asc">Lowest / Ascending</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Main Table Content */}
      {loading ? (
        <LoadingSpinner message="Calculating route punctuality rankings..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchRoutes} />
      ) : filteredRoutes.length === 0 ? (
        <EmptyState
          title="No Routes Found"
          description={`No monitored bus routes match the search filter "${searchTerm}".`}
          actionText="Clear Filter"
          onAction={() => setSearchTerm('')}
        />
      ) : (
        <Card className="tp-card shadow-sm">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light small text-uppercase text-muted">
                  <tr>
                    <th style={{ width: '80px' }}>Rank</th>
                    <th>Route</th>
                    <th>Corridor Description</th>
                    <th>Valid Obs</th>
                    <th>Avg Delay</th>
                    <th>On-Time %</th>
                    <th>Reliability Score</th>
                    <th style={{ width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoutes.map((r) => (
                    <tr key={r.route_id}>
                      <td className="fw-bold text-muted text-center">
                        #{r.reliability_rank}
                      </td>
                      <td>
                        <Badge bg="primary" className="fs-6 px-2 py-1">
                          {r.route_short_name}
                        </Badge>
                      </td>
                      <td>
                        <Link to={`/routes/${r.route_id}`} className="text-decoration-none fw-semibold text-dark">
                          {r.route_long_name}
                        </Link>
                        <div className="small text-muted">{r.route_id}</div>
                      </td>
                      <td>
                        <span className="small text-muted">{r.observation_count.toLocaleString()}</span>
                      </td>
                      <td>
                        <span className={r.average_delay_minutes > 8 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                          +{r.average_delay_minutes} min
                        </span>
                        <div className="small text-muted">med: +{r.median_delay_minutes}m</div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <span className="fw-semibold text-dark">{r.on_time_percentage}%</span>
                        </div>
                        <div className="small text-muted">late: {r.delayed_percentage}%</div>
                      </td>
                      <td>
                        <ReliabilityBadge score={r.reliability_score} />
                      </td>
                      <td>
                        <Button
                          as={Link}
                          to={`/routes/${r.route_id}`}
                          variant="outline-primary"
                          size="sm"
                          className="d-flex align-items-center gap-1"
                        >
                          <Eye size={14} /> Dossier
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default RoutesPage;
