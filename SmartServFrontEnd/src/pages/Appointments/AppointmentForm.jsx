import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form, Button, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { appointmentService } from '../../services/appointmentService';
import { vehicleService } from '../../services/vehicleService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const schema = yup.object({
  vehicleId: yup.number().typeError('Please select one of your registered vehicles').required('Please select a vehicle'),
  scheduledDate: yup.string().required('Appointment date is required'),
  scheduledTime: yup.string().required('Appointment time slot is required'),
  description: yup.string().required('Please provide a description'),
}).required();

const AppointmentForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const fetchCustomerVehicles = async () => {
      try {
        setLoadingVehicles(true);
        let data = [];
        if (user?.id) {
          data = await vehicleService.getByCustomerId(user.id);
        }
        setVehicles(data || []);
      } catch (error) {
        console.warn('Silent fetch customer vehicles warning:', error);
        setVehicles([]);
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchCustomerVehicles();
  }, [user]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        vehicleId: Number(data.vehicleId),
        requestDate: data.scheduledDate,
        scheduledTime: data.scheduledTime + ":00", // Append seconds for LocalTime parsing
        description: data.description,
        rsa: false
      };

      await appointmentService.create(payload);
      toast.success('Service Appointment requested successfully!');
      navigate('/appointments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment. Please check your inputs.');
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center mb-4">
        <Button variant="link" className="text-decoration-none text-body p-0 me-3" onClick={() => navigate('/appointments')}>
          <i className="bi bi-arrow-left fs-4"></i>
        </Button>
        <div>
          <h3 className="fw-bold mb-0">Book Service Appointment</h3>
          <p className="text-muted mb-0">Select your registered vehicle and preferred date for workshop maintenance.</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm" style={{ maxWidth: '800px' }}>
        <Card.Body className="p-4">
          {loadingVehicles ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading your vehicles...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <Alert variant="warning" className="border-0">
              <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
              <strong>No Vehicles Registered!</strong> You don't have any vehicles linked to your account yet. Please add a vehicle first before booking an appointment.
              <div className="mt-3">
                <Button variant="primary" size="sm" onClick={() => navigate('/vehicles/new')}>
                  <i className="bi bi-plus-lg me-1"></i>Add My Vehicle Now
                </Button>
              </div>
            </Alert>
          ) : (
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Select Your Vehicle</Form.Label>
                    <Form.Select {...register('vehicleId')} isInvalid={!!errors.vehicleId} defaultValue="">
                      <option value="" disabled>-- Select Your Registered Vehicle --</option>
                      {vehicles.map((v) => {
                        const vId = v.vehicleId || v.id;
                        return (
                          <option key={vId} value={vId}>
                            {v.brand || v.make} {v.model} ({v.licensePlate})
                          </option>
                        );
                      })}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.vehicleId?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                


                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Preferred Appointment Date</Form.Label>
                    <Form.Control type="date" {...register('scheduledDate')} isInvalid={!!errors.scheduledDate} />
                    <Form.Control.Feedback type="invalid">{errors.scheduledDate?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Preferred Time Slot</Form.Label>
                    <Form.Control type="time" {...register('scheduledTime')} isInvalid={!!errors.scheduledTime} />
                    <Form.Control.Feedback type="invalid">{errors.scheduledTime?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Problem / Maintenance Details</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={4} 
                      placeholder="Describe any issues, unusual noise, indicator lights, or specific requests..." 
                      {...register('description')} 
                      isInvalid={!!errors.description} 
                    />
                    <Form.Control.Feedback type="invalid">{errors.description?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end mt-4">
                <Button variant="light" className="me-2 border" onClick={() => navigate('/appointments')}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" className="fw-bold px-4" disabled={isSubmitting}>
                  {isSubmitting ? <><Spinner as="span" animation="border" size="sm" className="me-2" /> Booking Appointment...</> : 'Book Appointment'}
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AppointmentForm;
