import React, { useState } from 'react';
import { Row, Col, Card, Badge, Modal, Button } from 'react-bootstrap';

const EvidenceGallery = () => {
  const [selectedImg, setSelectedImg] = useState(null);

  const sampleEvidences = [
    {
      id: 1,
      stage: 'BEFORE',
      title: 'Initial Brake Inspection',
      url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
      description: 'Worn brake pads identified during initial intake.',
      date: '2026-08-01 10:30 AM'
    },
    {
      id: 2,
      stage: 'DURING',
      title: 'Oil Filter Replacement',
      url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
      description: 'Draining old engine oil and replacing oil filter element.',
      date: '2026-08-01 11:45 AM'
    },
    {
      id: 3,
      stage: 'AFTER',
      title: 'New Ceramic Brake Pads Installed',
      url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80',
      description: 'New ceramic brake pads installed and tested cleanly.',
      date: '2026-08-01 02:15 PM'
    }
  ];

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'BEFORE': return 'warning';
      case 'DURING': return 'info';
      case 'AFTER': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div>
      <Row className="g-4">
        {sampleEvidences.map((item) => (
          <Col key={item.id} xs={12} sm={6} md={4}>
            <Card className="border-0 shadow-sm h-100 overflow-hidden">
              <div 
                className="position-relative overflow-hidden cursor-pointer" 
                style={{ height: '200px' }}
                onClick={() => setSelectedImg(item)}
              >
                <img 
                  src={item.url} 
                  alt={item.title} 
                  className="w-100 h-100 object-fit-cover transition-all"
                  style={{ transition: 'transform 0.3s ease' }}
                />
                <Badge bg={getStageBadge(item.stage)} className="position-absolute top-0 start-0 m-3 px-3 py-2 fs-7">
                  {item.stage} SERVICE
                </Badge>
              </div>
              <Card.Body className="p-3">
                <h6 className="fw-bold mb-1">{item.title}</h6>
                <p className="text-muted small mb-2">{item.description}</p>
                <small className="text-muted d-block text-end">
                  <i className="bi bi-clock me-1"></i>{item.date}
                </small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Image Preview Modal */}
      {selectedImg && (
        <Modal show={true} onHide={() => setSelectedImg(null)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold">{selectedImg.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center p-0">
            <img src={selectedImg.url} alt={selectedImg.title} className="img-fluid w-100" />
            <div className="p-3 bg-light text-start">
              <Badge bg={getStageBadge(selectedImg.stage)} className="mb-2 px-3 py-1">
                {selectedImg.stage} SERVICE
              </Badge>
              <p className="mb-1">{selectedImg.description}</p>
              <small className="text-muted"><i className="bi bi-clock me-1"></i>Uploaded: {selectedImg.date}</small>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default EvidenceGallery;
