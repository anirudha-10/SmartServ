import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Badge, Table, Modal, Form, Spinner, Tab, Nav } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { jobCardService } from '../../services/jobCardService';
import { inventoryService } from '../../services/inventoryService';
import { toast } from 'react-toastify';

const MechanicDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [jobCards, setJobCards] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);

  // Modal States
  const [selectedJob, setSelectedJob] = useState(null);
  const [showPartModal, setShowPartModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  // Form inputs
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceStage, setEvidenceStage] = useState('BEFORE');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMechanicJobs = async () => {
    try {
      setLoading(true);
      const [jobsData, invData] = await Promise.all([
        jobCardService.getAll().catch(() => []),
        inventoryService.getAll().catch(() => []),
      ]);

      setJobCards(jobsData);
      setInventoryList(invData);
    } catch (err) {
      toast.error('Failed to load mechanic dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMechanicJobs();
  }, []);

  const handleStartJob = async (id) => {
    try {
      await jobCardService.startWork(id);
      toast.success('Job Started! Work status updated to IN_PROGRESS');
      fetchMechanicJobs();
    } catch (err) {
      toast.error('Failed to start job');
    }
  };

  const handleCompleteJob = async (id) => {
    try {
      await jobCardService.completeWork(id);
      toast.success('Job Completed! Job card marked COMPLETED');
      fetchMechanicJobs();
    } catch (err) {
      toast.error('Failed to mark job complete');
    }
  };

  const handleAddPart = async (e) => {
    e.preventDefault();
    if (!selectedPartId) {
      toast.error('Please select an inventory part.');
      return;
    }

    try {
      setSubmitting(true);
      await jobCardService.addItem(selectedJob.id, {
        inventoryId: Number(selectedPartId),
        quantityUsed: Number(partQty),
      });

      toast.success('Part added to Job Card!');
      setShowPartModal(false);
      setSelectedPartId('');
      setPartQty(1);
      fetchMechanicJobs();
    } catch (err) {
      toast.error('Failed to add part');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddEvidence = async (e) => {
    e.preventDefault();
    if (!evidenceUrl) {
      toast.error('Please enter an image URL.');
      return;
    }

    try {
      setSubmitting(true);
      await jobCardService.addEvidence(selectedJob.id, {
        imageUrl: evidenceUrl,
        stage: evidenceStage,
        description: evidenceDesc,
      });

      toast.success('Service Evidence Uploaded!');
      setShowEvidenceModal(false);
      setEvidenceUrl('');
      setEvidenceDesc('');
      fetchMechanicJobs();
    } catch (err) {
      toast.error('Failed to upload evidence');
    } finally {
      setSubmitting(false);
    }
  };

  const activeJobs = jobCards.filter(j => j.status === 'IN_PROGRESS' || j.status === 'ASSIGNED' || j.status === 'CREATED');
  const completedJobs = jobCards.filter(j => j.status === 'COMPLETED');

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
          <h3 className="fw-bold mb-1">Mechanic Workstation</h3>
          <p className="text-muted mb-0">Manage assigned service jobs, log inventory parts, and upload photos.</p>
        </div>
      </div>

      {/* Overview Stats */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={4}>
          <Card className="border-0 shadow-sm bg-primary text-white">
            <Card.Body className="p-4 d-flex align-items-center">
              <i className="bi bi-wrench fs-1 me-3 opacity-75"></i>
              <div>
                <h6 className="text-white-50 mb-0 small text-uppercase fw-semibold">Active Jobs</h6>
                <h2 className="fw-bold mb-0">{activeJobs.length}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={4}>
          <Card className="border-0 shadow-sm bg-success text-white">
            <Card.Body className="p-4 d-flex align-items-center">
              <i className="bi bi-check-circle fs-1 me-3 opacity-75"></i>
              <div>
                <h6 className="text-white-50 mb-0 small text-uppercase fw-semibold">Completed Jobs</h6>
                <h2 className="fw-bold mb-0">{completedJobs.length}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={4}>
          <Card className="border-0 shadow-sm bg-info text-white">
            <Card.Body className="p-4 d-flex align-items-center">
              <i className="bi bi-box-seam fs-1 me-3 opacity-75"></i>
              <div>
                <h6 className="text-white-50 mb-0 small text-uppercase fw-semibold">Parts Catalog</h6>
                <h2 className="fw-bold mb-0">{inventoryList.length}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs for Active vs Completed */}
      <Tab.Container defaultActiveKey="active">
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-transparent border-0 pt-3 px-4">
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="active" className="fw-semibold">
                  <i className="bi bi-gear-wide-connected me-2"></i>Active & Assigned Jobs ({activeJobs.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="completed" className="fw-semibold">
                  <i className="bi bi-check-all me-2"></i>Completed History ({completedJobs.length})
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body className="p-0">
            <Tab.Content>
              <Tab.Pane eventKey="active">
                <Table responsive hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Job #</th>
                      <th>Vehicle</th>
                      <th>Status</th>
                      <th>Remarks</th>
                      <th className="text-end pe-4">Workstation Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeJobs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-muted">No active jobs assigned currently.</td>
                      </tr>
                    ) : (
                      activeJobs.map((job) => (
                        <tr key={job.id}>
                          <td className="ps-4 align-middle fw-bold text-primary">#JC-{job.id}</td>
                          <td className="align-middle fw-medium">
                            {job.appointment?.vehicle?.make} {job.appointment?.vehicle?.model} <br/>
                            <small className="text-muted">{job.appointment?.vehicle?.licensePlate}</small>
                          </td>
                          <td className="align-middle">
                            <Badge bg={job.status === 'IN_PROGRESS' ? 'primary' : 'warning'} className="px-2 py-1">
                              {job.status}
                            </Badge>
                          </td>
                          <td className="align-middle text-truncate" style={{ maxWidth: '180px' }}>{job.remarks}</td>
                          <td className="text-end pe-4 align-middle">
                            {job.status !== 'IN_PROGRESS' ? (
                              <Button variant="primary" size="sm" className="me-2" onClick={() => handleStartJob(job.id)}>
                                <i className="bi bi-play-fill me-1"></i>Start Work
                              </Button>
                            ) : (
                              <>
                                <Button 
                                  variant="outline-info" 
                                  size="sm" 
                                  className="me-2" 
                                  onClick={() => { setSelectedJob(job); setShowPartModal(true); }}
                                >
                                  <i className="bi bi-plus-circle me-1"></i>Add Part
                                </Button>
                                <Button 
                                  variant="outline-secondary" 
                                  size="sm" 
                                  className="me-2" 
                                  onClick={() => { setSelectedJob(job); setShowEvidenceModal(true); }}
                                >
                                  <i className="bi bi-camera me-1"></i>Photo
                                </Button>
                                <Button variant="success" size="sm" onClick={() => handleCompleteJob(job.id)}>
                                  <i className="bi bi-check-circle me-1"></i>Finish
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </Tab.Pane>

              <Tab.Pane eventKey="completed">
                <Table responsive hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Job #</th>
                      <th>Vehicle</th>
                      <th>Status</th>
                      <th>Completed Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedJobs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted">No completed jobs yet.</td>
                      </tr>
                    ) : (
                      completedJobs.map((job) => (
                        <tr key={job.id}>
                          <td className="ps-4 align-middle fw-bold text-primary">#JC-{job.id}</td>
                          <td className="align-middle">{job.appointment?.vehicle?.make} {job.appointment?.vehicle?.model}</td>
                          <td className="align-middle"><Badge bg="success">COMPLETED</Badge></td>
                          <td className="align-middle">{job.remarks}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>

      {/* Modal: Add Inventory Part */}
      {selectedJob && (
        <Modal show={showPartModal} onHide={() => setShowPartModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold">Log Used Part for #JC-{selectedJob.id}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAddPart}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Select Inventory Item</Form.Label>
                <Form.Select 
                  value={selectedPartId} 
                  onChange={(e) => setSelectedPartId(e.target.value)}
                  required
                >
                  <option value="" disabled>-- Select Spare Part --</option>
                  {inventoryList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.itemName} (SKU: {item.sku}) - ${item.unitPrice} [Stock: {item.quantityAvailable}]
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Quantity Used</Form.Label>
                <Form.Control 
                  type="number" 
                  min="1" 
                  value={partQty} 
                  onChange={(e) => setPartQty(e.target.value)} 
                  required 
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="light" className="border" onClick={() => setShowPartModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? <Spinner size="sm" animation="border" /> : 'Log Part'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}

      {/* Modal: Upload Evidence Photo */}
      {selectedJob && (
        <Modal show={showEvidenceModal} onHide={() => setShowEvidenceModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold">Upload Service Evidence for #JC-{selectedJob.id}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAddEvidence}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Service Stage</Form.Label>
                <Form.Select 
                  value={evidenceStage} 
                  onChange={(e) => setEvidenceStage(e.target.value)}
                >
                  <option value="BEFORE">BEFORE SERVICE</option>
                  <option value="DURING">DURING SERVICE</option>
                  <option value="AFTER">AFTER SERVICE</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Image URL</Form.Label>
                <Form.Control 
                  type="url" 
                  placeholder="https://images.unsplash.com/..." 
                  value={evidenceUrl} 
                  onChange={(e) => setEvidenceUrl(e.target.value)} 
                  required 
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Description / Notes</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={2} 
                  placeholder="Inspection note, worn part photo..." 
                  value={evidenceDesc} 
                  onChange={(e) => setEvidenceDesc(e.target.value)} 
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="light" className="border" onClick={() => setShowEvidenceModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? <Spinner size="sm" animation="border" /> : 'Upload Evidence'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default MechanicDashboard;
