import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const DashboardHome = () => {
  const { user, role } = useAuth();

  return (
    <div>
      <h3 className="fw-bold mb-4">Welcome back, {user?.userName || 'User'}!</h3>
      
      <Row className="g-4">
        <Col xs={12} md={6} lg={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 p-3 rounded text-primary me-3">
                  <i className="bi bi-person-badge fs-3"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-0">Role</h6>
                  <h4 className="fw-bold mb-0">{role}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="bg-success bg-opacity-10 p-3 rounded text-success me-3">
                  <i className="bi bi-calendar-check fs-3"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-0">Today's Appointments</h6>
                  <h4 className="fw-bold mb-0">--</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="bg-info bg-opacity-10 p-3 rounded text-info me-3">
                  <i className="bi bi-wrench fs-3"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-0">Active Job Cards</h6>
                  <h4 className="fw-bold mb-0">--</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardHome;
