import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, ProgressBar, Spinner, Container } from 'react-bootstrap';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingReminders, setSendingReminders] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const statsResponse = await axios.get('http://localhost:5000/api/diet-status/stats');
      setStats(statsResponse.data);

      const todayResponse = await axios.get('http://localhost:5000/api/diet-status/today');
      setTodayStatus(todayResponse.data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendReminders = async () => {
    try {
      setSendingReminders(true);
      await axios.post('http://localhost:5000/api/send-reminders');
      alert('Reminders sent successfully!');
      fetchData();
    } catch (error) {
      console.error('Error sending reminders:', error);
      alert('Failed to send reminders');
    } finally {
      setSendingReminders(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="loading-spinner mx-auto"></div>
        <p className="mt-3 text-white">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="hero-section mb-4">
        <div className="hero-content">
          <h1 className="hero-title">Fitness Tracker Dashboard</h1>
          <p className="hero-subtitle">Track your team's health and wellness journey</p>
          <div className="d-flex justify-content-center gap-3">
            <Button
              variant="success"
              size="lg"
              className="pulse ripple-effect"
              onClick={fetchData}
            >
              Refresh Data
            </Button>
            <Button
              variant="info"
              size="lg"
              className="floating ripple-effect"
              onClick={sendReminders}
              disabled={sendingReminders}
            >
              {sendingReminders ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Sending...
                </>
              ) : (
                'Send Reminders'
              )}
            </Button>
          </div>
        </div>
      </div>

      <Row className="mb-4 g-4">
        <Col md={3} sm={6}>
          <Card className="card-stats h-100 fade-in-up">
            <div className="card-stats-icon">👥</div>
            <Card.Body>
              <div className="stat-label mb-2">Total Contacts</div>
              <div className="stat-number">{stats?.total_contacts || 0}</div>
              <Badge bg="success" className="mt-2">
                {stats?.active_contacts || 0} Active
              </Badge>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="card-stats h-100 fade-in-up" style={{animationDelay: '0.1s'}}>
            <div className="card-stats-icon">✅</div>
            <Card.Body>
              <div className="stat-label mb-2">Today's Updates</div>
              <div className="stat-number">{todayStatus?.updated_count || 0}</div>
              <ProgressBar className="mt-2">
                <ProgressBar
                  now={stats?.today_status?.update_rate || 0}
                />
              </ProgressBar>
              <small className="text-muted mt-1 d-block">
                {stats?.today_status?.update_rate || 0}% participation
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="card-stats h-100 fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="card-stats-icon">❌</div>
            <Card.Body>
              <div className="stat-label mb-2">Missed Today</div>
              <div className="stat-number">{todayStatus?.missed_count || 0}</div>
              <Badge bg="danger" className="mt-2">
                Needs reminder
              </Badge>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="card-stats h-100 fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="card-stats-icon">🔥</div>
            <Card.Body>
              <div className="stat-label mb-2">Avg Streak</div>
              <div className="stat-number">
                {stats?.overall_stats?.average_streak || 0}
              </div>
              <small className="text-muted">Days</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4 g-4">
        <Col md={4}>
          <div
            className="image-card"
            style={{
              backgroundImage: "url('https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800')"
            }}
          >
            <div className="image-card-content">
              <h3>Healthy Eating</h3>
              <p>Track daily nutrition and build better habits</p>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div
            className="image-card"
            style={{
              backgroundImage: "url('https://images.pexels.com/photos/3768582/pexels-photo-3768582.jpeg?auto=compress&cs=tinysrgb&w=800')"
            }}
          >
            <div className="image-card-content">
              <h3>Stay Active</h3>
              <p>Monitor your fitness journey every day</p>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div
            className="image-card"
            style={{
              backgroundImage: "url('https://images.pexels.com/photos/3094215/pexels-photo-3094215.jpeg?auto=compress&cs=tinysrgb&w=800')"
            }}
          >
            <div className="image-card-content">
              <h3>Track Progress</h3>
              <p>Visualize your health goals and achievements</p>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                Updated Today ({todayStatus?.updated_count || 0})
              </h5>
            </Card.Header>
            <Card.Body style={{maxHeight: '400px', overflowY: 'auto'}}>
              {todayStatus?.received && todayStatus.received.length > 0 ? (
                <div className="list-group">
                  {todayStatus.received.map((contact) => (
                    <div
                      key={contact._id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div className="d-flex align-items-center">
                          <div className="status-indicator active"></div>
                          <strong>{contact.name}</strong>
                        </div>
                        <small className="text-muted">{contact.phone_number}</small>
                      </div>
                      <div className="text-end">
                        <Badge bg="success" className="badge-updated mb-1">
                          Updated
                        </Badge>
                        <br />
                        <small className="text-muted">🔥 {contact.current_streak} days</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <div style={{fontSize: '4rem', opacity: 0.3}}>📭</div>
                  <p className="text-muted mt-3">No updates received today</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                Not Updated Today ({todayStatus?.missed_count || 0})
              </h5>
            </Card.Header>
            <Card.Body style={{maxHeight: '400px', overflowY: 'auto'}}>
              {todayStatus?.not_received && todayStatus.not_received.length > 0 ? (
                <div className="list-group">
                  {todayStatus.not_received.map((contact) => (
                    <div
                      key={contact._id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div className="d-flex align-items-center">
                          <div className="status-indicator inactive"></div>
                          <strong>{contact.name}</strong>
                        </div>
                        <small className="text-muted">{contact.phone_number}</small>
                      </div>
                      <div className="text-end">
                        <Badge bg="danger" className="badge-missed mb-1">
                          Missed
                        </Badge>
                        <br />
                        <small className="text-muted">Streak: {contact.current_streak} days</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <div style={{fontSize: '4rem'}}>🎉</div>
                  <p className="text-muted mt-3">Everyone updated today!</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {stats?.weekly_summary && (
        <Row className="mt-4">
          <Col md={12}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">This Week's Progress</h5>
              </Card.Header>
              <Card.Body>
                <Row className="text-center">
                  <Col md={3}>
                    <div className="p-3">
                      <div style={{fontSize: '2.5rem', marginBottom: '10px'}}>📊</div>
                      <h3 className="gradient-text">{stats.weekly_summary.total_updates}</h3>
                      <small className="text-muted">Total Updates</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-3">
                      <div style={{fontSize: '2.5rem', marginBottom: '10px'}}>👤</div>
                      <h3 className="gradient-text">{stats.weekly_summary.avg_updates_per_contact}</h3>
                      <small className="text-muted">Avg per Contact</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-3">
                      <div style={{fontSize: '2.5rem', marginBottom: '10px'}}>📈</div>
                      <h3 className="gradient-text">{stats.weekly_summary.completion_rate}%</h3>
                      <small className="text-muted">Completion Rate</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-3">
                      <div style={{fontSize: '2.5rem', marginBottom: '10px'}}>📅</div>
                      <small className="text-muted d-block">
                        {stats.weekly_summary.week_start}
                        <br />to<br />
                        {stats.weekly_summary.week_end}
                      </small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default Dashboard;
