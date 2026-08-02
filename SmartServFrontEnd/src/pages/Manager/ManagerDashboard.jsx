import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Badge, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { jobCardService } from '../../services/jobCardService';
import { invoiceService } from '../../services/invoiceService';
import { inventoryService } from '../../services/inventoryService';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { toast } from 'react-toastify';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    pendingAppointments: 0,
    activeJobCards: 0,
    lowStockCount: 0,
    revenue: 0,
  });
  const [pendingList, setPendingList] = useState([]);

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      const [pendingAppts, jobCards, inventoryData, invoiceStats] = await Promise.all([
        appointmentService.getPending().catch(() => []),
        jobCardService.getAll().catch(() => []),
        inventoryService.getAll().catch(() => []),
        invoiceService.getStats().catch(() => ({ revenue: 0 })),
      ]);

      const lowStock = inventoryData.filter(item => item.quantityAvailable <= 5);

      setMetrics({
        pendingAppointments: pendingAppts.length,
        activeJobCards: jobCards.filter(j => j.status === 'IN_PROGRESS' || j.status === 'CREATED').length,
        lowStockCount: lowStock.length,
        revenue: invoiceStats.revenue || 0,
      });

      setPendingList(pendingAppts.slice(0, 5));
    } catch (err) {
      console.error('Manager dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await appointmentService.approve(id);
      toast.success('Appointment Approved!');
      fetchManagerData();
    } catch (err) {
      toast.error('Failed to approve appointment');
    }
  };

  const formatCustomerVehicle = (app) => {
    const rawBrand = app.brand || app.make || app.vehicle?.brand || app.vehicle?.make || '';
    const rawModel = app.model || app.vehicle?.model || '';
    const rawPlate = app.licensePlate || app.vehicle?.licensePlate || '';
    const custName = app.customerName || app.customer?.userName || 'Customer';

    const fullTitle = `${rawBrand} ${rawModel}`.trim();
    const capitalizedTitle = fullTitle 
      ? fullTitle.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) 
      : 'Vehicle';

    return (
      <div>
        <div className="fw-bold text-dark">{custName}</div>
        <div className="text-primary small fw-semibold">{capitalizedTitle}</div>
        {rawPlate && (
          <span className="badge bg-light text-secondary border font-monospace mt-1 px-2 py-1">
            {rawPlate.toUpperCase()}
          </span>
        )}
      </div>
    );
  };

  const formatDateTime = (app) => {
    const rawDate = app.requestDate || app.scheduledDate;
    let formattedDate = 'N/A';
    if (rawDate) {
      try {
        formattedDate = new Date(rawDate).toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric'
        });
      } catch (e) {
        formattedDate = String(rawDate);
      }
    }

    let timeStr = app.scheduledTime || '';
    const rawDesc = app.problemDescription || app.description || '';
    if (!timeStr && rawDesc) {
      const timeMatch = rawDesc.match(/at\s+(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i);
      if (timeMatch) {
        timeStr = timeMatch[1];
      }
    }

    return (
      <div>
        <div className="fw-semibold text-dark">{formattedDate}</div>
        {timeStr && <small className="text-muted"><i className="bi bi-clock me-1"></i>{timeStr}</small>}
      </div>
    );
  };

  const formatServiceDetails = (app) => {
    const rawDesc = app.problemDescription || app.description || app.serviceType || '';
    if (!rawDesc) return { serviceBadge: null, notesText: 'N/A' };

    const typeMatch = rawDesc.match(/\[Type:\s*([^\]]+)\]\s*(.*)/i);
    if (typeMatch) {
      const rawType = typeMatch[1].trim();
      const cleanNotes = typeMatch[2].trim() || 'N/A';

      let serviceLabel = rawType;
      let timeLabel = '';
      const atMatch = rawType.match(/(.*?)\s+at\s+(.*)/i);
      if (atMatch) {
        serviceLabel = atMatch[1];
        timeLabel = atMatch[2];
      }

      const readableType = serviceLabel
        .replace(/GENERAL_SERVICE/gi, 'General Service')
        .replace(/REPAIR/gi, 'Repair & Maintenance')
        .replace(/INSPECTION/gi, 'Inspection')
        .replace(/RSA/gi, 'RSA Emergency')
        .replace(/_/g, ' ');

      return {
        serviceBadge: (
          <div className="d-flex align-items-center gap-1">
            <Badge bg="primary" className="fw-semibold px-2 py-1">
              {readableType}
            </Badge>
            {timeLabel && (
              <Badge bg="info" text="dark" className="fw-normal">
                {timeLabel}
              </Badge>
            )}
          </div>
        ),
        notesText: cleanNotes
      };
    }

    return {
      serviceBadge: <Badge bg="secondary" className="px-2 py-1">General Service</Badge>,
      notesText: rawDesc
    };
  };

  if (loading) return <CardSkeleton count={4} />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Manager Control Center</h3>
          <p className="text-muted mb-0">Overview of workshop operations, approvals, and inventory alerts.</p>
        </div>
        <Button variant="primary" className="fw-semibold" onClick={() => navigate('/job-cards')}>
          <i className="bi bi-plus-lg me-2"></i>Create Job Card
        </Button>
      </div>

      {/* Summary Cards */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 cursor-pointer" onClick={() => navigate('/manager/approvals')}>
            <Card.Body className="d-flex align-items-center p-4">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning me-3">
                <i className="bi bi-clock-history fs-3"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1 small text-uppercase fw-semibold">Pending Approvals</h6>
                <h3 className="fw-bold mb-0">{metrics.pendingAppointments}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 cursor-pointer" onClick={() => navigate('/job-cards')}>
            <Card.Body className="d-flex align-items-center p-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary me-3">
                <i className="bi bi-wrench-adjustable fs-3"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1 small text-uppercase fw-semibold">Active Job Cards</h6>
                <h3 className="fw-bold mb-0">{metrics.activeJobCards}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 cursor-pointer" onClick={() => navigate('/inventory')}>
            <Card.Body className="d-flex align-items-center p-4">
              <div className="bg-danger bg-opacity-10 p-3 rounded-circle text-danger me-3">
                <i className="bi bi-exclamation-triangle fs-3"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1 small text-uppercase fw-semibold">Low Stock Alerts</h6>
                <h3 className="fw-bold mb-0">{metrics.lowStockCount}</h3>
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
                <h3 className="fw-bold mb-0">${metrics.revenue.toFixed(2)}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pending Appointments Section */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-transparent border-0 py-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">Pending Appointment Approvals</h5>
          <Button variant="link" size="sm" className="text-decoration-none fw-semibold" onClick={() => navigate('/manager/approvals')}>
            Manage All <i className="bi bi-arrow-right"></i>
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="ps-4 py-3">Customer & Vehicle</th>
                <th className="py-3">Requested Date</th>
                <th className="py-3">Service Type</th>
                <th className="py-3">Description</th>
                <th className="text-end pe-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">No pending approvals required.</td>
                </tr>
              ) : (
                pendingList.map((app) => {
                  const { serviceBadge, notesText } = formatServiceDetails(app);

                  return (
                    <tr key={app.id}>
                      <td className="ps-4 py-3">
                        {formatCustomerVehicle(app)}
                      </td>
                      <td className="py-3">
                        {formatDateTime(app)}
                      </td>
                      <td className="py-3">
                        {serviceBadge}
                      </td>
                      <td className="py-3" style={{ maxWidth: '250px' }}>
                        <div className="text-body small fw-medium text-wrap">{notesText}</div>
                      </td>
                      <td className="text-end pe-4 py-3">
                        <Button variant="success" size="sm" className="me-2 fw-semibold px-3" onClick={() => handleApprove(app.id)}>
                          Approve
                        </Button>
                        <Button variant="outline-danger" size="sm" className="fw-semibold px-3" onClick={() => navigate('/manager/approvals')}>
                          Reject...
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

export default ManagerDashboard;
