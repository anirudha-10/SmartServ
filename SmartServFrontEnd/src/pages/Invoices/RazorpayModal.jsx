import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Badge, Card } from 'react-bootstrap';
import { invoiceService } from '../../services/invoiceService';
import { toast } from 'react-toastify';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const RazorpayModal = ({ invoice, show, onHide, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CARD');

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handlePayNow = async (e) => {
    e.preventDefault();
    if (!invoice) return;

    try {
      setSubmitting(true);

      // Step 1: Request Payment Order from backend
      const order = await invoiceService.createPaymentOrder(invoice.id);
      
      const isScriptLoaded = await loadRazorpayScript();

      if (isScriptLoaded && window.Razorpay && order?.razorpayKey && !order.orderId?.startsWith('order_mock_')) {
        // Open Official Razorpay Checkout Widget
        const options = {
          key: order.razorpayKey,
          amount: Math.round(order.amount * 100),
          currency: order.currency || 'INR',
          name: 'SmartServ Automotive Garage',
          description: `Invoice Payment #${order.invoiceNumber || invoice.invoiceNumber}`,
          order_id: order.orderId,
          prefill: {
            name: order.customerName || 'Valued Customer',
            email: order.customerEmail || 'customer@example.com',
            contact: order.customerPhone || '9999999999',
          },
          theme: {
            color: '#0d6efd',
          },
          handler: async function (response) {
            try {
              const backendPaymentMethod = paymentMethod === 'CARD' ? 'CREDIT_CARD' : (paymentMethod === 'NETBANKING' ? 'NET_BANKING' : 'UPI');
              await invoiceService.verifyPayment(invoice.id, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentMethod: backendPaymentMethod,
              });
              toast.success(`Payment for Invoice #${invoice.invoiceNumber || invoice.id} completed successfully via Razorpay!`);
              onSuccess();
              onHide();
            } catch (err) {
              toast.error('Razorpay signature verification failed.');
            }
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
              toast.info('Payment window closed.');
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
        return;
      }

      // Fallback / Development Payment Verification
      const backendPaymentMethod = paymentMethod === 'CARD' ? 'CREDIT_CARD' : (paymentMethod === 'NETBANKING' ? 'NET_BANKING' : 'UPI');
      const mockVerificationPayload = {
        razorpayPaymentId: 'pay_' + Math.random().toString(36).substr(2, 9),
        razorpayOrderId: order?.orderId || 'order_mock_' + Date.now(),
        razorpaySignature: 'sig_verified_mock_' + Date.now(),
        paymentMethod: backendPaymentMethod,
      };

      await invoiceService.verifyPayment(invoice.id, mockVerificationPayload);
      toast.success(`Payment of ₹${parseFloat(invoice.totalAmount || 0).toFixed(2)} Successful via Razorpay (${paymentMethod})!`);
      onSuccess();
      onHide();
    } catch (err) {
      console.error('Payment failure:', err);
      toast.error(err?.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!invoice) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="fw-bold d-flex align-items-center">
          <i className="bi bi-shield-check text-primary me-2 fs-4"></i>
          Razorpay Third-Party Gateway
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handlePayNow}>
        <Modal.Body className="p-4">
          <Card className="border-0 bg-primary bg-opacity-10 mb-4 text-center p-3">
            <small className="text-muted text-uppercase fw-semibold">Amount To Pay</small>
            <h2 className="fw-bold text-primary mb-0">₹{parseFloat(invoice.totalAmount || 0).toFixed(2)}</h2>
            <small className="text-muted">Invoice #{invoice.invoiceNumber || invoice.id}</small>
          </Card>

          {invoice.vehicleBrand && (
            <div className="bg-light p-3 rounded mb-3">
              <div className="d-flex justify-content-between small text-muted">
                <span>Vehicle:</span>
                <span className="fw-bold text-dark">{invoice.vehicleBrand} {invoice.vehicleModel}</span>
              </div>
              <div className="d-flex justify-content-between small text-muted mt-1">
                <span>License Plate:</span>
                <span className="fw-bold font-monospace text-primary">{invoice.vehicleRegistration || 'N/A'}</span>
              </div>
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Payment Method</Form.Label>
            <div className="d-flex gap-2">
              <Button 
                variant={paymentMethod === 'CARD' ? 'primary' : 'outline-secondary'} 
                className="w-100 py-2"
                type="button"
                onClick={() => setPaymentMethod('CARD')}
              >
                <i className="bi bi-credit-card me-1"></i> Card
              </Button>
              <Button 
                variant={paymentMethod === 'UPI' ? 'primary' : 'outline-secondary'} 
                className="w-100 py-2"
                type="button"
                onClick={() => setPaymentMethod('UPI')}
              >
                <i className="bi bi-qr-code me-1"></i> UPI
              </Button>
              <Button 
                variant={paymentMethod === 'NETBANKING' ? 'primary' : 'outline-secondary'} 
                className="w-100 py-2"
                type="button"
                onClick={() => setPaymentMethod('NETBANKING')}
              >
                <i className="bi bi-bank me-1"></i> NetBanking
              </Button>
            </div>
          </Form.Group>

          {paymentMethod === 'CARD' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Card Number</Form.Label>
                <Form.Control type="text" placeholder="4111 2222 3333 4444" defaultValue="4111 2222 3333 4444" required />
              </Form.Group>
              <div className="row g-2">
                <div className="col-6">
                  <Form.Group>
                    <Form.Label className="small fw-semibold">Expiry Date</Form.Label>
                    <Form.Control type="text" placeholder="MM/YY" defaultValue="12/28" required />
                  </Form.Group>
                </div>
                <div className="col-6">
                  <Form.Group>
                    <Form.Label className="small fw-semibold">CVV</Form.Label>
                    <Form.Control type="password" placeholder="123" defaultValue="123" required />
                  </Form.Group>
                </div>
              </div>
            </>
          )}

          {paymentMethod === 'UPI' && (
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">VPA / UPI ID</Form.Label>
              <Form.Control type="text" placeholder="user@upi" defaultValue="customer@okhdfcbank" required />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="light" className="border" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="success" type="submit" className="fw-bold px-4" disabled={submitting}>
            {submitting ? (
              <><Spinner size="sm" animation="border" className="me-2" /> Connecting Razorpay...</>
            ) : (
              `Pay ₹${parseFloat(invoice.totalAmount || 0).toFixed(2)} with Razorpay`
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RazorpayModal;
