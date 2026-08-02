import React, { useEffect, useState } from 'react';
import { Button, Table, Spinner, Card } from 'react-bootstrap';
import { vehicleService } from '../../services/vehicleService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const VehicleList = () => {
  const { user, role } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      let data = [];
      if (role === 'CUSTOMER') {
        if (user?.id) {
          data = await vehicleService.getByCustomerId(user.id);
        } else {
          data = [];
        }
      } else {
        data = await vehicleService.getAll();
      }
      setVehicles(data || []);
    } catch (error) {
      console.warn('Vehicle list fetch error:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [user, role]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleService.delete(id);
        toast.success('Vehicle deleted successfully');
        fetchVehicles();
      } catch (error) {
        toast.error('Failed to delete vehicle');
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
        <div>
          <h3 className="fw-bold mb-1">{role === 'CUSTOMER' ? 'My Vehicles' : 'Vehicle Registry'}</h3>
          <p className="text-muted mb-0">
            {role === 'CUSTOMER' 
              ? 'Manage your registered vehicles for service booking.' 
              : 'System-wide list of registered customer vehicles.'}
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/vehicles/new')}>
          <i className="bi bi-plus-lg me-2"></i>Add Vehicle
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 ps-4">License Plate</th>
                <th className="py-3">Make / Brand</th>
                <th className="py-3">Model</th>
                <th className="py-3">Color</th>
                {role !== 'CUSTOMER' && <th className="py-3">Owner</th>}
                <th className="py-3 text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={role !== 'CUSTOMER' ? 6 : 5} className="text-center py-4 text-muted">
                    No vehicles found. Click "Add Vehicle" to register one.
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => {
                  const targetId = vehicle.vehicleId || vehicle.id;
                  return (
                    <tr key={targetId}>
                      <td className="align-middle fw-bold text-primary ps-4">{vehicle.licensePlate}</td>
                      <td className="align-middle fw-medium">{vehicle.brand || vehicle.make}</td>
                      <td className="align-middle">{vehicle.model}</td>
                      <td className="align-middle">{vehicle.color || 'N/A'}</td>
                      {role !== 'CUSTOMER' && (
                        <td className="align-middle">{vehicle.customerName || vehicle.customer?.userName || 'Customer'}</td>
                      )}
                      <td className="align-middle text-end pe-4">
                        <Button 
                          variant="light" 
                          size="sm" 
                          className="me-2 text-primary border" 
                          onClick={() => navigate(`/vehicles/edit/${targetId}`)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button 
                          variant="light" 
                          size="sm" 
                          className="text-danger border" 
                          onClick={() => handleDelete(targetId)}
                        >
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

export default VehicleList;
