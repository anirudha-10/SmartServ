import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form, Button, Card, Row, Col, Spinner } from 'react-bootstrap';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';

const schema = yup.object({
  userName: yup.string().required('Username is required'),
  email: yup.string().email('Valid email is required').required('Email is required'),
  mobile: yup.string().required('Contact number is required'),
  userRole: yup.string().required('Role is required'),
  password: yup.string().when('$isEditMode', {
    is: false,
    then: () => yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
    otherwise: () => yup.string().notRequired()
  })
});

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    context: { isEditMode }
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchUser = async () => {
        try {
          const data = await userService.getById(id);
          setValue('userName', data.userName);
          setValue('email', data.email);
          setValue('mobile', data.mobile || '');
          setValue('userRole', data.userRole);
        } catch (error) {
          toast.error('Failed to load user details');
          navigate('/users');
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [id, isEditMode, setValue, navigate]);

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        if (!data.password) delete data.password;
        await userService.update(id, data);
        toast.success('User updated successfully');
      } else {
        await userService.create(data);
        toast.success('User created successfully');
      }
      navigate('/users');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user');
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
        <Button variant="link" className="text-decoration-none text-body-emphasis p-0 me-3" onClick={() => navigate('/users')}>
          <i className="bi bi-arrow-left fs-4"></i>
        </Button>
        <h3 className="fw-bold mb-0">{isEditMode ? 'Edit User' : 'Add New User'}</h3>
      </div>

      <Card className="border-0 shadow-sm" style={{ maxWidth: '800px' }}>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Username</Form.Label>
                  <Form.Control type="text" {...register('userName')} isInvalid={!!errors.userName} />
                  <Form.Control.Feedback type="invalid">{errors.userName?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" {...register('email')} isInvalid={!!errors.email} />
                  <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Contact Number</Form.Label>
                  <Form.Control type="text" {...register('mobile')} isInvalid={!!errors.mobile} />
                  <Form.Control.Feedback type="invalid">{errors.mobile?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Role</Form.Label>
                  <Form.Select {...register('userRole')} isInvalid={!!errors.userRole} defaultValue="">
                    <option value="" disabled>-- Select a Role --</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                    <option value="MECHANIC">Mechanic</option>
                    <option value="CUSTOMER">Customer</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.userRole?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{isEditMode ? 'New Password (Optional)' : 'Password'}</Form.Label>
                  <Form.Control type="password" {...register('password')} isInvalid={!!errors.password} />
                  <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="light" className="me-2 border" onClick={() => navigate('/users')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Spinner as="span" animation="border" size="sm" className="me-2" /> Saving...</> : 'Save User'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserForm;
