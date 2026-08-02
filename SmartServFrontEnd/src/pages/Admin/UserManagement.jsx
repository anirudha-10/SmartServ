import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Badge, Spinner, Tab, Nav, Modal, Form } from 'react-bootstrap';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoleFilter, setActiveRoleFilter] = useState('ALL');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    userRole: 'CUSTOMER',
    mobile: '',
    salary: 0.0,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await userService.create({
        ...formData,
        salary: Number(formData.salary) || 1.1,
        active: true,
      });

      toast.success(`New ${formData.userRole} user created!`);
      setShowAddModal(false);
      setFormData({ userName: '', email: '', password: '', userRole: 'CUSTOMER', mobile: '', salary: 0.0 });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      try {
        await userService.delete(id);
        toast.success('User removed.');
        fetchUsers();
      } catch (err) {
        toast.error('Failed to delete user.');
      }
    }
  };

  const filteredUsers = activeRoleFilter === 'ALL' 
    ? users 
    : users.filter(u => u.userRole === activeRoleFilter);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'MANAGER': return 'warning';
      case 'MECHANIC': return 'info';
      case 'CUSTOMER': return 'success';
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
          <h3 className="fw-bold mb-1">User Management Panel</h3>
          <p className="text-muted mb-0">Manage system roles, create new team members or customer accounts.</p>
        </div>
        <Button variant="primary" className="fw-semibold" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-person-plus me-2"></i>Add New User
        </Button>
      </div>

      <Tab.Container activeKey={activeRoleFilter} onSelect={(k) => setActiveRoleFilter(k)}>
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-transparent border-0 pt-3 px-4">
            <Nav variant="tabs">
              <Nav.Item><Nav.Link eventKey="ALL" className="fw-semibold">All Users ({users.length})</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="ADMIN" className="fw-semibold">Admins</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="MANAGER" className="fw-semibold">Managers</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="MECHANIC" className="fw-semibold">Mechanics</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="CUSTOMER" className="fw-semibold">Customers</Nav.Link></Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Username</th>
                  <th>Email Address</th>
                  <th>Mobile Number</th>
                  <th>Role</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">No users found for this role.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="ps-4 align-middle fw-medium">{u.userName}</td>
                      <td className="align-middle">{u.email}</td>
                      <td className="align-middle">{u.mobile}</td>
                      <td className="align-middle">
                        <Badge bg={getRoleBadge(u.userRole)} className="px-2 py-1">
                          {u.userRole}
                        </Badge>
                      </td>
                      <td className="text-end pe-4 align-middle">
                        <Button variant="light" size="sm" className="text-danger border" onClick={() => handleDelete(u.id)}>
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
      </Tab.Container>

      {/* Modal: Add User */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Create System User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateUser}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Username</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Email Address</Form.Label>
              <Form.Control 
                type="email" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Password</Form.Label>
              <Form.Control 
                type="password" 
                required 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Mobile Number</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Assign Role</Form.Label>
              <Form.Select 
                value={formData.userRole}
                onChange={(e) => setFormData({ ...formData, userRole: e.target.value })}
              >
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="MECHANIC">MECHANIC</option>
                <option value="MANAGER">MANAGER</option>
                <option value="ADMIN">ADMIN</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" className="border" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? <Spinner size="sm" animation="border" /> : 'Create User'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
