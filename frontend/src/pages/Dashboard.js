import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, ProgressBar, Spinner } from 'react-bootstrap';
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
      
      // Fetch statistics
      const statsResponse = await axios.get('http://localhost:5000/api/diet-status/stats');
      setStats(statsResponse.data);
      
      // Fetch today's status
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
      fetchData(); // Refresh data
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
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 fade-in-up">
        <h2 className="section-title gradient-text">Dashboard Overview</h2>
        <div>
          <Button 
            variant="primary" 
            className="me-2 pulse"
            onClick={fetchData}
          >
            🔄 Refresh
          </Button>
          <Button 
            variant="success" 
            className="floating"
            onClick={sendReminders}
            disabled={sendingReminders}
          >
            {sendingReminders ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Sending...
              </>
            ) : (
              <>
                🔔 Send Reminders
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="card-stats h-100 fade-in-up">
            <Card.Body>
              <Card.Title className="text-muted">Total Contacts</Card.Title>
              <div className="stat-number">{stats?.total_contacts || 0}</div>
              <div className="stat-label">
                <Badge bg="success">{stats?.active_contacts || 0} Active</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="card-stats h-100 fade-in-up" style={{animationDelay: '0.1s'}}>
            <Card.Body>
              <Card.Title className="text-muted">Today's Updates</Card.Title>
              <div className="stat-number">{todayStatus?.updated || 0}</div>
              <div className="stat-label">
                <ProgressBar>
                  <ProgressBar 
                    variant="success" 
                    now={stats?.today_status?.update_rate || 0} 
                    key={1} 
                  />
                </ProgressBar>
                <small>{stats?.today_status?.update_rate || 0}% participation</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="card-stats h-100 fade-in-up" style={{animationDelay: '0.2s'}}>
            <Card.Body>
              <Card.Title className="text-muted">Missed Today</Card.Title>
              <div className="stat-number">{todayStatus?.missed || 0}</div>
              <div className="stat-label">
                <Badge bg="danger">{todayStatus?.missed || 0} users</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="card-stats h-100 fade-in-up" style={{animationDelay: '0.3s'}}>
            <Card.Body>
              <Card.Title className="text-muted">Avg Streak</Card.Title>
              <div className="stat-number">
                {stats?.overall_stats?.average_streak || 0}
              </div>
              <div className="stat-label">
                📈 <small>Daily streak average</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Today's Status */}
      <Row>
        <Col md={6}>
          <Card>
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">
                ✅ Updated Today ({todayStatus?.updated || 0})
              </h5>
            </Card.Header>
            <Card.Body>
              {todayStatus?.received && todayStatus.received.length > 0 ? (
                <div className="list-group">
                  {todayStatus.received.map((contact) => (
                    <div 
                      key={contact._id} 
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{contact.name}</strong>
                        <br />
                        <small className="text-muted">{contact.phone_number}</small>
                      </div>
                      <div className="text-end">
                        <Badge bg="success" className="badge-updated mb-1">
                          Updated
                        </Badge>
                        <br />
                        <small>Streak: {contact.current_streak} days</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center py-3">
                  No updates received today
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header className="bg-danger text-white">
              <h5 className="mb-0">
                ❌ Not Updated Today ({todayStatus?.missed || 0})
              </h5>
            </Card.Header>
            <Card.Body>
              {todayStatus?.not_received && todayStatus.not_received.length > 0 ? (
                <div className="list-group">
                  {todayStatus.not_received.map((contact) => (
                    <div 
                      key={contact._id} 
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{contact.name}</strong>
                        <br />
                        <small className="text-muted">{contact.phone_number}</small>
                      </div>
                      <div className="text-end">
                        <Badge bg="danger" className="badge-missed mb-1">
                          Missed
                        </Badge>
                        <br />
                        <small>Streak: {contact.current_streak} days</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center py-3">
                  Everyone updated today! 🎉
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Weekly Summary Preview */}
      {stats?.weekly_summary && (
        <Row className="mt-4">
          <Col md={12}>
            <Card>
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">This Week's Progress</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <h6>Total Updates</h6>
                    <div className="stat-number text-info">
                      {stats.weekly_summary.total_updates}
                    </div>
                  </Col>
                  <Col md={3}>
                    <h6>Avg per Contact</h6>
                    <div className="stat-number text-info">
                      {stats.weekly_summary.avg_updates_per_contact}
                    </div>
                  </Col>
                  <Col md={3}>
                    <h6>Completion Rate</h6>
                    <div className="stat-number text-info">
                      {stats.weekly_summary.completion_rate}%
                    </div>
                  </Col>
                  <Col md={3}>
                    <h6>Period</h6>
                    <small>
                      {stats.weekly_summary.week_start} to {stats.weekly_summary.week_end}
                    </small>
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