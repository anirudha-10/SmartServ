import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Badge, Spinner } from 'react-bootstrap';
import { invoiceService } from '../../services/invoiceService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import RazorpayModal from './RazorpayModal';

const InvoiceList = () => {
  const { user, role } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      let data = [];
      const isCustomer = role === 'CUSTOMER' || user?.role === 'CUSTOMER' || user?.userRole === 'CUSTOMER';
      const customerId = user?.id || user?.userId;

      if (isCustomer) {
        if (customerId) {
          data = await invoiceService.getByCustomer(customerId);
        } else {
          data = [];
        }
      } else {
        data = await invoiceService.getAll();
      }
      setInvoices(data || []);
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user, role]);

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'danger';
      default: return 'secondary';
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">{role === 'CUSTOMER' ? 'My Invoices' : 'Invoice Registry'}</h3>
          <p className="text-muted mb-0">
            {role === 'CUSTOMER' 
              ? 'View your service bills and settle pending dues.' 
              : 'Manage system invoices and track payment statuses.'}
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Invoice #</th>
                <th>Job Card #</th>
                <th>Vehicle Details</th>
                {role !== 'CUSTOMER' && <th>Customer</th>}
                <th>Total Amount</th>
                <th>Payment Status</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={role !== 'CUSTOMER' ? 7 : 6} className="text-center py-4 text-muted">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const custName = inv.customerName || inv.customer?.userName || 'Customer';
                  const amt = inv.totalAmount !== undefined && inv.totalAmount !== null && Number(inv.totalAmount) > 0 
                    ? Number(inv.totalAmount) 
                    : (Number(inv.baseAmount || 0) + Number(inv.taxAmount || 0));

                  const vehicleInfo = inv.vehicleBrand 
                    ? `${inv.vehicleBrand} ${inv.vehicleModel || ''} (${inv.vehicleRegistration || 'N/A'})` 
                    : 'Car Service';

                  return (
                    <tr key={inv.id}>
                      <td className="ps-4 align-middle fw-bold text-primary">
                        {inv.invoiceNumber || `#INV-${inv.id}`}
                      </td>
                      <td className="align-middle fw-medium">#JC-{inv.jobCard?.id || inv.jobCardId}</td>
                      <td className="align-middle text-body-emphasis">
                        <div className="fw-semibold">{inv.vehicleBrand ? `${inv.vehicleBrand} ${inv.vehicleModel || ''}` : 'Vehicle Service'}</div>
                        {inv.vehicleRegistration && <small className="text-muted font-monospace">{inv.vehicleRegistration}</small>}
                      </td>
                      {role !== 'CUSTOMER' && (
                        <td className="align-middle fw-semibold text-body-emphasis">
                          {custName}
                        </td>
                      )}
                      <td className="align-middle fw-bold text-body-emphasis">
                        ₹{amt.toFixed(2)}
                      </td>
                    <td className="align-middle">
                      <Badge bg={getPaymentStatusBadge(inv.paymentStatus || 'PENDING')} className="px-2 py-1">
                        {inv.paymentStatus || 'PENDING'}
                      </Badge>
                    </td>
                    <td className="text-end pe-4 align-middle">
                      {inv.paymentStatus !== 'PAID' ? (
                        <Button 
                          variant="success" 
                          size="sm" 
                          className="fw-semibold px-3"
                          onClick={() => { setSelectedInvoice(inv); setShowPayModal(true); }}
                        >
                          <i className="bi bi-shield-check me-1"></i>Pay via Razorpay
                        </Button>
                      ) : (
                        <Button variant="outline-secondary" size="sm" onClick={() => toast.info(`Invoice #${inv.invoiceNumber || inv.id} receipt printed.`)}>
                          <i className="bi bi-printer me-1"></i>Receipt
                        </Button>
                      )}
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Razorpay Checkout Modal */}
      {selectedInvoice && (
        <RazorpayModal
          invoice={selectedInvoice}
          show={showPayModal}
          onHide={() => setShowPayModal(false)}
          onSuccess={fetchInvoices}
        />
      )}
    </div>
  );
};

export default InvoiceList;
