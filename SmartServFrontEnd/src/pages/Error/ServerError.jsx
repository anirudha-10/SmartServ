import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ServerError = () => {
  const navigate = useNavigate();

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center vh-100 text-center">
      <div className="display-1 fw-bold text-warning mb-2">500</div>
      <h3 className="fw-bold mb-2">Internal Server Error</h3>
      <p className="text-muted mb-4" style={{ maxWidth: '400px' }}>
        Oops! Something went wrong on our server. Please try refreshing or try again later.
      </p>
      <Button variant="primary" onClick={() => navigate('/')}>
        <i className="bi bi-arrow-clockwise me-2"></i>Try Again
      </Button>
    </Container>
  );
};

export default ServerError;
