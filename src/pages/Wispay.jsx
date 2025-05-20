import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Button, InputGroup, Spinner, Alert } from 'react-bootstrap';

const URL = process.env.REACT_APP_URL || '';

const Wispay = () => {
  const [rfid, setRfid] = useState('');
  const [name, setName] = useState('');
  const [credit, setCredit] = useState(null);
  const [amount, setAmount] = useState('');
  const [loadingUser, setLoadingUser] = useState(false);
  const [addingCredit, setAddingCredit] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const rfidRef = useRef(null);

  useEffect(() => {
    rfidRef.current?.focus();
  }, []);

  const handleScan = async () => {
    if (!rfid) return;
    setLoadingUser(true);
    setError(null);
    setMessage(null);
    try {
      // Fetch credit and user info (assumes API returns name and credit)
      const res = await fetch(`${URL}/api/wispay/credit?rfid=${encodeURIComponent(rfid)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch user info');
      }
      setName(data.username || 'Unknown User');  // adjust according to API
      setCredit(parseFloat(data.credit));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error fetching user data');
      setName('');
      setCredit(null);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleAddCredit = async () => {
    if (!rfid || !amount) return;
    setAddingCredit(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`${URL}/api/wispay/credit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfid,
          amount,
          empid: process.env.REACT_APP_EMP_ID || 'POS_USER',
          username: process.env.REACT_APP_EMP_USERNAME || 'POS Operator',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to add credit');
      setCredit(parseFloat(data.newBalance));
      setMessage(`Credit added! New balance: ${parseFloat(data.newBalance).toFixed(2)}`);
      setAmount('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error adding credit');
    } finally {
      setAddingCredit(false);
    }
  };

  return (
    <Card className="mx-auto mt-4" style={{ maxWidth: '400px' }}>
      <Card.Header as="h5">Add Wispay Credit</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}
        <Form.Group className="mb-3">
          <Form.Label>Scan RFID</Form.Label>
          <InputGroup>
            <Form.Control
              ref={rfidRef}
              type="text"
              placeholder="Enter or scan RFID"
              value={rfid}
              onChange={e => setRfid(e.target.value)}
              disabled={loadingUser}
            />
            <Button variant="outline-primary" onClick={handleScan} disabled={loadingUser || !rfid}>
              {loadingUser ? <Spinner animation="border" size="sm" /> : 'Fetch'}
            </Button>
          </InputGroup>
        </Form.Group>

        {credit !== null && (
          <>
            <p><strong>User:</strong> {name}</p>
            <p><strong>Current Credit:</strong> {credit.toFixed(2)}</p>
          </>
        )}

        {credit !== null && (
          <Form.Group className="mb-3">
            <Form.Label>Amount to Add</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                placeholder="00.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                disabled={addingCredit}
              />
              <Button variant="success" onClick={handleAddCredit} disabled={addingCredit || !amount}>
                {addingCredit ? <Spinner animation="border" size="sm" /> : 'Add'}
              </Button>
            </InputGroup>
          </Form.Group>
        )}
      </Card.Body>
    </Card>
  );
};

export default Wispay;