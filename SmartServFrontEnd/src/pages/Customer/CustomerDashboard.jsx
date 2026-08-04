import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Badge, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { vehicleService } from '../../services/vehicleService';
import { appointmentService } from '../../services/appointmentService';
import { invoiceService } from '../../services/invoiceService';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { getStatusBadge } from '../../utils/statusColors';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    vehicles: 0,
    appointments: 0,
    activeServices: 0,
    pendingPayments: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    const fetchCustomerDashboardData = async () => {
      try {
        setLoading(true);
        let customerVehicles = [];
        let customerAppts = [];
        let customerInvoices = [];

        if (user?.id) {
          [customerVehicles, customerAppts, customerInvoices] = await Promise.all([
            vehicleService.getByCustomerId(user.id),
            appointmentService.getByCustomerId(user.id),
            invoiceService.getByCustomer(user.id),
          ]);
        }

        const activeAppts = (customerAppts || []).filter(a => a.status === 'APPROVED' || a.status === 'PENDING' || a.status === 'IN_PROGRESS');
        const pendingInvoices = (customerInvoices || []).filter(i => i.paymentStatus !== 'PAID');

        setStats({
          vehicles: (customerVehicles || []).length,
          appointments: (customerAppts || []).length,
          activeServices: activeAppts.length,
          pendingPayments: pendingInvoices.length,
        });

        setRecentAppointments((customerAppts || []).slice(0, 5));
      } catch (err) {
        console.warn('Customer Dashboard silent fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDashboardData();
  }, [user]);

  if (loading) return <CardSkeleton count={4} />;

  return (
    <div>
      {/* Welcome Banner */}
      <Card className="border-0 shadow-sm bg-primary text-white mb-4 overflow-hidden rounded-3">
        <Card.Body className="p-4 d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h3 className="fw-bold mb-1">Welcome back, {user?.userName || 'Customer'}!</h3>
            <p className="mb-0 text-white-50">Manage your vehicles, track ongoing services, and view your invoices.</p>
          </div>
          <div className="mt-3 mt-md-0 d-flex gap-2">
            <Button variant="light" className="fw-semibold" onClick={() => navigate('/appointments/new')}>
              <i className="bi bi-calendar-plus me-2"></i>Book Service
            </Button>
            <Button variant="outline-light" className="fw-semibold" onClick={() => navigate('/customer/rsa')}>
              <i className="bi bi-shield-exclamation me-2"></i>RSA Support
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Summary Cards */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 cursor-pointer" onClick={() => navigate('/vehicles')}>
            <Card.Body className="d-flex align-items-center p-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary me-3">
                <i className="bi bi-car-front fs-3"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1 small text-uppercase fw-semibold">My Vehicles</h6>
                <h3 className="fw-bold mb-0">{stats.vehicles}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 cursor-pointer" onClick={() => navigate('/appointments')}>
            <Card.Body className="d-flex align-items-center p-4">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success me-3">
                <i className="bi bi-calendar-check fs-3"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1 small text-uppercase fw-semibold">My Appointments</h6>
                <h3 className="fw-bold mb-0">{stats.appointments}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 cursor-pointer" onClick={() => navigate('/customer/tracker')}>
            <Card.Body className="d-flex align-items-center p-4">
              <div className="bg-info bg-opacity-10 p-3 rounded-circle text-info me-3">
                <i className="bi bi-wrench-adjustable fs-3"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1 small text-uppercase fw-semibold">Active Services</h6>
                <h3 className="fw-bold mb-0">{stats.activeServices}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 cursor-pointer" onClick={() => navigate('/invoices')}>
            <Card.Body className="d-flex align-items-center p-4">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning me-3">
                <i className="bi bi-receipt fs-3"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1 small text-uppercase fw-semibold">Pending Payments</h6>
                <h3 className="fw-bold mb-0">{stats.pendingPayments}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Customer Isolated Recent Appointments */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-transparent border-0 py-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">My Recent Appointments</h5>
          <Button variant="link" size="sm" className="text-decoration-none fw-semibold" onClick={() => navigate('/appointments')}>
            View All <i className="bi bi-arrow-right"></i>
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Date & Time</th>
                <th>Vehicle</th>
                <th>Service / Note</th>
                <th>Status</th>
                <th className="text-end pe-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">You have no appointments booked yet.</td>
                </tr>
              ) : (
                recentAppointments.map((app) => {
                  const rawBrand = app.brand || app.make || app.vehicle?.brand || app.vehicle?.make || '';
                  const rawModel = app.model || app.vehicle?.model || '';
                  const rawPlate = app.licensePlate || app.vehicle?.licensePlate || '';

                  const fullTitle = `${rawBrand} ${rawModel}`.trim();
                  const vehicleTitle = fullTitle 
                    ? fullTitle.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) 
                    : 'Vehicle';

                  const rawDesc = app.problemDescription || app.description || app.serviceType || '';
                  const typeMatch = rawDesc.match(/\[Type:\s*([^\]]+)\]\s*(.*)/i);
                  let serviceBadge = null;
                  let notesText = rawDesc;

                  if (typeMatch) {
                    const rawType = typeMatch[1].trim();
                    notesText = typeMatch[2].trim() || 'N/A';
                    let serviceLabel = rawType;
                    const atMatch = rawType.match(/(.*?)\s+at\s+(.*)/i);
                    if (atMatch) serviceLabel = atMatch[1];

                    serviceBadge = serviceLabel
                      .replace(/GENERAL_SERVICE/gi, 'General Service')
                      .replace(/REPAIR/gi, 'Repair & Maintenance')
                      .replace(/INSPECTION/gi, 'Inspection')
                      .replace(/RSA/gi, 'RSA Emergency')
                      .replace(/_/g, ' ');
                  }

                  return (
                    <tr key={app.id}>
                      <td className="ps-4 align-middle">
                        <div className="fw-semibold text-dark">
                          {new Date(app.scheduledDate || app.requestDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                        </div>
                        {(app.scheduledTime || (typeMatch && rawDesc.match(/at\s+(\d{1,2}:\d{2})/i)?.[1])) && (
                          <small className="text-muted"><i className="bi bi-clock me-1"></i>{app.scheduledTime || rawDesc.match(/at\s+(\d{1,2}:\d{2})/i)?.[1]}</small>
                        )}
                      </td>
                      <td className="align-middle">
                        <div className="fw-bold text-primary">{vehicleTitle}</div>
                        {rawPlate && <span className="badge bg-light text-secondary border font-monospace mt-1 px-2 py-1">{rawPlate.toUpperCase()}</span>}
                      </td>
                      <td className="align-middle">
                        {serviceBadge && <Badge bg="primary" className="fw-semibold me-2 px-2 py-1 mb-1">{serviceBadge}</Badge>}
                        <div className="text-body small">{notesText || 'N/A'}</div>
                      </td>
                      <td className="align-middle">
                        <div>
                          <Badge bg={getStatusBadge(app.status)}>
                            {app.status || 'PENDING'}
                          </Badge>
                        </div>
                      </td>
                      <td className="text-end pe-4 align-middle">
                        <Button variant="outline-primary" size="sm" onClick={() => navigate('/customer/tracker')}>
                          Track Progress
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CustomerDashboard;
