import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form, Button, Card, Row, Col, Spinner } from 'react-bootstrap';
import { vehicleService } from '../../services/vehicleService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const schema = yup.object({
  licensePlate: yup.string().required('License Plate is required'),
  brand: yup.string().required('Brand / Make is required'),
  model: yup.string().required('Model is required'),
  color: yup.string().required('Color is required')
}).required();

const VehicleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchVehicle = async () => {
        try {
          const data = await vehicleService.getById(id);
          setValue('licensePlate', data.licensePlate || '');
          setValue('brand', data.brand || data.make || '');
          setValue('model', data.model || '');
          setValue('color', data.color || '');
        } catch (error) {
          toast.error('Failed to load vehicle details');
          navigate('/vehicles');
        } finally {
          setLoading(false);
        }
      };
      fetchVehicle();
    }
  }, [id, isEditMode, setValue, navigate]);

  const onSubmit = async (data) => {
    try {
      let targetCustomerId = user?.userId || user?.id;

      // Robust fallback resolution for customer ID
      if (!targetCustomerId) {
        try {
          const customers = await userService.getCustomers();
          if (customers && customers.length > 0) {
            const match = customers.find(c =>
              (user?.email && c.email?.toLowerCase() === user.email.toLowerCase()) ||
              (user?.userName && c.userName?.toLowerCase() === user.userName.toLowerCase())
            );
            if (match) {
              targetCustomerId = match.userId || match.id;
            }
          }
        } catch (e) {
          console.warn('Customer list resolution warning:', e);
        }
      }

      if (!targetCustomerId) {
        toast.error('Unable to identify customer account. Please log in again.');
        return;
      }

      if (isEditMode) {
        const updatePayload = {
          brand: data.brand,
          model: data.model,
          color: data.color
        };
        await vehicleService.update(id, updatePayload);
        toast.success('Vehicle updated successfully!');
      } else {
        const createPayload = {
          licensePlate: data.licensePlate,
          brand: data.brand,
          model: data.model,
          color: data.color,
          customerId: Number(targetCustomerId)
        };
        await vehicleService.create(createPayload);
        toast.success('Vehicle registered successfully!');
      }
      navigate('/vehicles');
    } catch (error) {
      let msg = 'Failed to save vehicle';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          msg = error.response.data;
        } else if (error.response.data.message) {
          msg = error.response.data.message;
        } else if (typeof error.response.data === 'object') {
          const values = Object.values(error.response.data);
          if (values.length > 0) {
            msg = values.join(', ');
          }
        }
      }
      toast.error(msg);
    }
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
      <div className="d-flex align-items-center mb-4">
        <Button variant="link" className="text-decoration-none text-body p-0 me-3" onClick={() => navigate('/vehicles')}>
          <i className="bi bi-arrow-left fs-4"></i>
        </Button>
        <h3 className="fw-bold mb-0">{isEditMode ? 'Edit Vehicle' : 'Register New Vehicle'}</h3>
      </div>

      <Card className="border-0 shadow-sm" style={{ maxWidth: '800px' }}>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">License Plate</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. ABCfkfk"
                    disabled={isEditMode}
                    {...register('licensePlate')}
                    isInvalid={!!errors.licensePlate}
                  />
                  <Form.Control.Feedback type="invalid">{errors.licensePlate?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Brand / Make</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. TATA, Honda, Toyota"
                    {...register('brand')}
                    isInvalid={!!errors.brand}
                  />
                  <Form.Control.Feedback type="invalid">{errors.brand?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Model</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. SLVR, Civic, Harrier"
                    {...register('model')}
                    isInvalid={!!errors.model}
                  />
                  <Form.Control.Feedback type="invalid">{errors.model?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Vehicle Color</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Red, Black, Silver"
                    {...register('color')}
                    isInvalid={!!errors.color}
                  />
                  <Form.Control.Feedback type="invalid">{errors.color?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="light" className="me-2 border" onClick={() => navigate('/vehicles')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="fw-bold px-4" disabled={isSubmitting}>
                {isSubmitting ? <><Spinner as="span" animation="border" size="sm" className="me-2" /> Saving...</> : 'Save Vehicle'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default VehicleForm;
