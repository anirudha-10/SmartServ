import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, ProgressBar, Tab, Nav, Spinner, Form, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { vehicleService } from '../../services/vehicleService';
import { appointmentService } from '../../services/appointmentService';
import { invoiceService } from '../../services/invoiceService';
import EvidenceGallery from './EvidenceGallery';
import RazorpayModal from '../Invoices/RazorpayModal';

const ServiceTracker = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');

  const steps = [
    { title: 'Booked', icon: 'bi-calendar-event', desc: 'Appointment Requested' },
    { title: 'Approved', icon: 'bi-check-circle', desc: 'Manager Confirmed' },
    { title: 'Job Card', icon: 'bi-card-checklist', desc: 'Job Card Created' },
    { title: 'Mechanic Assigned', icon: 'bi-person-badge', desc: 'Mechanic Assigned' },
    { title: 'In Progress', icon: 'bi-wrench-adjustable-circle', desc: 'Service Underway' },
    { title: 'Completed', icon: 'bi-flag-fill', desc: 'Service Finished' },
    { title: 'Invoice', icon: 'bi-receipt', desc: 'Invoice Billed' },
    { title: 'Payment', icon: 'bi-credit-card-2-front', desc: 'Paid & Delivered' },
  ];

  const fetchInvoices = async () => {
    if (!user?.id) return;
    const invList = await invoiceService.getByCustomer(user.id);
    setInvoices(invList || []);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const [userVehicles, userAppts, userInvoices] = await Promise.all([
          vehicleService.getByCustomerId(user.id),
          appointmentService.getByCustomerId(user.id),
          invoiceService.getByCustomer(user.id)
        ]);

        const vList = userVehicles || [];
        const aList = userAppts || [];

        setVehicles(vList);
        setAllAppointments(aList);
        setInvoices(userInvoices || []);

        const query = new URLSearchParams(location.search);
        const qVehicleId = query.get('vehicleId');
        const qApptId = query.get('appointmentId');

        if (qApptId && aList.some(a => String(a.id) === String(qApptId))) {
          const matchingAppt = aList.find(a => String(a.id) === String(qApptId));
          if (matchingAppt) {
            const vId = matchingAppt.vehicleId || matchingAppt.vehicle?.id || matchingAppt.vehicle?.vehicleId;
            if (vId) setSelectedVehicleId(String(vId));
            setSelectedAppointmentId(String(matchingAppt.id));
          }
        } else if (qVehicleId && vList.some(v => String(v.vehicleId || v.id) === String(qVehicleId))) {
          setSelectedVehicleId(String(qVehicleId));
        } else if (vList.length > 0) {
          setSelectedVehicleId(String(vList[0].vehicleId || vList[0].id));
        }
      } catch (err) {
        console.error('ServiceTracker fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, location.search]);

  // Appointments for currently selected vehicle
  const vehicleAppointments = allAppointments.filter(a => {
    const vId = a.vehicleId || a.vehicle?.id || a.vehicle?.vehicleId;
    return String(vId) === String(selectedVehicleId);
  });

  // Active appointment object
  const activeAppt = vehicleAppointments.find(a => String(a.id) === String(selectedAppointmentId)) 
    || vehicleAppointments[0] 
    || null;

  // Find matching invoice if any
  const currentInvoice = invoices.find(inv => inv.jobCardId === activeAppt?.jobCardId || inv.jobCard?.id === activeAppt?.jobCardId);

  // Selected vehicle object
  const currentVehicle = vehicles.find(v => String(v.vehicleId || v.id) === String(selectedVehicleId)) 
    || (activeAppt ? { brand: activeAppt.brand || activeAppt.make, model: activeAppt.model, licensePlate: activeAppt.licensePlate } : null);

  // Compute step index
  let activeStep = 0;
  if (activeAppt) {
    if (currentInvoice?.paymentStatus === 'PAID') activeStep = 7;
    else if (currentInvoice) activeStep = 6;
    else if (activeAppt.status === 'COMPLETED') activeStep = 5;
    else if (activeAppt.status === 'IN_PROGRESS') activeStep = 4;
    else if (activeAppt.status === 'APPROVED') activeStep = 1;
    else activeStep = 0;
  }

  const handleVehicleChange = (vId) => {
    setSelectedVehicleId(vId);
    const appts = allAppointments.filter(a => String(a.vehicleId || a.vehicle?.id || a.vehicle?.vehicleId) === String(vId));
    if (appts.length > 0) {
      setSelectedAppointmentId(String(appts[0].id));
    } else {
      setSelectedAppointmentId('');
    }
  };

  const formatTitle = (brand, model) => {
    const full = `${brand || ''} ${model || ''}`.trim();
    if (!full) return 'Vehicle';
    return full.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
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
      {/* Header Banner */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-1">Live Service Tracker</h3>
          <p className="text-muted mb-0">Select any of your vehicles to track real-time service lifecycle progress.</p>
        </div>
        <Button variant="outline-primary" size="sm" onClick={() => navigate('/appointments/new')}>
          <i className="bi bi-calendar-plus me-2"></i>Book New Service
        </Button>
      </div>

      {/* Vehicle Selection Selector Card */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3 bg-light rounded">
          <Row className="g-3 align-items-center">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold small text-uppercase text-muted mb-1">
                  <i className="bi bi-car-front me-2 text-primary"></i>Select Your Vehicle ({vehicles.length})
                </Form.Label>
                <Form.Select 
                  value={selectedVehicleId} 
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  className="fw-semibold border-primary border-opacity-25"
                >
                  {vehicles.length === 0 ? (
                    <option value="">No vehicles registered</option>
                  ) : (
                    vehicles.map((v) => {
                      const vId = String(v.vehicleId || v.id);
                      const vApptCount = allAppointments.filter(a => String(a.vehicleId || a.vehicle?.id || a.vehicle?.vehicleId) === vId).length;
                      return (
                        <option key={vId} value={vId}>
                          {formatTitle(v.brand || v.make, v.model)} ({v.licensePlate || 'No Plate'}) — {vApptCount} Booking{vApptCount === 1 ? '' : 's'}
                        </option>
                      );
                    })
                  )}
                </Form.Select>
              </Form.Group>
            </Col>

            {vehicleAppointments.length > 1 && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-uppercase text-muted mb-1">
                    <i className="bi bi-clock-history me-2 text-primary"></i>Select Service Booking ({vehicleAppointments.length})
                  </Form.Label>
                  <Form.Select 
                    value={selectedAppointmentId || (activeAppt ? String(activeAppt.id) : '')} 
                    onChange={(e) => setSelectedAppointmentId(e.target.value)}
                    className="fw-semibold"
                  >
                    {vehicleAppointments.map((a) => (
                      <option key={a.id} value={String(a.id)}>
                        Booking #{a.id} ({new Date(a.scheduledDate || a.requestDate).toLocaleDateString()}) — {a.status}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      {!activeAppt ? (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle d-inline-block mb-3">
              <i className="bi bi-wrench fs-1"></i>
            </div>
            <h5 className="fw-bold mb-2">No Service Bookings Found for this Vehicle</h5>
            <p className="text-muted max-w-md mx-auto mb-4">
              {currentVehicle 
                ? `You haven't requested any service appointments for ${formatTitle(currentVehicle.brand || currentVehicle.make, currentVehicle.model)} (${currentVehicle.licensePlate}) yet.`
                : 'No registered vehicle selected.'}
            </p>
            <Button variant="primary" onClick={() => navigate('/appointments/new')}>
              <i className="bi bi-plus-lg me-2"></i>Book Service Appointment Now
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Active Vehicle & Status Overview Banner */}
          <Card className="border-0 shadow-sm mb-4 bg-primary text-white">
            <Card.Body className="p-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <span className="badge bg-light text-primary fw-bold text-uppercase px-3 py-1 mb-2">
                  <i className="bi bi-shield-check me-1"></i>Tracking Vehicle
                </span>
                <h4 className="fw-bold mb-1">
                  {formatTitle(currentVehicle?.brand || currentVehicle?.make, currentVehicle?.model)}
                </h4>
                <p className="mb-0 text-white-50 small font-monospace">
                  License Plate: {currentVehicle?.licensePlate?.toUpperCase() || 'N/A'} • Booking #{activeAppt.id}
                </p>
              </div>
              <div className="text-md-end d-flex flex-column align-items-md-end gap-2">
                <div>
                  <div className="small text-white-50 text-uppercase fw-semibold mb-1">Service Status</div>
                  <Badge bg={activeAppt.status === 'APPROVED' ? 'success' : activeAppt.status === 'IN_PROGRESS' ? 'info' : 'warning'} className="px-3 py-2 fs-6">
                    {activeAppt.status || 'PENDING'}
                  </Badge>
                </div>
                {currentInvoice && currentInvoice.paymentStatus !== 'PAID' && (
                  <Button 
                    variant="warning" 
                    size="sm" 
                    className="fw-bold text-dark border-0 shadow-sm"
                    onClick={() => { setSelectedInvoice(currentInvoice); setShowPayModal(true); }}
                  >
                    <i className="bi bi-credit-card-2-front me-1"></i> Pay Invoice (₹{parseFloat(currentInvoice.totalAmount || 0).toFixed(2)})
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Lifecycle Stepper */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-3">Service Lifecycle Stepper</h6>
              <ProgressBar 
                now={((activeStep + 1) / steps.length) * 100} 
                variant="primary" 
                animated 
                className="mb-4"
                style={{ height: '10px' }}
              />

              <Row className="g-3 text-center">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= activeStep;
                  const isCurrent = idx === activeStep;

                  return (
                    <Col key={step.title} xs={6} sm={3} className="col-lg">
                      <div 
                        className={`p-3 rounded transition-all ${
                          isCurrent 
                            ? 'bg-primary text-white shadow' 
                            : isCompleted 
                            ? 'bg-primary bg-opacity-10 text-primary' 
                            : 'bg-light text-muted'
                        }`}
                      >
                        <i className={`bi ${step.icon} fs-3 mb-2 d-block`}></i>
                        <div className="fw-bold small">{step.title}</div>
                        <div className="small opacity-75" style={{ fontSize: '0.75rem' }}>{step.desc}</div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>

          {/* Details & Image Evidence Tabs */}
          <Tab.Container defaultActiveKey="evidence">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0 pt-3 px-4">
                <Nav variant="tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="evidence" className="fw-semibold">
                      <i className="bi bi-images me-2"></i>Service Image Evidence (Before / After)
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="details" className="fw-semibold">
                      <i className="bi bi-file-earmark-text me-2"></i>Job Card Breakdown
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
              <Card.Body className="p-4">
                <Tab.Content>
                  <Tab.Pane eventKey="evidence">
                    <EvidenceGallery />
                  </Tab.Pane>

                  <Tab.Pane eventKey="details">
                    <Row className="g-3">
                      <Col md={6}>
                        <h6 className="fw-bold text-primary">Service Summary</h6>
                        <ul className="list-group list-group-flush">
                          <li className="list-group-item d-flex justify-content-between px-0">
                            <span className="text-muted">Appointment ID:</span>
                            <span className="fw-bold">#{activeAppt.id}</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between px-0">
                            <span className="text-muted">Vehicle Registered:</span>
                            <span className="fw-bold">{formatTitle(currentVehicle?.brand || currentVehicle?.make, currentVehicle?.model)}</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between px-0">
                            <span className="text-muted">License Plate:</span>
                            <span className="fw-bold font-monospace">{currentVehicle?.licensePlate || 'N/A'}</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between px-0">
                            <span className="text-muted">Status:</span>
                            <span className="fw-bold">{activeAppt.status || 'PENDING'}</span>
                          </li>
                        </ul>
                      </Col>
                      <Col md={6}>
                        <h6 className="fw-bold text-primary">Service Description / Problem Notes</h6>
                        <p className="text-muted bg-light p-3 rounded">
                          {activeAppt.problemDescription || activeAppt.description || 'No specific issue notes logged for this service booking.'}
                        </p>
                      </Col>
                    </Row>
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>
        </>
      )}

      {selectedInvoice && (
        <RazorpayModal
          invoice={selectedInvoice}
          show={showPayModal}
          onHide={() => setShowPayModal(false)}
          onSuccess={fetchInvoices}
        />
      )}
    </div>
  );
};

export default ServiceTracker;
