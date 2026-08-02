import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center vh-100 text-center">
      <div className="display-1 fw-bold text-danger mb-2">401</div>
      <h3 className="fw-bold mb-2">Unauthorized Access</h3>
      <p className="text-muted mb-4" style={{ maxWidth: '400px' }}>
        You do not have permission to view this page or resource. Please switch accounts or log in with the correct role.
      </p>
      <Button variant="primary" onClick={() => navigate('/login')}>
        <i className="bi bi-box-arrow-in-right me-2"></i>Go to Login
      </Button>
    </Container>
  );
};

export default Unauthorized;
