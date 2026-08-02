import React from 'react';
import { Row, Col, Card, ProgressBar } from 'react-bootstrap';

const AnalyticsReports = () => {
  return (
    <div>
      <h3 className="fw-bold mb-1">Analytics & System Performance</h3>
      <p className="text-muted mb-4">Detailed visual performance indicators, revenue metrics, and job completion statistics.</p>

      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0">Job Completion Performance</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-semibold">Completed Jobs (85%)</span>
                  <span className="text-muted">85 / 100</span>
                </div>
                <ProgressBar now={85} variant="success" animated style={{ height: '12px' }} />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-semibold">Jobs In Progress (12%)</span>
                  <span className="text-muted">12 / 100</span>
                </div>
                <ProgressBar now={12} variant="primary" animated style={{ height: '12px' }} />
              </div>

              <div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-semibold">Pending Approvals (3%)</span>
                  <span className="text-muted">3 / 100</span>
                </div>
                <ProgressBar now={3} variant="warning" style={{ height: '12px' }} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0">Workshop Capacity & Inventory</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-semibold">Mechanic Utilization (90%)</span>
                  <span className="text-muted">High Occupancy</span>
                </div>
                <ProgressBar now={90} variant="info" style={{ height: '12px' }} />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-semibold">Inventory Stock Health (78%)</span>
                  <span className="text-muted">Optimal</span>
                </div>
                <ProgressBar now={78} variant="success" style={{ height: '12px' }} />
              </div>

              <div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-semibold">On-Time Invoice Settlement (94%)</span>
                  <span className="text-muted">Paid On Time</span>
                </div>
                <ProgressBar now={94} variant="primary" style={{ height: '12px' }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsReports;
