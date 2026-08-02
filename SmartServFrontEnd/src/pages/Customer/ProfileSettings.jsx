import React from 'react';
import { Card, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const ProfileSettings = () => {
  const { user, role } = useAuth();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      userName: user?.userName || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
    }
  });

  const onSubmit = (data) => {
    toast.success('Profile updated successfully!');
  };

  return (
    <div>
      <h3 className="fw-bold mb-4">Profile & Account Settings</h3>

      <Row className="g-4">
        <Col lg={4}>
          <Card className="border-0 shadow-sm text-center p-4">
            <Card.Body>
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center display-4 mb-3 fw-bold" style={{ width: '100px', height: '100px' }}>
                {(user?.userName || 'U').charAt(0).toUpperCase()}
              </div>
              <h5 className="fw-bold mb-1">{user?.userName || 'SmartServ User'}</h5>
              <p className="text-muted mb-2">{user?.email}</p>
              <Badge bg="primary" className="px-3 py-2 fs-7">{role || 'CUSTOMER'}</Badge>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0">Personal Information</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Username</Form.Label>
                      <Form.Control type="text" {...register('userName')} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Email Address</Form.Label>
                      <Form.Control type="email" {...register('email')} disabled />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Mobile Number</Form.Label>
                      <Form.Control type="text" {...register('mobile')} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Account Role</Form.Label>
                      <Form.Control type="text" value={role} disabled />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end mt-4">
                  <Button variant="primary" type="submit" className="fw-bold px-4">
                    Save Changes
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfileSettings;
