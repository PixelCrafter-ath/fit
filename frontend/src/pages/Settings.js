import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Alert, 
  Spinner,
  Accordion
} from 'react-bootstrap';
import axios from 'axios';

function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [timezones, setTimezones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    reminder_time: '18:00',
    reminder_timezone: 'Asia/Kolkata',
    admin_phone: '',
    admin_name: '',
    weekly_summary_day: 'sunday'
  });

  useEffect(() => {
    fetchSettings();
    fetchTimezones();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/settings');
      setSettings(response.data);
      setFormData({
        reminder_time: response.data.reminder_time || '18:00',
        reminder_timezone: response.data.reminder_timezone || 'Asia/Kolkata',
        admin_phone: response.data.admin_phone || '',
        admin_name: response.data.admin_name || '',
        weekly_summary_day: response.data.weekly_summary_day || 'sunday'
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimezones = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/settings/timezones');
      setTimezones(response.data);
    } catch (error) {
      console.error('Error fetching timezones:', error);
    }
  };

  const handleSave = async (settingType) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      let endpoint = '';
      let payload = {};

      switch(settingType) {
        case 'reminder':
          endpoint = '/settings/reminder-time';
          payload = {
            reminder_time: formData.reminder_time,
            reminder_timezone: formData.reminder_timezone
          };
          break;
        case 'admin':
          endpoint = '/settings/admin-info';
          payload = {
            admin_phone: formData.admin_phone,
            admin_name: formData.admin_name
          };
          break;
        case 'weekly':
          endpoint = '/settings/weekly-day';
          payload = {
            weekly_summary_day: formData.weekly_summary_day
          };
          break;
        default:
          throw new Error('Invalid setting type');
      }

      const response = await axios.post(`http://localhost:5000/api${endpoint}`, payload);
      setSettings(response.data.settings);
      setSuccess(`${settingType.charAt(0).toUpperCase() + settingType.slice(1)} settings saved successfully`);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      try {
        setSaving(true);
        const response = await axios.post('http://localhost:5000/api/settings/reset');
        setSettings(response.data.settings);
        setFormData({
          reminder_time: response.data.settings.reminder_time,
          reminder_timezone: response.data.settings.reminder_timezone,
          admin_phone: response.data.settings.admin_phone || '',
          admin_name: response.data.settings.admin_name || '',
          weekly_summary_day: response.data.settings.weekly_summary_day
        });
        setSuccess('Settings reset to defaults');
      } catch (error) {
        console.error('Error resetting settings:', error);
        setError('Failed to reset settings');
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading settings...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 fade-in-up">
        <h2 className="section-title gradient-text">
          ⚙️ System Settings
        </h2>
        <Button variant="outline-secondary" onClick={fetchSettings}>
          🔄 Refresh
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Row>
        <Col md={8}>
          <Accordion defaultActiveKey="0">
            {/* Reminder Settings */}
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <h5 className="mb-0">
                  <i className="fas fa-bell me-2"></i>
                  Reminder Settings
                </h5>
              </Accordion.Header>
              <Accordion.Body>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Daily Reminder Time</Form.Label>
                        <Form.Control
                          type="time"
                          value={formData.reminder_time}
                          onChange={(e) => setFormData({...formData, reminder_time: e.target.value})}
                        />
                        <Form.Text className="text-muted">
                          Time when daily reminders will be sent (24-hour format)
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Timezone</Form.Label>
                        <Form.Select
                          value={formData.reminder_timezone}
                          onChange={(e) => setFormData({...formData, reminder_timezone: e.target.value})}
                        >
                          {timezones.map(tz => (
                            <option key={tz.value} value={tz.value}>
                              {tz.label}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button 
                    variant="primary" 
                    onClick={() => handleSave('reminder')}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        💾 Save Reminder Settings
                      </>
                    )}
                  </Button>
                </Card.Body>
              </Accordion.Body>
            </Accordion.Item>

            {/* Admin Settings */}
            <Accordion.Item eventKey="1">
              <Accordion.Header>
                <h5 className="mb-0">
                  <i className="fas fa-user-shield me-2"></i>
                  Admin Settings
                </h5>
              </Accordion.Header>
              <Accordion.Body>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Admin Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter admin name"
                          value={formData.admin_name}
                          onChange={(e) => setFormData({...formData, admin_name: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Admin Phone Number</Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="+1234567890"
                          value={formData.admin_phone}
                          onChange={(e) => setFormData({...formData, admin_phone: e.target.value})}
                        />
                        <Form.Text className="text-muted">
                          For receiving daily summaries
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button 
                    variant="primary" 
                    onClick={() => handleSave('admin')}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        💾 Save Admin Settings
                      </>
                    )}
                  </Button>
                </Card.Body>
              </Accordion.Body>
            </Accordion.Item>

            {/* Weekly Summary Settings */}
            <Accordion.Item eventKey="2">
              <Accordion.Header>
                <h5 className="mb-0">
                  <i className="fas fa-calendar-week me-2"></i>
                  Weekly Summary Settings
                </h5>
              </Accordion.Header>
              <Accordion.Body>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Weekly Summary Day</Form.Label>
                    <Form.Select
                      value={formData.weekly_summary_day}
                      onChange={(e) => setFormData({...formData, weekly_summary_day: e.target.value})}
                    >
                      <option value="sunday">Sunday</option>
                      <option value="monday">Monday</option>
                      <option value="friday">Friday</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Day when weekly summaries will be generated and sent
                    </Form.Text>
                  </Form.Group>
                  <Button 
                    variant="primary" 
                    onClick={() => handleSave('weekly')}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        💾 Save Weekly Settings
                      </>
                    )}
                  </Button>
                </Card.Body>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {/* Reset Settings */}
          <Card className="mt-4 border-danger">
            <Card.Header className="bg-danger text-white">
              <h5 className="mb-0">
                ⚠️ Danger Zone
              </h5>
            </Card.Header>
            <Card.Body>
              <p>
                ⚠️ Reset all settings to their default values. This action cannot be undone.
              </p>
              <Button 
                variant="danger" 
                onClick={handleReset}
                disabled={saving}
              >
                🔄 Reset All Settings
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Help Sidebar */}
        <Col md={4}>
          <Card>
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">
                ℹ️ Settings Guide
              </h5>
            </Card.Header>
            <Card.Body>
              <h6>Reminder Settings</h6>
              <ul className="small">
                <li>Set when daily reminders are sent</li>
                <li>Choose appropriate timezone</li>
                <li>Uses 24-hour format (e.g., 18:00 = 6 PM)</li>
              </ul>

              <h6>Admin Settings</h6>
              <ul className="small">
                <li>Configure admin contact info</li>
                <li>Admin receives daily summaries</li>
                <li>Used for system notifications</li>
              </ul>

              <h6>Weekly Summary</h6>
              <ul className="small">
                <li>Choose day for weekly reports</li>
                <li>Summaries sent to all users</li>
                <li>Performance analytics included</li>
              </ul>

              <hr />

              <div className="alert alert-warning">
                <h6 className="alert-heading">
                  ⚠️ Important Notes
                </h6>
                <ul className="small mb-0">
                  <li>Changes take effect immediately</li>
                  <li>Cron jobs adjust automatically</li>
                  <li>Test settings in development first</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default SettingsPage;