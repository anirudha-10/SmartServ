import React, { useEffect, useState } from 'react';
import { Button, Table, Spinner, Card, Badge } from 'react-bootstrap';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.delete(id);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'MANAGER': return 'warning text-body-emphasis';
      case 'MECHANIC': return 'info';
      case 'CUSTOMER': return 'success';
      default: return 'primary';
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
        <h3 className="fw-bold mb-0">User Management</h3>
        <Button variant="primary" onClick={() => navigate('/users/new')}>
          <i className="bi bi-plus-lg me-2"></i>Add User
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th className="border-bottom-0 py-3 ps-4">Name</th>
                <th className="border-bottom-0 py-3">Email</th>
                <th className="border-bottom-0 py-3">Phone</th>
                <th className="border-bottom-0 py-3">Role</th>
                <th className="border-bottom-0 py-3 text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="align-middle fw-medium ps-4">{user.userName}</td>
                    <td className="align-middle">{user.email}</td>
                    <td className="align-middle">{user.mobile}</td>
                    <td className="align-middle">
                      <Badge bg={getRoleBadge(user.userRole)} className="px-2 py-1">
                        {user.userRole}
                      </Badge>
                    </td>
                    <td className="align-middle text-end pe-4">
                      <Button variant="light" size="sm" className="me-2 text-primary" onClick={() => navigate(`/users/edit/${user.id}`)}>
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button variant="light" size="sm" className="text-danger" onClick={() => handleDelete(user.id)}>
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserList;
