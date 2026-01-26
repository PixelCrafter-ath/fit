import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';

function CalendarView() {
  const [heatmapData, setHeatmapData] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchHeatmapData();
  }, [currentMonth]);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const startDate = currentMonth.clone().startOf('month').format('YYYY-MM-DD');
      const endDate = currentMonth.clone().endOf('month').format('YYYY-MM-DD');
      
      const response = await axios.get(
        `http://localhost:5000/api/diet-status/heatmap?months=1&start_date=${startDate}&end_date=${endDate}`
      );
      
      // Convert array to object for easier lookup
      const dataMap = {};
      response.data.data.forEach(day => {
        dataMap[day.date] = day.contacts.reduce((acc, contact) => {
          acc[contact.contact_id] = contact.updates;
          return acc;
        }, {});
      });
      
      setHeatmapData(dataMap);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    return currentMonth.daysInMonth();
  };

  const getFirstDayOfMonth = () => {
    return currentMonth.clone().startOf('month').day();
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(currentMonth.clone().add(direction, 'months'));
    setSelectedDate(null);
  };

  const getStatusClass = (dateStr, contactCount = 0) => {
    const today = moment().format('YYYY-MM-DD');
    
    if (dateStr > today) return 'pending';
    if (!heatmapData[dateStr]) return 'pending';
    
    const updates = Object.values(heatmapData[dateStr]).reduce((sum, count) => sum + count, 0);
    return updates > 0 ? 'updated' : 'missed';
  };

  const getTooltipText = (dateStr) => {
    if (!heatmapData[dateStr]) return 'No data';
    
    const contacts = heatmapData[dateStr];
    const totalUpdates = Object.values(contacts).reduce((sum, count) => sum + count, 0);
    const activeContacts = Object.keys(contacts).length;
    
    return `${activeContacts} contacts, ${totalUpdates} updates`;
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth();
    const firstDay = getFirstDayOfMonth();
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-cell"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = currentMonth.clone().date(day);
      const dateStr = dateObj.format('YYYY-MM-DD');
      const statusClass = getStatusClass(dateStr);
      const tooltip = getTooltipText(dateStr);
      
      days.push(
        <div
          key={day}
          className={`calendar-cell ${statusClass}`}
          title={`${dateObj.format('MMMM D, YYYY')} - ${tooltip}`}
          onClick={() => setSelectedDate(dateStr)}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  const getSelectedDateDetails = () => {
    if (!selectedDate || !heatmapData[selectedDate]) return null;
    
    const contacts = heatmapData[selectedDate];
    return Object.entries(contacts).map(([contactId, updates]) => ({
      contactId,
      updates,
      // In a real app, you'd fetch contact details here
      name: `Contact ${contactId.slice(-4)}`
    }));
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading calendar...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 fade-in-up">
        <h2 className="section-title gradient-text">
          📅 Diet Calendar
        </h2>
        <div className="d-flex align-items-center">
          <Button 
            variant="outline-secondary" 
            className="me-2"
            onClick={() => navigateMonth(-1)}
          >
            ◀️
          </Button>
          <h4 className="mb-0 mx-3">
            {currentMonth.format('MMMM YYYY')}
          </h4>
          <Button 
            variant="outline-secondary"
            onClick={() => navigateMonth(1)}
          >
            ▶️
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Monthly Overview</h5>
            </Card.Header>
            <Card.Body>
              {/* Calendar Header */}
              <div className="d-flex mb-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="calendar-cell fw-bold text-muted" style={{opacity: 0.7}}>
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="d-flex flex-wrap">
                {renderCalendarDays()}
              </div>
              
              {/* Legend */}
              <div className="d-flex justify-content-center mt-4">
                <div className="d-flex align-items-center me-4">
                  <div className="calendar-cell updated me-2"></div>
                  <span>Updated</span>
                </div>
                <div className="d-flex align-items-center me-4">
                  <div className="calendar-cell missed me-2"></div>
                  <span>Missed</span>
                </div>
                <div className="d-flex align-items-center">
                  <div className="calendar-cell pending me-2"></div>
                  <span>Pending/Future</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Legend & Stats</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6>Color Guide:</h6>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <span className="calendar-cell updated me-2"></span>
                    <span>Green: Diet updated</span>
                  </li>
                  <li className="mb-2">
                    <span className="calendar-cell missed me-2"></span>
                    <span>Red: Diet missed</span>
                  </li>
                  <li>
                    <span className="calendar-cell pending me-2"></span>
                    <span>Gray: Future/Pending</span>
                  </li>
                </ul>
              </div>
              
              <hr />
              
              <div>
                <h6>Instructions:</h6>
                <ul className="small">
                  <li>Click on any date to see details</li>
                  <li>Hover for quick stats</li>
                  <li>Green = Success</li>
                  <li>Red = Needs attention</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
          
          {/* Selected Date Details */}
          {selectedDate && (
            <Card className="mt-3">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">
                  📅 {moment(selectedDate).format('MMMM D, YYYY')}
                </h5>
              </Card.Header>
              <Card.Body>
                {getSelectedDateDetails() ? (
                  <div>
                    <p className="mb-2"><strong>Updates:</strong></p>
                    {getSelectedDateDetails().map(detail => (
                      <div key={detail.contactId} className="d-flex justify-content-between mb-1">
                        <span>{detail.name}</span>
                        <Badge bg={detail.updates > 0 ? 'success' : 'secondary'}>
                          {detail.updates} update{detail.updates !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No updates recorded for this date</p>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default CalendarView;