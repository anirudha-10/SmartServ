import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const schema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
}).required();

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setAuthError('');
    try {
      const result = await login(data.email, data.password);
      if (result && result.success === false) {
        throw new Error(result.message || 'Invalid email or password. Please try again.');
      }
      toast.success(`${result.role || 'User'} logged in successfully!`);
      navigate('/');
    } catch (err) {
      setAuthError(err.message || err.response?.data?.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <>
      <div className="text-center mb-4">
        <h5 className="fw-bold">Sign In to Your Account</h5>
      </div>

      <Form onSubmit={handleSubmit(onSubmit)}>
        {authError && <Alert variant="danger">{authError}</Alert>}
        
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Email Address</Form.Label>
          <Form.Control 
            type="email" 
            placeholder="Enter email"
            {...register('email')}
            isInvalid={!!errors.email}
          />
          <Form.Control.Feedback type="invalid">
            {errors.email?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-4" controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control 
            type="password" 
            placeholder="Enter password"
            {...register('password')}
            isInvalid={!!errors.password}
          />
          <Form.Control.Feedback type="invalid">
            {errors.password?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100 py-2 fw-bold mb-3" disabled={isSubmitting}>
          {isSubmitting ? (
            <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> Logging in...</>
          ) : `Login`}
        </Button>
      </Form>
      
      <div className="text-center mt-4 pt-2 border-top">
        <span className="text-muted">Don't have an account? </span>
        <Link 
          to="/register" 
          className="text-decoration-none fw-bold text-primary"
        >
          Register as Customer
        </Link>
      </div>
    </>
  );
};

export default Login;
