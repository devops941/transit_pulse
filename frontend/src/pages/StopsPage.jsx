import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table, Badge, Button, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { MapPin, Search, Eye, AlertTriangle, Bus } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export const StopsPage = () => {
  const [stops, setStops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('average_delay_minutes');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStops();
  }, [sortBy, sortOrder]);

  const fetchStops = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getStops(searchTerm, sortBy, sortOrder);
      setStops(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load stops');
    } finally {
      setLoading(false);
    }
  };

  const filteredStops = stops.filter((s) => {
    const q = searchTerm.toLowerCase();
    return s.stop_name.toLowerCase().includes(q) || s.stop_id.toLowerCase().includes(q);
  });

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="mb-4">
        <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 mb-2">
          Module 5: Bus Stop Intelligence
        </Badge>
        <h2 className="fw-bold text-dark mb-1">Bus Stop Congestion & Delay Rankings</h2>
        <p className="text-muted small mb-0">
          Identify frequently delayed transit nodes, interchanges, and bottleneck bus stops across the network.
        </p>
      </div>

      {/* Search & Sort Controls */}
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
                  placeholder="Filter by stop name or identifier (e.g. CMBT, Guindy, Navalur)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
              </InputGroup>
            </Col>
            <Col sm={6} md={3}>
              <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="average_delay_minutes">Sort by Average Delay</option>
                <option value="observation_count">Sort by Observation Volume</option>
                <option value="stop_name">Sort by Stop Name</option>
              </Form.Select>
            </Col>
            <Col sm={6} md={3}>
              <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="desc">Highest / Descending</option>
                <option value="asc">Lowest / Ascending</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Main Table Content */}
      {loading ? (
        <LoadingSpinner message="Calculating stop congestion delays..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchStops} />
      ) : filteredStops.length === 0 ? (
        <EmptyState
          title="No Bus Stops Found"
          description={`No bus stops match your filter query "${searchTerm}".`}
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
                    <th style={{ width: '60px' }}>Rank</th>
                    <th>Bus Stop Name</th>
                    <th>Connected Corridors</th>
                    <th>Observations</th>
                    <th>Average Delay</th>
                    <th>Median Delay</th>
                    <th>On-Time Rate</th>
                    <th style={{ width: '120px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStops.map((s, idx) => (
                    <tr key={s.stop_id}>
                      <td className="fw-bold text-muted text-center">
                        #{idx + 1}
                      </td>
                      <td>
                        <Link to={`/stops/${s.stop_id}`} className="text-decoration-none fw-semibold text-dark">
                          {s.stop_name}
                        </Link>
                        <div className="small text-muted">{s.stop_id}</div>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {s.routes_served?.map((r) => (
                            <Badge key={r} bg="light" text="dark" className="border">
                              {r}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className="small text-muted">{s.observation_count.toLocaleString()}</span>
                      </td>
                      <td>
                        <span className={s.average_delay_minutes > 10 ? 'text-danger fw-bold' : (s.average_delay_minutes > 5 ? 'text-warning fw-bold' : 'text-success fw-bold')}>
                          +{s.average_delay_minutes} min
                        </span>
                      </td>
                      <td>
                        <span className="text-muted small">+{s.median_delay_minutes}m</span>
                      </td>
                      <td>
                        <span className="fw-semibold text-dark">{s.on_time_percentage}%</span>
                      </td>
                      <td>
                        <Button
                          as={Link}
                          to={`/stops/${s.stop_id}`}
                          variant="outline-primary"
                          size="sm"
                          className="d-flex align-items-center gap-1"
                        >
                          <Eye size={14} /> Profile
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

export default StopsPage;
