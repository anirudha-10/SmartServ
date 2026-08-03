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
  const { user, role } = useAuth();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(true);
  const [customersList, setCustomersList] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const isAdminOrManager = role === 'ADMIN' || role === 'MANAGER' || user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.userRole === 'ADMIN' || user?.userRole === 'MANAGER';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        if (isAdminOrManager) {
          const allUsers = await userService.getAll();
          const customerUsers = (allUsers || []).filter(u => u.userRole === 'CUSTOMER' || u.role === 'CUSTOMER');
          const listToUse = customerUsers.length > 0 ? customerUsers : (allUsers || []);
          setCustomersList(listToUse);
          if (listToUse.length > 0) {
            setSelectedCustomerId(String(listToUse[0].userId || listToUse[0].id));
          }
        } else if (user) {
          setSelectedCustomerId(String(user.userId || user.id));
        }

        if (isEditMode) {
          const data = await vehicleService.getById(id);
          setValue('licensePlate', data.licensePlate || '');
          setValue('brand', data.brand || data.make || '');
          setValue('model', data.model || '');
          setValue('color', data.color || '');
          if (data.customerId) {
            setSelectedCustomerId(String(data.customerId));
          }
        }
      } catch (error) {
        console.warn('Vehicle form init error:', error);
        toast.error('Failed to load form details');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [id, isEditMode, isAdminOrManager, user, setValue]);

  const onSubmit = async (data) => {
    try {
      let targetCustomerId = selectedCustomerId || user?.userId || user?.id;

      if (!targetCustomerId) {
        toast.error('Please select a customer account to assign this vehicle.');
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
          licensePlate: data.licensePlate.trim().toUpperCase(),
          brand: data.brand.trim(),
          model: data.model.trim(),
          color: data.color.trim(),
          customerId: Number(targetCustomerId)
        };
        await vehicleService.create(createPayload);
        toast.success('Vehicle registered successfully!');
      }
      navigate('/vehicles');
    } catch (error) {
      console.error('Save vehicle error:', error);
      let msg = 'Failed to save vehicle';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          msg = error.response.data;
        } else if (error.response.data.message) {
          msg = error.response.data.message;
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
              {isAdminOrManager && !isEditMode && (
                <Col md={12}>
                  <Form.Group className="mb-2">
                    <Form.Label className="fw-semibold">Assign to Customer Account</Form.Label>
                    <Form.Select 
                      value={selectedCustomerId} 
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="fw-medium"
                      required
                    >
                      <option value="" disabled>-- Select Customer Owner --</option>
                      {customersList.map((c) => {
                        const cId = c.userId || c.id;
                        return (
                          <option key={cId} value={cId}>
                            {c.userName} ({c.email}) {c.userRole ? `— ${c.userRole}` : ''}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">License Plate</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. MH12AB1234"
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
                    placeholder="e.g. Tata, Honda, Toyota"
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
                    placeholder="e.g. Nexon, Civic, Fortuner"
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
                    placeholder="e.g. White, Black, Red"
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
