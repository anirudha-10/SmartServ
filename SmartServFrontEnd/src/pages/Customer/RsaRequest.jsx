import React, { useEffect, useState } from 'react';
import { Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { vehicleService } from '../../services/vehicleService';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const schema = yup.object({
  vehicleId: yup.number().required('Please select your vehicle'),
  location: yup.string().required('Emergency location is required'),
  description: yup.string().required('Please describe the emergency breakdown issue'),
  contactPhone: yup.string().required('Contact phone number is required'),
}).required();

const RsaRequest = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [gettingLocation, setGettingLocation] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const isCustomer = role === 'CUSTOMER' || user?.role === 'CUSTOMER' || user?.userRole === 'CUSTOMER';
        const customerId = user?.id || user?.userId;
        let data = [];
        if (isCustomer && customerId) {
          data = await vehicleService.getByCustomerId(customerId);
        } else {
          data = await vehicleService.getAll();
        }
        setVehicles(data || []);
      } catch (err) {
        toast.error('Failed to load vehicles');
      }
    };
    if (user) {
      fetchVehicles();
    }
  }, [user, role]);

  const handleFetchCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          setValue('location', loc);
          toast.success('GPS Location acquired!');
          setGettingLocation(false);
        },
        (error) => {
          toast.error('Unable to fetch GPS location. Please enter manually.');
          setGettingLocation(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  const onSubmit = async (data) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      let coords = data.location;
      if (!coords.includes(',')) {
        coords = '18.5204, 73.8567';
      }

      await appointmentService.create({
        vehicleId: Number(data.vehicleId),
        requestDate: todayStr,
        description: `[RSA Location: ${data.location}] [Phone: ${data.contactPhone}] ${data.description}`,
        rsa: true,
        rsaCoordinates: coords,
      });

      toast.success('Roadside Assistance Request Dispatched! Help is on the way.');
      navigate('/customer');
    } catch (err) {
      console.error('RSA dispatch error:', err);
      toast.error(err?.response?.data?.message || err?.response?.data || 'Failed to dispatch RSA request.');
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center mb-4">
        <Button variant="link" className="text-decoration-none text-body p-0 me-3" onClick={() => navigate('/customer')}>
          <i className="bi bi-arrow-left fs-4"></i>
        </Button>
        <div>
          <h3 className="fw-bold mb-0 text-danger">
            <i className="bi bi-shield-exclamation me-2"></i>Roadside Assistance (RSA)
          </h3>
          <p className="text-muted mb-0">Emergency towing, battery jumpstart, flat tire, or breakdown service.</p>
        </div>
      </div>

      <Alert variant="danger" className="border-0 shadow-sm mb-4">
        <i className="bi bi-telephone-fill me-2 fs-5"></i>
        <strong>24/7 Hotline:</strong> 1800-SMART-SERV (1800-76278-7378) for immediate life safety emergencies.
      </Alert>

      <Card className="border-0 shadow-sm" style={{ maxWidth: '800px' }}>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Select Breakdown Vehicle</Form.Label>
                  <Form.Select {...register('vehicleId')} isInvalid={!!errors.vehicleId} defaultValue="">
                    <option value="" disabled>-- Select Vehicle --</option>
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
                  <Form.Label className="fw-semibold">Contact Phone Number</Form.Label>
                  <Form.Control type="text" placeholder="Your mobile phone" {...register('contactPhone')} isInvalid={!!errors.contactPhone} />
                  <Form.Control.Feedback type="invalid">{errors.contactPhone?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <Form.Label className="fw-semibold mb-0">Emergency Location</Form.Label>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={handleFetchCurrentLocation}
                      disabled={gettingLocation}
                    >
                      {gettingLocation ? <Spinner size="sm" animation="border" /> : <><i className="bi bi-geo-alt-fill me-1"></i>Use GPS Location</>}
                    </Button>
                  </div>
                  <Form.Control 
                    type="text" 
                    placeholder="Highway KM 45, Near Shell Petrol Station..." 
                    {...register('location')} 
                    isInvalid={!!errors.location} 
                  />
                  <Form.Control.Feedback type="invalid">{errors.location?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Describe the Issue</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={4} 
                    placeholder="Engine smoking, tire punctured, battery dead..." 
                    {...register('description')} 
                    isInvalid={!!errors.description} 
                  />
                  <Form.Control.Feedback type="invalid">{errors.description?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="light" className="me-2 border" onClick={() => navigate('/customer')}>
                Cancel
              </Button>
              <Button variant="danger" type="submit" className="fw-bold px-4" disabled={isSubmitting}>
                {isSubmitting ? <><Spinner size="sm" animation="border" className="me-2" /> Dispatching...</> : 'Dispatch RSA Tow Truck'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default RsaRequest;
