import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';

function Navigation() {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/contacts', icon: '👥', label: 'Contacts' },
    { path: '/calendar', icon: '📅', label: 'Calendar' },
    { path: '/reports', icon: '📈', label: 'Reports' },
    { path: '/settings', icon: '⚙️', label: 'Settings' }
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <Navbar 
        bg="dark" 
        variant="dark" 
        expand="lg" 
        className="shadow-sm mb-4"
        expanded={expanded}
        onToggle={setExpanded}
      >
        <Container fluid>
          <Navbar.Brand href="#" className="d-flex align-items-center">
            💪 AKR Fitness Tracker
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {navItems.map((item) => (
                <Nav.Link 
                  key={item.path}
                  as={Link} 
                  to={item.path}
                  className={isActive(item.path) ? 'active fw-bold' : ''}
                  onClick={() => setExpanded(false)}
                >
                  {item.icon} {item.label}
                </Nav.Link>
              ))}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default Navigation;