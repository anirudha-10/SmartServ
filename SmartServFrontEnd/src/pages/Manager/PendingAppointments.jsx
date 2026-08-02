import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { appointmentService } from '../../services/appointmentService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const PendingAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getPending();
      setAppointments(data || []);
    } catch (err) {
      toast.error('Failed to load pending appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      await appointmentService.approve(id);
      toast.success('Appointment approved successfully!');
      fetchPending();
    } catch (err) {
      toast.error('Failed to approve appointment');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }

    try {
      setSubmitting(true);
      await appointmentService.reject(selectedAppt.id, rejectionReason);
      toast.success('Appointment rejected.');
      setSelectedAppt(null);
      setRejectionReason('');
      fetchPending();
    } catch (err) {
      toast.error('Failed to reject appointment');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Pending Appointment Approvals</h3>
          <p className="text-muted mb-0">Review customer booking requests and approve or provide rejection details.</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="ps-4 py-3">Customer & Vehicle</th>
                <th className="py-3">Requested Date</th>
                <th className="py-3">Service Type</th>
                <th className="py-3">Description / Notes</th>
                <th className="text-end pe-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    No pending appointment requests.
                  </td>
                </tr>
              ) : (
                appointments.map((app) => {
                  const { serviceBadge, notesText } = formatServiceDetails(app);
                  const vehicleLabel = app.brand || app.make || app.vehicle?.brand || app.vehicle?.make || 'Vehicle';

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
                      <td className="py-3" style={{ maxWidth: '280px' }}>
                        <div className="text-body small fw-medium text-wrap">{notesText}</div>
                      </td>
                      <td className="text-end pe-4 py-3">
                        <Button variant="success" size="sm" className="me-2 fw-semibold px-3" onClick={() => handleApprove(app.id)}>
                          <i className="bi bi-check-lg me-1"></i>Approve
                        </Button>
                        <Button variant="outline-danger" size="sm" className="fw-semibold px-3" onClick={() => setSelectedAppt(app)}>
                          <i className="bi bi-x-lg me-1"></i>Reject
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

      {/* Reject Modal */}
      {selectedAppt && (
        <Modal show={true} onHide={() => setSelectedAppt(null)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold text-danger">Reject Appointment</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleRejectSubmit}>
            <Modal.Body>
              <p className="small text-muted mb-3">
                Rejecting booking #{selectedAppt.id} for <strong>{selectedAppt.customerName || 'Customer'}</strong> ({selectedAppt.brand || selectedAppt.vehicle?.make} {selectedAppt.model || selectedAppt.vehicle?.model}).
              </p>
              <Form.Group>
                <Form.Label className="fw-semibold">Reason for Rejection</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Slot unavailable, missing vehicle info, workshop overbooked..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="light" className="border" onClick={() => setSelectedAppt(null)}>
                Cancel
              </Button>
              <Button variant="danger" type="submit" disabled={submitting}>
                {submitting ? <Spinner size="sm" animation="border" /> : 'Confirm Rejection'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default PendingAppointments;
