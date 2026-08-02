import React, { useEffect, useState } from 'react';
import { Button, Table, Spinner, Card, Badge } from 'react-bootstrap';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let data = [];
      if (role === 'CUSTOMER' && user?.id) {
        data = await appointmentService.getByCustomerId(user.id);
      } else {
        data = await appointmentService.getAll();
      }
      setAppointments(data || []);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, role]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await appointmentService.updateStatus(id, newStatus);
      toast.success(`Appointment marked as ${newStatus}`);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'danger';
      case 'CANCELLED': return 'secondary';
      case 'COMPLETED': return 'info';
      default: return 'primary';
    }
  };

  const formatDateTime = (appointment) => {
    const rawDate = appointment.scheduledDate || appointment.requestDate;
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

    let timeStr = appointment.scheduledTime || '';
    if (!timeStr && appointment.problemDescription) {
      const timeMatch = appointment.problemDescription.match(/at\s+(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i);
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

  const formatVehicleInfo = (appointment) => {
    const rawBrand = appointment.brand || appointment.make || appointment.vehicle?.brand || appointment.vehicle?.make || '';
    const rawModel = appointment.model || appointment.vehicle?.model || '';
    const rawPlate = appointment.licensePlate || appointment.vehicle?.licensePlate || '';

    const fullTitle = `${rawBrand} ${rawModel}`.trim();
    const capitalizedTitle = fullTitle 
      ? fullTitle.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) 
      : 'Vehicle';

    return (
      <div>
        <div className="fw-bold text-primary">{capitalizedTitle}</div>
        {rawPlate && (
          <span className="badge bg-light text-secondary border font-monospace mt-1 px-2 py-1">
            {rawPlate.toUpperCase()}
          </span>
        )}
      </div>
    );
  };

  const formatServiceDetails = (appointment) => {
    const rawDesc = appointment.problemDescription || appointment.description || appointment.serviceType || '';
    if (!rawDesc) return <span className="text-muted">N/A</span>;

    const typeMatch = rawDesc.match(/\[Type:\s*([^\]]+)\]\s*(.*)/i);
    if (typeMatch) {
      const rawType = typeMatch[1].trim();
      const cleanNotes = typeMatch[2].trim();

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

      return (
        <div>
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <Badge bg="primary" className="fw-semibold px-2 py-1">
              {readableType}
            </Badge>
            {timeLabel && (
              <Badge bg="info" text="dark" className="fw-normal">
                <i className="bi bi-clock me-1"></i>{timeLabel}
              </Badge>
            )}
          </div>
          {cleanNotes && <div className="text-body small">{cleanNotes}</div>}
        </div>
      );
    }

    return <div className="text-body small fw-medium">{rawDesc}</div>;
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
          <h3 className="fw-bold mb-1">{role === 'CUSTOMER' ? 'My Appointments' : 'Appointments Overview'}</h3>
          <p className="text-muted mb-0">
            {role === 'CUSTOMER' ? 'View and track your requested service bookings.' : 'Manage customer appointment bookings.'}
          </p>
        </div>
        {role === 'CUSTOMER' && (
          <Button variant="primary" onClick={() => navigate('/appointments/new')}>
            <i className="bi bi-plus-lg me-2"></i>Book Appointment
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="py-3 ps-4">Date & Time</th>
                <th className="py-3">Vehicle</th>
                <th className="py-3">Service Type / Notes</th>
                <th className="py-3">Status</th>
                {(role === 'MANAGER' || role === 'ADMIN') && (
                  <th className="py-3 text-end pe-4">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={(role === 'MANAGER' || role === 'ADMIN') ? 5 : 4} className="text-center py-4 text-muted">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="ps-4">
                      {formatDateTime(appointment)}
                    </td>
                    <td>
                      {formatVehicleInfo(appointment)}
                    </td>
                    <td>
                      {formatServiceDetails(appointment)}
                    </td>
                    <td>
                      <Badge bg={getStatusBadge(appointment.status)} className="px-2 py-1">
                        {appointment.status || 'PENDING'}
                      </Badge>
                    </td>
                    {(role === 'MANAGER' || role === 'ADMIN') && (
                      <td className="text-end pe-4">
                        {appointment.status === 'PENDING' && (
                          <div className="btn-group">
                            <Button size="sm" variant="success" onClick={() => handleStatusUpdate(appointment.id, 'APPROVED')}>
                              Approve
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleStatusUpdate(appointment.id, 'REJECTED')}>
                              Reject
                            </Button>
                          </div>
                        )}
                        {appointment.status === 'APPROVED' && (
                          <Button size="sm" variant="outline-primary" onClick={() => navigate(`/job-cards?appointmentId=${appointment.id}`)}>
                            Create Job Card
                          </Button>
                        )}
                      </td>
                    )}
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

export default AppointmentList;
