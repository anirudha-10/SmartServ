import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { jobCardService } from '../../services/jobCardService';
import { appointmentService } from '../../services/appointmentService';
import { userService } from '../../services/userService';
import { invoiceService } from '../../services/invoiceService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useSearchParams, useNavigate } from 'react-router-dom';

const JobCardManager = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedApptId = searchParams.get('appointmentId');

  const [jobCards, setJobCards] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [approvedAppts, setApprovedAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(Boolean(preselectedApptId));
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedJobCard, setSelectedJobCard] = useState(null);

  // Form Data
  const [selectedApptId, setSelectedApptId] = useState(preselectedApptId || '');
  const [selectedMechanicId, setSelectedMechanicId] = useState('');
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    setEstimatedCompletionDate(future.toISOString().split('T')[0]);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const currentManagerId = user?.userId || user?.id;

      let managerMechanics = [];
      if (currentManagerId) {
        managerMechanics = await userService.getMechanicsUnderManager(currentManagerId).catch(() => []);
      }

      if (!managerMechanics || managerMechanics.length === 0) {
        const allUsers = await userService.getAll().catch(() => []);
        const allMechanics = allUsers.filter(u => u.userRole === 'MECHANIC' || u.role === 'MECHANIC');
        if (currentManagerId) {
          managerMechanics = allMechanics.filter(m => 
            String(m.managerId || m.manager?.id || m.manager?.userId) === String(currentManagerId)
          );
        }
        if (!managerMechanics || managerMechanics.length === 0) {
          managerMechanics = allMechanics;
        }
      }

      const [cardsData, apptsData] = await Promise.all([
        jobCardService.getAll().catch(() => []),
        appointmentService.getAll().catch(() => []),
      ]);

      setJobCards(cardsData || []);
      setMechanics(managerMechanics || []);
      setApprovedAppts((apptsData || []).filter(a => a.status === 'APPROVED'));
    } catch (err) {
      toast.error('Failed to load job cards data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCreateJobCard = async (e) => {
    e.preventDefault();
    if (!selectedApptId) {
      toast.error('Please select an approved appointment.');
      return;
    }

    if (!selectedMechanicId) {
      toast.error('Please select a mechanic for this job card.');
      return;
    }

    const currentManagerId = user?.userId || user?.id;
    if (!currentManagerId) {
      toast.error('Manager session error. Please log in again.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        appointmentId: Number(selectedApptId),
        managerId: Number(currentManagerId),
        mechanicId: Number(selectedMechanicId),
        estimatedCompletionDate: estimatedCompletionDate || null
      };

      await jobCardService.create(payload);

      toast.success('Job Card Created Successfully!');
      setShowCreateModal(false);
      setSelectedApptId('');
      setSelectedMechanicId('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create job card');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignMechanic = async (e) => {
    e.preventDefault();
    if (!selectedMechanicId) {
      toast.error('Please select a mechanic');
      return;
    }

    try {
      setSubmitting(true);
      await jobCardService.assignMechanic(selectedJobCard.id, Number(selectedMechanicId));
      toast.success('Mechanic Assigned Successfully!');
      setShowAssignModal(false);
      setSelectedJobCard(null);
      setSelectedMechanicId('');
      fetchData();
    } catch (err) {
      toast.error('Failed to assign mechanic');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateInvoice = async (jobCardId) => {
    try {
      await invoiceService.generate(jobCardId);
      toast.success('Invoice Generated Successfully!');
      navigate('/invoices');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate invoice');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CREATED': return 'secondary';
      case 'ASSIGNED': return 'info';
      case 'IN_PROGRESS': return 'primary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'danger';
      default: return 'dark';
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Job Card Management</h3>
          <p className="text-muted mb-0">Create job cards from approved appointments and assign service mechanics.</p>
        </div>
        <Button variant="primary" className="fw-semibold" onClick={() => setShowCreateModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>Create Job Card
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="ps-4 py-3">Job Card #</th>
                <th className="py-3">Customer & Vehicle</th>
                <th className="py-3">Problem Description</th>
                <th className="py-3">Assigned Mechanic</th>
                <th className="py-3">Est. Completion</th>
                <th className="py-3">Status</th>
                <th className="text-end pe-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobCards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    No job cards found.
                  </td>
                </tr>
              ) : (
                jobCards.map((jc) => {
                  const custName = jc.customerName || jc.appointment?.customerName || 'Customer';
                  const brandName = jc.brand || jc.appointment?.vehicle?.brand || jc.appointment?.vehicle?.make || '';
                  const modelName = jc.model || jc.appointment?.vehicle?.model || '';
                  const plateNo = jc.licensePlate || jc.appointment?.vehicle?.licensePlate || '';
                  const mechName = jc.mechanicName || jc.mechanic?.userName || jc.mechanic?.name;

                  return (
                    <tr key={jc.id}>
                      <td className="ps-4 fw-bold text-primary">#JC-{jc.id}</td>
                      <td>
                        <div className="fw-bold text-dark">{custName}</div>
                        <div className="text-primary small fw-semibold">{formatTitle(brandName, modelName)}</div>
                        {plateNo && (
                          <span className="badge bg-light text-secondary border font-monospace mt-1 px-2 py-1">
                            {plateNo.toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="text-body small fw-medium text-wrap" style={{ maxWidth: '220px' }}>
                          {jc.problemDescription || 'N/A'}
                        </div>
                      </td>
                      <td>
                        {mechName ? (
                          <span className="fw-semibold text-dark">
                            <i className="bi bi-person-badge me-1"></i>{mechName}
                          </span>
                        ) : (
                          <span className="text-warning fw-semibold">
                            <i className="bi bi-exclamation-circle me-1"></i>Unassigned
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="fw-medium text-dark">{jc.estimatedCompletionDate || 'N/A'}</div>
                      </td>
                      <td>
                        <Badge bg={getStatusBadge(jc.status)} className="px-2 py-1">
                          {jc.status}
                        </Badge>
                      </td>
                      <td className="text-end pe-4">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2 fw-semibold" 
                          onClick={() => { setSelectedJobCard(jc); setShowAssignModal(true); }}
                        >
                          {mechName ? 'Reassign' : 'Assign'}
                        </Button>

                        {jc.status === 'COMPLETED' && (
                          <Button variant="success" size="sm" className="fw-semibold" onClick={() => handleGenerateInvoice(jc.id)}>
                            <i className="bi bi-receipt me-1"></i>Bill Invoice
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal: Create Job Card */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Create New Job Card</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateJobCard}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Approved Appointment</Form.Label>
              <Form.Select 
                value={selectedApptId} 
                onChange={(e) => setSelectedApptId(e.target.value)}
                required
              >
                <option value="" disabled>-- Select Approved Booking --</option>
                {approvedAppts.map((a) => {
                  const bName = a.brand || a.make || a.vehicle?.brand || a.vehicle?.make || '';
                  const mName = a.model || a.vehicle?.model || '';
                  return (
                    <option key={a.id} value={a.id}>
                      #{a.id} - {a.customerName || 'Customer'} ({formatTitle(bName, mName)})
                    </option>
                  );
                })}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Assign Mechanic <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select 
                value={selectedMechanicId} 
                onChange={(e) => setSelectedMechanicId(e.target.value)}
                required
              >
                <option value="" disabled>-- Select Mechanic --</option>
                {mechanics.map((m) => (
                  <option key={m.userId || m.id} value={m.userId || m.id}>
                    {m.userName || m.name} ({m.email})
                  </option>
                ))}
              </Form.Select>
              {mechanics.length === 0 && (
                <Form.Text className="text-danger">
                  No mechanics assigned under your account. Please create or assign mechanics first.
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Estimated Completion Date</Form.Label>
              <Form.Control 
                type="date"
                value={estimatedCompletionDate}
                onChange={(e) => setEstimatedCompletionDate(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" className="border" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? <Spinner size="sm" animation="border" /> : 'Create Job Card'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal: Assign / Reassign Mechanic */}
      {selectedJobCard && (
        <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold">Assign Mechanic for #JC-{selectedJobCard.id}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAssignMechanic}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Select Technician</Form.Label>
                <Form.Select 
                  value={selectedMechanicId} 
                  onChange={(e) => setSelectedMechanicId(e.target.value)}
                  required
                >
                  <option value="" disabled>-- Select Mechanic --</option>
                  {mechanics.map((m) => (
                    <option key={m.userId || m.id} value={m.userId || m.id}>
                      {m.userName || m.name} ({m.email})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="light" className="border" onClick={() => setShowAssignModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? <Spinner size="sm" animation="border" /> : 'Confirm Assignment'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default JobCardManager;
