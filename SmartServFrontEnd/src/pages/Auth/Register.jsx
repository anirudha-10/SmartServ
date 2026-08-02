import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const schema = yup.object({
  username: yup.string().min(2, 'Username must be at least 2 characters').required('Username is required'),
  contactNo: yup.string().matches(/^\d{10}$/, 'Mobile number must be exactly 10 digits').required('Contact number is required'),
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, 'Must include 1 uppercase, 1 lowercase, 1 digit, and 1 special char')
    .required('Password is required'),
  userRole: yup.string().oneOf(['CUSTOMER', 'MANAGER', 'MECHANIC'], 'Please select a valid role').required('Role is required'),
  salary: yup.number().nullable().transform((v, o) => (o === '' ? null : v)),
  managerId: yup.number().nullable().transform((v, o) => (o === '' ? null : v)),
}).required();

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [registerError, setRegisterError] = useState('');
  const [managers, setManagers] = useState([]);

  const queryRole = new URLSearchParams(location.search).get('role');
  const initialRole = ['CUSTOMER', 'MANAGER', 'MECHANIC'].includes(queryRole?.toUpperCase()) 
    ? queryRole.toUpperCase() 
    : 'CUSTOMER';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      userRole: initialRole
    }
  });

  const selectedRole = watch('userRole');

  useEffect(() => {
    if (selectedRole === 'MECHANIC') {
      const fetchManagers = async () => {
        try {
          const res = await api.get('/users/managers');
          setManagers(res.data || []);
        } catch (e) {
          console.warn('Failed to load managers:', e);
        }
      };
      fetchManagers();
    }
  }, [selectedRole]);

  const onSubmit = async (data) => {
    setRegisterError('');
    try {
      const payload = {
        userName: data.username,
        name: data.username,
        email: data.email.trim().toLowerCase(),
        password: data.password,
        userRole: data.userRole,
        role: data.userRole,
        mobile: data.contactNo,
        phone: data.contactNo,
        salary: data.userRole === 'CUSTOMER' ? 10.0 : Number(data.salary || 50000),
        managerId: data.userRole === 'MECHANIC' && data.managerId ? Number(data.managerId) : null,
        active: true
      };

      const response = await api.post('/auth/register', payload);
      
      const responseData = response.data;
      const successMsg = responseData.userName ? 
        `Welcome ${responseData.userName}! ${data.userRole} registration successful.` : 
        `${data.userRole} registration successful! Please log in.`;
        
      toast.success(successMsg);
      navigate(`/login?role=${data.userRole}`);
    } catch (err) {
      let errorMessage = 'Failed to register. Please check inputs and try again.';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'object') {
          const values = Object.values(err.response.data);
          if (values.length > 0) {
            errorMessage = values.join(', ');
          }
        }
      }
      
      setRegisterError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <div className="text-center mb-3">
        <h5 className="fw-bold mb-1">Create an Account</h5>
        <p className="text-muted small">Register as Customer, Manager, or Mechanic</p>
      </div>

      <Form onSubmit={handleSubmit(onSubmit)}>
        {registerError && <Alert variant="danger" className="py-2 small">{registerError}</Alert>}
        
        {/* Account Role Selector */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Account Role</Form.Label>
          <Form.Select 
            {...register('userRole')} 
            isInvalid={!!errors.userRole}
            className="border-primary border-opacity-50"
          >
            <option value="CUSTOMER">Customer (Vehicle Owner)</option>
            <option value="MANAGER">Service Manager</option>
            <option value="MECHANIC">Service Mechanic</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.userRole?.message}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Username / Full Name</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter username"
            {...register('username')}
            isInvalid={!!errors.username}
          />
          <Form.Control.Feedback type="invalid">{errors.username?.message}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Contact Number (10 Digits)</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="e.g. 9876543210"
            {...register('contactNo')}
            isInvalid={!!errors.contactNo}
          />
          <Form.Control.Feedback type="invalid">{errors.contactNo?.message}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Email Address</Form.Label>
          <Form.Control 
            type="email" 
            placeholder="e.g. user@example.com"
            {...register('email')}
            isInvalid={!!errors.email}
          />
          <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Password</Form.Label>
          <Form.Control 
            type="password" 
            placeholder="Password (e.g. Smart@123)"
            {...register('password')}
            isInvalid={!!errors.password}
          />
          <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
            Min 8 chars with 1 uppercase, 1 lowercase, 1 digit & 1 special char.
          </Form.Text>
          <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
        </Form.Group>

        {/* Manager & Mechanic Extra Fields */}
        {(selectedRole === 'MANAGER' || selectedRole === 'MECHANIC') && (
          <Row className="g-2 mb-3 bg-light p-3 rounded">
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Monthly Salary (INR)</Form.Label>
                <Form.Control 
                  type="number" 
                  placeholder="e.g. 45000" 
                  {...register('salary')} 
                  isInvalid={!!errors.salary} 
                />
                <Form.Control.Feedback type="invalid">{errors.salary?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            {selectedRole === 'MECHANIC' && (
              <Col xs={12} className="mt-2">
                <Form.Group>
                  <Form.Label className="fw-semibold small">Assigned Manager (Optional)</Form.Label>
                  <Form.Select {...register('managerId')} isInvalid={!!errors.managerId}>
                    <option value="">-- Select Manager --</option>
                    {managers.map((m) => (
                      <option key={m.userId || m.id} value={m.userId || m.id}>
                        {m.userName} ({m.email})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.managerId?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}
          </Row>
        )}

        <Button variant="primary" type="submit" className="w-100 py-2 fw-bold mb-3" disabled={isSubmitting}>
          {isSubmitting ? (
            <><Spinner as="span" animation="border" size="sm" className="me-2" /> Registering...</>
          ) : `Register as ${selectedRole}`}
        </Button>
      </Form>

      <div className="text-center mt-2">
        <span className="text-muted">Already have an account? </span>
        <Link to="/login" className="text-decoration-none fw-bold">Login here</Link>
      </div>
    </>
  );
};

export default Register;
