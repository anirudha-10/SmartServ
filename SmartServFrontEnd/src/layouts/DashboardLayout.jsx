import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Dropdown, Offcanvas, Badge, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = () => {
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinksForRole = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { text: 'Admin Overview', icon: 'bi-speedometer2', path: '/admin' },
          { text: 'User Management', icon: 'bi-people', path: '/admin/users' },
          { text: 'Vehicles', icon: 'bi-car-front', path: '/vehicles' },
          { text: 'Inventory', icon: 'bi-box-seam', path: '/inventory' },
          { text: 'Job Cards', icon: 'bi-wrench', path: '/job-cards' },
          { text: 'Invoices & Payments', icon: 'bi-receipt', path: '/invoices' },
          { text: 'Reports', icon: 'bi-graph-up-arrow', path: '/admin/reports' },
        ];
      case 'MANAGER':
        return [
          { text: 'Manager Overview', icon: 'bi-speedometer2', path: '/manager' },
          { text: 'Pending Approvals', icon: 'bi-calendar-check', path: '/manager/approvals' },
          { text: 'Job Cards', icon: 'bi-wrench', path: '/job-cards' },
          { text: 'Inventory Alerts', icon: 'bi-exclamation-triangle', path: '/inventory' },
          { text: 'Invoices', icon: 'bi-receipt', path: '/invoices' },
        ];
      case 'MECHANIC':
        return [
          { text: 'My Jobs', icon: 'bi-wrench-adjustable', path: '/mechanic' },
          { text: 'Inventory Catalog', icon: 'bi-box-seam', path: '/inventory' },
        ];
      case 'CUSTOMER':
      default:
        return [
          { text: 'Customer Home', icon: 'bi-house-door', path: '/customer' },
          { text: 'My Vehicles', icon: 'bi-car-front', path: '/vehicles' },
          { text: 'Book Appointment', icon: 'bi-calendar-plus', path: '/appointments/new' },
          { text: 'Appointment History', icon: 'bi-clock-history', path: '/appointments' },
          { text: 'Service Tracker', icon: 'bi-geo-alt', path: '/customer/tracker' },
          { text: 'My Invoices', icon: 'bi-receipt', path: '/invoices' },
          { text: 'Roadside Assistance', icon: 'bi-shield-exclamation', path: '/customer/rsa' },
          { text: 'Profile & Settings', icon: 'bi-person-gear', path: '/customer/profile' },
        ];
    }
  };

  const navLinks = getLinksForRole();

  const getRoleBadgeVariant = (userRole) => {
    switch (userRole) {
      case 'ADMIN': return 'danger';
      case 'MANAGER': return 'warning';
      case 'MECHANIC': return 'info';
      case 'CUSTOMER': return 'success';
      default: return 'primary';
    }
  };

  const SidebarContent = () => (
    <Nav className="flex-column w-100 mt-3">
      {navLinks.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Nav.Link 
            key={item.text} 
            onClick={() => { navigate(item.path); setShowSidebar(false); }}
            className={`d-flex align-items-center py-2 px-3 rounded transition-all ${
              isActive ? 'bg-primary text-white shadow-sm fw-bold' : 'text-body hover-bg'
            }`}
            style={{ marginBottom: '6px', cursor: 'pointer' }}
          >
            <i className={`bi ${item.icon} me-3 fs-5 ${isActive ? 'text-white' : 'text-primary'}`}></i>
            <span>{item.text}</span>
          </Nav.Link>
        );
      })}
    </Nav>
  );

  return (
    <div className="d-flex flex-column vh-100 overflow-hidden bg-body text-body">
      {/* Top Navbar */}
      <Navbar bg={theme === 'dark' ? 'dark' : 'white'} className="shadow-sm border-bottom py-2 px-3 z-index-1030">
        <Button variant="outline-secondary" className="d-md-none me-2 border-0" onClick={() => setShowSidebar(true)}>
          <i className="bi bi-list fs-4"></i>
        </Button>
        
        <Navbar.Brand className="d-flex align-items-center fw-bold text-primary cursor-pointer me-auto" onClick={() => navigate('/')}>
          <i className="bi bi-car-front-fill me-2 fs-3 text-primary"></i>
          <span>SmartServ</span>
          <Badge bg={getRoleBadgeVariant(role)} className="ms-2 fs-7 px-2 py-1 align-middle">
            {role || 'USER'}
          </Badge>
        </Navbar.Brand>
        
        <div className="d-flex align-items-center gap-2">
          {/* Light/Dark Mode Toggle */}
          <Button 
            variant={theme === 'dark' ? 'outline-light' : 'outline-dark'} 
            size="sm" 
            className="rounded-circle p-2 d-flex align-items-center justify-content-center"
            style={{ width: '38px', height: '38px' }}
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            <i className={`bi ${theme === 'light' ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`}></i>
          </Button>

          {/* Notifications Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle variant="light" className="position-relative border-0 bg-transparent p-2">
              <i className="bi bi-bell fs-5 text-body"></i>
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                <span className="visually-hidden">New alerts</span>
              </span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow border-0 p-2 dropdown-menu-end" style={{ width: '300px' }}>
              <Dropdown.Header className="fw-bold">Notifications</Dropdown.Header>
              <Dropdown.Item className="py-2 border-bottom">
                <small className="fw-bold d-block text-primary">Appointment Approved</small>
                <small className="text-muted">Your appointment for Honda Civic was approved.</small>
              </Dropdown.Item>
              <Dropdown.Item className="py-2">
                <small className="fw-bold d-block text-success">Invoice Generated</small>
                <small className="text-muted">Invoice #INV-2026 is ready for payment.</small>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* Profile Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle variant="light" className="d-flex align-items-center border-0 bg-transparent p-1">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2 fw-bold" style={{ width: '35px', height: '35px' }}>
                {(user?.userName || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="d-none d-sm-inline fw-medium text-body me-1">{user?.userName || 'User'}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow border-0 dropdown-menu-end">
              <Dropdown.Item onClick={() => navigate('/customer/profile')}>
                <i className="bi bi-person me-2"></i> Profile Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                <i className="bi bi-box-arrow-right me-2"></i> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Navbar>

      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Desktop Permanent Sidebar */}
        <div className="d-none d-md-block bg-body border-end shadow-sm" style={{ width: '260px', overflowY: 'auto' }}>
          <div className="p-3">
            <SidebarContent />
          </div>
        </div>

        {/* Mobile Offcanvas Sidebar */}
        <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} className="d-md-none" style={{ width: '280px' }}>
          <Offcanvas.Header closeButton className="border-bottom">
            <Offcanvas.Title className="fw-bold text-primary d-flex align-items-center">
              <i className="bi bi-car-front-fill me-2 fs-4"></i> SmartServ
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-3">
            <SidebarContent />
          </Offcanvas.Body>
        </Offcanvas>

        {/* Main Content Area with Framer Motion Page Transition */}
        <main className="flex-grow-1 p-3 p-md-4 overflow-auto">
          <Container fluid className="px-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </Container>
        </main>
      </div>

      <style>
        {`
          .hover-bg:hover {
            background-color: var(--bs-tertiary-bg) !important;
          }
          .cursor-pointer {
            cursor: pointer;
          }
          .transition-all {
            transition: all 0.2s ease-in-out;
          }
        `}
      </style>
    </div>
  );
};

export default DashboardLayout;
