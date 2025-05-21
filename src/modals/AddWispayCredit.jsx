import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';

const AddWispayCredit = ({ buttonText = "Add Credit", buttonVariant = "primary", buttonSize = "md" }) => {
  const [showModal, setShowModal] = useState(false);
  const [rfid, setRfid] = useState('');
  const [name, setName] = useState('');
  const [credit, setCredit] = useState(null);
  const [amount, setAmount] = useState('');
  const [loadingUser, setLoadingUser] = useState(false);
  const [addingCredit, setAddingCredit] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const rfidRef = useRef(null);
  const amountRef = useRef(null);

  const URL = process.env.REACT_APP_URL || '';

  // Focus management
  useEffect(() => {
    if (showModal) {
      setTimeout(() => {
        rfidRef.current?.focus();
      }, 100);
    }
  }, [showModal]);

  // Auto-fetch user data when RFID changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!rfid || !showModal) return;
      
      setLoadingUser(true);
      setError(null);
      setMessage(null);
      
      try {
        const res = await fetch(`${URL}/api/wispay/credit?rfid=${encodeURIComponent(rfid)}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Failed to fetch user info');

        setName(data.user?.name || 'Unknown User');
        setCredit(parseFloat(data.credit));
        
        // Auto-focus amount input after successful fetch
        if (data.user?.name) {
          setTimeout(() => amountRef.current?.focus(), 100);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error fetching user data');
        setName('Unknown User');
        setCredit(null);
      } finally {
        setLoadingUser(false);
      }
    };

    // Add debounce to prevent too many API calls while typing
    const debounceTimer = setTimeout(() => {
      fetchUserData();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [rfid, showModal, URL]); // Added URL to dependency array

  // Add credit to user account
  const handleAddCredit = async () => {
  if (!rfid || !amount) return;
  setAddingCredit(true);
  setError(null);
  
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
    
    // Corrected this line to use data.balance.new instead of data.newBalance
    setMessage(`Success! New balance: ${data.balance.new}`);
    setCredit(parseFloat(data.balance.new));
    setAmount('');
    
    // Auto-close modal after 2.5 seconds
    setTimeout(() => {
      handleClose();
    }, 2500);
  } catch (err) {
    console.error(err);
    setError(err.message || 'Error adding credit');
  } finally {
    setAddingCredit(false);
  }
};

  // Reset form when modal closes
  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => {
      setRfid('');
      setName('');
      setCredit(null);
      setAmount('');
      setError(null);
      setMessage(null);
    }, 300);
  };

  // Handle Enter key in amount field to submit
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && name && amount) {
      e.preventDefault();
      handleAddCredit();
    }
  };

  return (
    <>
      <Button 
        variant={buttonVariant} 
        size={buttonSize}
        onClick={() => setShowModal(true)}
      >
        {buttonText}
      </Button>

      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Wispay Credit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Scan RFID</Form.Label>
              <InputGroup>
                <Form.Control
                  ref={rfidRef}
                  type="text"
                  placeholder="Enter or scan RFID"
                  value={rfid}
                  onChange={(e) => setRfid(e.target.value)}
                  disabled={loadingUser || addingCredit}
                />
                {loadingUser && (
                  <InputGroup.Text>
                    <Spinner animation="border" size="sm" />
                  </InputGroup.Text>
                )}
              </InputGroup>
            </Form.Group>

            {(name || credit !== null) && (
              <div className="mb-3">
                <p><strong>User:</strong> {name || 'Unknown User'}</p>
                <p><strong>Current Credit:</strong> {credit?.toFixed(2) || '0.00'}</p>
              </div>
            )}

            {name && (
              <Form.Group>
                <Form.Label>Amount to Add</Form.Label>
                <InputGroup>
                  <Form.Control
                    ref={amountRef}
                    type="number"
                    placeholder="00.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={addingCredit}
                  />
                </InputGroup>
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          {name && amount && (
            <Button 
              variant="primary" 
              onClick={handleAddCredit}
              disabled={addingCredit}
            >
              {addingCredit ? (
                <Spinner animation="border" size="sm" />
              ) : (
                'Add Credit (Press Enter)'
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddWispayCredit;