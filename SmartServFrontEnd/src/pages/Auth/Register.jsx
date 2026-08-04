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
}).required();

const Register = () => {
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setRegisterError('');
    try {
      const payload = {
        userName: data.username,
        name: data.username,
        email: data.email.trim().toLowerCase(),
        password: data.password,
        userRole: 'CUSTOMER',
        role: 'CUSTOMER',
        mobile: data.contactNo,
        phone: data.contactNo,
        salary: 10.0,
        managerId: null,
        active: true
      };

      const response = await api.post('/auth/register', payload);
      
      const responseData = response.data;
      const successMsg = responseData.userName ? 
        `Welcome ${responseData.userName}! Registration successful.` : 
        `Registration successful! Please log in.`;
        
      toast.success(successMsg);
      navigate(`/login`);
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
        <p className="text-muted small">Register as a new Customer</p>
      </div>

      <Form onSubmit={handleSubmit(onSubmit)}>
        {registerError && <Alert variant="danger" className="py-2 small">{registerError}</Alert>}

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

        <Button variant="primary" type="submit" className="w-100 py-2 fw-bold mb-3" disabled={isSubmitting}>
          {isSubmitting ? (
            <><Spinner as="span" animation="border" size="sm" className="me-2" /> Registering...</>
          ) : `Register`}
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
