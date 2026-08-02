import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Card } from 'react-bootstrap';

const AuthLayout = () => {
  return (
    <div className="bg-light min-vh-100 d-flex align-items-center">
      <Container className="d-flex justify-content-center">
        <Card className="p-4 shadow-sm border-0" style={{ maxWidth: '400px', width: '100%', borderRadius: '12px' }}>
          <div className="text-center mb-4">
            <i className="bi bi-car-front text-primary display-4"></i>
            <h4 className="mt-2 fw-bold">SmartServ Auto</h4>
            <p className="text-muted mb-0">Garage Management System</p>
          </div>
          <Outlet />
        </Card>
      </Container>
    </div>
  );
};

export default AuthLayout;
