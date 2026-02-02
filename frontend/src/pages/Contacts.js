import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Form,
  Badge,
  Spinner,
  Alert
} from 'react-bootstrap';
import axios from 'axios';

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    language: 'en',
    user_type: 'general',
    reminder_enabled: true,
    active: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/contacts');
      setContacts(response.data.contacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingContact) {
        await axios.put(`http://localhost:5000/api/contacts/${editingContact._id}`, formData);
        setSuccess('Contact updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/contacts', formData);
        setSuccess('Contact created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
      setError(error.response?.data?.error || 'Failed to save contact');
    }
  };

  const handleDelete = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await axios.delete(`http://localhost:5000/api/contacts/${contactId}`);
        setSuccess('Contact deleted successfully');
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
        setError('Failed to delete contact');
      }
    }
  };

  const openModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        name: contact.name,
        phone_number: contact.phone_number,
        language: contact.language,
        user_type: contact.user_type,
        reminder_enabled: contact.reminder_enabled,
        active: contact.active
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      phone_number: '',
      language: 'en',
      user_type: 'general',
      reminder_enabled: true,
      active: true
    });
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="loading-spinner mx-auto"></div>
        <p className="mt-3 text-white">Loading contacts...</p>
      </div>
    );
  }

  return (
    <div>
      <Row className="mb-4 g-4">
        <Col md={8}>
          <div className="d-flex align-items-center h-100">
            <div>
              <h1 className="gradient-text mb-3" style={{fontSize: '2.5rem'}}>
                Contact Management
              </h1>
              <p className="text-white" style={{fontSize: '1.1rem', opacity: 0.9}}>
                Manage your fitness team members and track their progress
              </p>
              <Button
                variant="success"
                size="lg"
                className="pulse ripple-effect mt-3"
                onClick={() => openModal()}
              >
                Add New Contact
              </Button>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div
            className="image-card"
            style={{
              backgroundImage: "url('https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800')"
            }}
          >
            <div className="image-card-content">
              <h4>Team Together</h4>
              <p>Build a healthier community</p>
            </div>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Row className="mb-3">
        <Col md={4} sm={6} className="mb-3">
          <Card className="card-stats h-100">
            <Card.Body className="text-center">
              <div style={{fontSize: '2.5rem', marginBottom: '10px'}}>👥</div>
              <div className="stat-number">{contacts.length}</div>
              <div className="stat-label">Total Contacts</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} sm={6} className="mb-3">
          <Card className="card-stats h-100">
            <Card.Body className="text-center">
              <div style={{fontSize: '2.5rem', marginBottom: '10px'}}>✅</div>
              <div className="stat-number">{contacts.filter(c => c.active).length}</div>
              <div className="stat-label">Active Members</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} sm={6} className="mb-3">
          <Card className="card-stats h-100">
            <Card.Body className="text-center">
              <div style={{fontSize: '2.5rem', marginBottom: '10px'}}>🔥</div>
              <div className="stat-number">
                {contacts.length > 0
                  ? Math.max(...contacts.map(c => c.current_streak))
                  : 0}
              </div>
              <div className="stat-label">Longest Streak</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">All Contacts ({contacts.length})</h5>
            <Button variant="outline-light" size="sm" className="floating" onClick={fetchContacts}>
              Refresh
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {contacts.length > 0 ? (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone Number</th>
                    <th>Status</th>
                    <th>Language</th>
                    <th>User Type</th>
                    <th>Streak</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className={`status-indicator ${contact.active ? 'active' : 'inactive'}`}></div>
                          <strong>{contact.name}</strong>
                        </div>
                      </td>
                      <td>{contact.phone_number}</td>
                      <td>
                        <Badge
                          bg={contact.active ? 'success' : 'secondary'}
                          className="me-1"
                        >
                          {contact.active ? 'Active' : 'Inactive'}
                        </Badge>
                        {contact.reminder_enabled && (
                          <Badge bg="info">Reminders</Badge>
                        )}
                      </td>
                      <td>
                        <Badge bg="primary">
                          {contact.language === 'en' ? 'EN' : 'HI'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={
                          contact.user_type === 'general' ? 'secondary' :
                          contact.user_type === 'weight_loss' ? 'warning' : 'danger'
                        }>
                          {contact.user_type.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={contact.current_streak > 0 ? 'success' : 'secondary'}>
                          🔥 {contact.current_streak}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2"
                          onClick={() => openModal(contact)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(contact._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <div style={{fontSize: '5rem', opacity: 0.3}}>👥</div>
              <h4 className="mt-3 text-muted">No contacts found</h4>
              <p className="text-muted">Get started by adding your first team member</p>
              <Button variant="success" size="lg" className="mt-3" onClick={() => openModal()}>
                Add Your First Contact
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingContact ? 'Edit Contact' : 'Add New Contact'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="+1234567890"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    required
                  />
                  <Form.Text className="text-muted">
                    Use E.164 format (e.g., +1234567890)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Language</Form.Label>
                  <Form.Select
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>User Type</Form.Label>
                  <Form.Select
                    value={formData.user_type}
                    onChange={(e) => setFormData({...formData, user_type: e.target.value})}
                  >
                    <option value="general">General</option>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="diabetic">Diabetic</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Check
                  type="switch"
                  id="reminder-enabled"
                  label="Enable Reminders"
                  checked={formData.reminder_enabled}
                  onChange={(e) => setFormData({...formData, reminder_enabled: e.target.checked})}
                />
              </Col>
              <Col md={6}>
                <Form.Check
                  type="switch"
                  id="active"
                  label="Active Contact"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="success" type="submit" className="ripple-effect">
              {editingContact ? 'Update Contact' : 'Add Contact'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Contacts;
