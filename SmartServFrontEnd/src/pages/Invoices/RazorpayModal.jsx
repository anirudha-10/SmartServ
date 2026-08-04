import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Card } from 'react-bootstrap';
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

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handlePayNow = async () => {
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
              await invoiceService.verifyPayment(invoice.id, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentMethod: 'CREDIT_CARD', // Defaulting to generic for external gateway
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
      const mockVerificationPayload = {
        razorpayPaymentId: 'pay_' + Math.random().toString(36).substr(2, 9),
        razorpayOrderId: order?.orderId || 'order_mock_' + Date.now(),
        razorpaySignature: 'sig_verified_mock_' + Date.now(),
        paymentMethod: 'CREDIT_CARD',
      };

      await invoiceService.verifyPayment(invoice.id, mockVerificationPayload);
      toast.success(`Payment of ₹${parseFloat(invoice.totalAmount || 0).toFixed(2)} Successful via Mock Razorpay!`);
      onSuccess();
      onHide();
    } catch (err) {
      console.error('Payment failure:', err);
      toast.error(err?.response?.data?.message || 'Payment processing failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (!invoice) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="fw-bold d-flex align-items-center">
          <i className="bi bi-shield-check text-primary me-2 fs-4"></i>
          Secure Payment Gateway
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        <Card className="border-0 bg-primary bg-opacity-10 mb-4 text-center p-3">
          <small className="text-muted text-uppercase fw-semibold">Amount To Pay</small>
          <h2 className="fw-bold text-primary mb-0">₹{parseFloat(invoice.totalAmount || 0).toFixed(2)}</h2>
          <small className="text-muted">Invoice #{invoice.invoiceNumber || invoice.id}</small>
        </Card>

        {invoice.vehicleBrand && (
          <div className="bg-light p-3 rounded mb-4">
            <div className="d-flex justify-content-between small text-muted">
              <span>Vehicle:</span>
              <span className="fw-bold text-body-emphasis">{invoice.vehicleBrand} {invoice.vehicleModel}</span>
            </div>
            <div className="d-flex justify-content-between small text-muted mt-1">
              <span>License Plate:</span>
              <span className="fw-bold font-monospace text-primary">{invoice.vehicleRegistration || 'N/A'}</span>
            </div>
          </div>
        )}
        
        <p className="text-center text-muted small px-3 mb-0">
          You will be redirected to the secure Razorpay checkout to complete your transaction. Do not refresh the page.
        </p>
      </Modal.Body>
      
      <Modal.Footer className="bg-light d-flex justify-content-between">
        <Button variant="light" className="border" onClick={onHide} disabled={submitting}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          className="fw-bold px-4 flex-grow-1 ms-2" 
          onClick={handlePayNow} 
          disabled={submitting}
        >
          {submitting ? (
            <><Spinner size="sm" animation="border" className="me-2" /> Connecting Razorpay...</>
          ) : (
            <>Pay ₹{parseFloat(invoice.totalAmount || 0).toFixed(2)} Securely</>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RazorpayModal;
