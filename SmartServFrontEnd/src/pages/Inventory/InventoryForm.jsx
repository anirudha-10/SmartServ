import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form, Button, Card, Row, Col, Spinner } from 'react-bootstrap';
import { inventoryService } from '../../services/inventoryService';
import { toast } from 'react-toastify';

const schema = yup.object({
  sku: yup.string().required('SKU is required'),
  itemName: yup.string().required('Item Name is required'),
  quantityAvailable: yup.number().typeError('Must be a number').min(0).required('Quantity is required'),
  unitPrice: yup.number().typeError('Must be a number').positive('Price must be positive').required('Price is required')
}).required();

const InventoryForm = () => {
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
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchItem = async () => {
        try {
          const data = await inventoryService.getById(id);
          setValue('sku', data.skuCode || data.sku || '');
          setValue('itemName', data.itemName || '');
          setValue('quantityAvailable', data.stockQuantity ?? data.quantityAvailable ?? 0);
          setValue('unitPrice', data.currentPrice ?? data.unitPrice ?? 0);
        } catch (error) {
          toast.error('Failed to load item details');
          navigate('/inventory');
        } finally {
          setLoading(false);
        }
      };
      fetchItem();
    }
  }, [id, isEditMode, setValue, navigate]);

  const onSubmit = async (formData) => {
    try {
      const payload = {
        itemName: formData.itemName,
        skuCode: formData.sku,
        stockQuantity: Number(formData.quantityAvailable),
        currentPrice: Number(formData.unitPrice)
      };

      if (isEditMode) {
        await inventoryService.update(id, payload);
        toast.success('Item updated successfully');
      } else {
        await inventoryService.create(payload);
        toast.success('Item added successfully');
      }
      navigate('/inventory');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save item');
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
        <Button variant="link" className="text-decoration-none text-body-emphasis p-0 me-3" onClick={() => navigate('/inventory')}>
          <i className="bi bi-arrow-left fs-4"></i>
        </Button>
        <h3 className="fw-bold mb-0">{isEditMode ? 'Edit Item' : 'Add New Item'}</h3>
      </div>

      <Card className="border-0 shadow-sm" style={{ maxWidth: '800px' }}>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>SKU</Form.Label>
                  <Form.Control type="text" {...register('sku')} isInvalid={!!errors.sku} />
                  <Form.Control.Feedback type="invalid">{errors.sku?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Item Name</Form.Label>
                  <Form.Control type="text" {...register('itemName')} isInvalid={!!errors.itemName} />
                  <Form.Control.Feedback type="invalid">{errors.itemName?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Quantity Available</Form.Label>
                  <Form.Control type="number" {...register('quantityAvailable')} isInvalid={!!errors.quantityAvailable} />
                  <Form.Control.Feedback type="invalid">{errors.quantityAvailable?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Unit Price ($)</Form.Label>
                  <Form.Control type="number" step="0.01" {...register('unitPrice')} isInvalid={!!errors.unitPrice} />
                  <Form.Control.Feedback type="invalid">{errors.unitPrice?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="light" className="me-2 border" onClick={() => navigate('/inventory')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Spinner as="span" animation="border" size="sm" className="me-2" /> Saving...</> : 'Save Item'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default InventoryForm;
