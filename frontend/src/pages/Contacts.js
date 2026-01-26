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
        // Update existing contact
        await axios.put(`http://localhost:5000/api/contacts/${editingContact._id}`, formData);
        setSuccess('Contact updated successfully');
      } else {
        // Create new contact
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
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading contacts...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 fade-in-up">
        <h2 className="section-title gradient-text">
          👥 Contact Management
        </h2>
        <Button variant="success" className="pulse" onClick={() => openModal()}>
          + Add Contact
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 gradient-text">All Contacts ({contacts.length})</h5>
            <Button variant="outline-secondary" size="sm" className="floating" onClick={fetchContacts}>
              🔄 Refresh
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
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
                      <strong>{contact.name}</strong>
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
                        <Badge bg="info">Reminders ON</Badge>
                      )}
                    </td>
                    <td>
                      <Badge bg="primary">
                        {contact.language === 'en' ? 'English' : 'Hindi'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={
                        contact.user_type === 'general' ? 'secondary' :
                        contact.user_type === 'weight_loss' ? 'warning' : 'danger'
                      }>
                        {contact.user_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={contact.current_streak > 0 ? 'success' : 'secondary'}>
                        {contact.current_streak} days
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                        onClick={() => openModal(contact)}
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(contact._id)}
                      >
                        🗑️
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          {contacts.length === 0 && (
            <div className="text-center py-5">
              👥
              <p className="mt-2 text-muted">No contacts found</p>
              <Button variant="primary" onClick={() => openModal()}>
                + Add Your First Contact
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Contact Modal */}
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
                  <Form.Label>Name *</Form.Label>
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
                  <Form.Label>Phone Number *</Form.Label>
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
              ❌ Cancel
            </Button>
            <Button variant="primary" type="submit">
              💾 {editingContact ? 'Update Contact' : 'Add Contact'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Contacts;