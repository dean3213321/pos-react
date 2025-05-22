// src/components/modals/LoginModal.jsx
import { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';

const LoginModal = ({ show, handleClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const API_URL = process.env.REACT_APP_URL || '';

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const response = await fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    let result;

    // Safely try to parse JSON only if content-type is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text(); // fallback for non-JSON
      throw new Error(`Unexpected response format: ${text}`);
    }

    if (response.ok && result.success) {
      login(result.data.token);
      handleClose();
      navigate('/admin');
    } else {
      setError(result.message || 'Invalid credentials');
    }
  } catch (error) {
    console.error('Login error:', error);
    setError(error.message || 'An error occurred during login. Please try again.');
  } finally {
    setLoading(false);
  }
};


  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Admin Login</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleLogin}>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <><Spinner animation="border" size="sm" /> Logging in...</>
            ) : (
              'Login'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default LoginModal;