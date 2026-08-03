import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { vehicleService } from '../../services/vehicleService';
import { jobCardService } from '../../services/jobCardService';
import { invoiceService } from '../../services/invoiceService';
import { CardSkeleton } from '../../components/common/SkeletonLoader';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    vehicles: 0,
    jobCards: 0,
    revenue: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [usersData, vehiclesData, jobCardsData, invoiceStats] = await Promise.all([
          userService.getAll().catch(() => []),
          vehicleService.getAll().catch(() => []),
          jobCardService.getAll().catch(() => []),
          invoiceService.getStats().catch(() => ({ revenue: 0 })),
        ]);

        setStats({
          users: usersData.length,
          vehicles: vehiclesData.length,
          jobCards: jobCardsData.length,
          revenue: invoiceStats.revenue || 0,
        });

        setRecentUsers(usersData.slice(0, 5));
      } catch (err) {
        console.error('Admin dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) return <CardSkeleton count={4} />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">System Overview & Administration</h3>
          <p className="text-muted mb-0">High-level control panel for users, revenue, inventory, and system metrics.</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => navigate('/admin/users')}>
            <i className="bi bi-person-plus me-2"></i>Manage Users
          </Button>
          <Button variant="outline-primary" onClick={() => navigate('/admin/reports')}>
            <i className="bi bi-graph-up me-2"></i>Analytics
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 cursor-pointer" onClick={() => navigate('/admin/users')}>
            <Card.Body className="d-flex align-items-center p-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary me-3">
                <i className="bi bi-people fs-3"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1 small text-uppercase fw-semibold">Total System Users</h6>
                <h3 className="fw-bold mb-0">{stats.users}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 cursor-pointer" onClick={() => navigate('/vehicles')}>
            <Card.Body className="d-flex align-items-center p-4">
              <div className="bg-info bg-opacity-10 p-3 rounded-circle text-info me-3">
                <i className="bi bi-car-front fs-3"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1 small text-uppercase fw-semibold">Registered Vehicles</h6>
                <h3 className="fw-bold mb-0">{stats.vehicles}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 cursor-pointer" onClick={() => navigate('/job-cards')}>
            <Card.Body className="d-flex align-items-center p-4">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning me-3">
                <i className="bi bi-wrench-adjustable fs-3"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1 small text-uppercase fw-semibold">Total Job Cards</h6>
                <h3 className="fw-bold mb-0">{stats.jobCards}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 cursor-pointer" onClick={() => navigate('/invoices')}>
            <Card.Body className="d-flex align-items-center p-4">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success me-3">
                <i className="bi bi-cash-stack fs-3"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1 small text-uppercase fw-semibold">Total Revenue</h6>
                <h3 className="fw-bold mb-0">₹{stats.revenue.toFixed(2)}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Management Overview */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-transparent border-0 py-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">Recent Registered Users</h5>
          <Button variant="link" size="sm" className="text-decoration-none fw-semibold" onClick={() => navigate('/admin/users')}>
            View All Users <i className="bi bi-arrow-right"></i>
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Username</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-muted">No users found.</td>
                </tr>
              ) : (
                recentUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="ps-4 align-middle fw-medium">{u.userName}</td>
                    <td className="align-middle">{u.email}</td>
                    <td className="align-middle">{u.mobile}</td>
                    <td className="align-middle">
                      <Badge bg={u.userRole === 'ADMIN' ? 'danger' : u.userRole === 'MANAGER' ? 'warning' : 'primary'}>
                        {u.userRole}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminDashboard;
