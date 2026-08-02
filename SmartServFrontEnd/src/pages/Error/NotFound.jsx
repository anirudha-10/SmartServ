import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center vh-100 text-center">
      <div className="display-1 fw-bold text-primary mb-2">404</div>
      <h3 className="fw-bold mb-2">Page Not Found</h3>
      <p className="text-muted mb-4" style={{ maxWidth: '400px' }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Button variant="primary" onClick={() => navigate('/')}>
        <i className="bi bi-house me-2"></i>Back to Home
      </Button>
    </Container>
  );
};

export default NotFound;
