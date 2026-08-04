import React, { useEffect, useState } from 'react';
import { Button, Table, Spinner, Card, Badge } from 'react-bootstrap';
import { inventoryService } from '../../services/inventoryService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getAll();
      setInventory(data);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryService.delete(id);
        toast.success('Item deleted successfully');
        fetchInventory();
      } catch (error) {
        toast.error('Failed to delete item');
      }
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
        <h3 className="fw-bold mb-0">Inventory</h3>
        <Button variant="primary" onClick={() => navigate('/inventory/new')}>
          <i className="bi bi-plus-lg me-2"></i>Add Item
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th className="border-bottom-0 py-3 ps-4">SKU</th>
                <th className="border-bottom-0 py-3">Name</th>
                <th className="border-bottom-0 py-3">Quantity</th>
                <th className="border-bottom-0 py-3">Unit Price</th>
                <th className="border-bottom-0 py-3 text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                inventory.map((item) => {
                  const sku = item.skuCode || item.sku || 'N/A';
                  const qty = item.stockQuantity !== undefined && item.stockQuantity !== null 
                    ? item.stockQuantity 
                    : (item.quantityAvailable !== undefined ? item.quantityAvailable : 0);
                  const price = item.currentPrice !== undefined && item.currentPrice !== null 
                    ? item.currentPrice 
                    : (item.unitPrice !== undefined ? item.unitPrice : 0);

                  return (
                    <tr key={item.id}>
                      <td className="align-middle ps-4">
                        <span className="badge bg-light text-secondary border font-monospace px-2 py-1">
                          {sku.toUpperCase()}
                        </span>
                      </td>
                      <td className="align-middle fw-bold text-body-emphasis">{item.itemName}</td>
                      <td className="align-middle">
                        {qty <= 5 ? (
                          <Badge bg="danger" className="px-2 py-1">{qty} (Low Stock)</Badge>
                        ) : (
                          <Badge bg="success" className="px-2 py-1">{qty} in stock</Badge>
                        )}
                      </td>
                      <td className="align-middle fw-bold text-dark">
                        ${Number(price || 0).toFixed(2)}
                      </td>
                      <td className="align-middle text-end pe-4">
                        <Button variant="light" size="sm" className="me-2 text-primary border" onClick={() => navigate(`/inventory/edit/${item.id}`)}>
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button variant="light" size="sm" className="text-danger border" onClick={() => handleDelete(item.id)}>
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default InventoryList;
