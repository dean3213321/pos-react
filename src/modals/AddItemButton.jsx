import { useState, useRef, useEffect } from 'react';

const AddItemButton = ({ onItemAdded }) => {
  const URL = process.env.REACT_APP_URL;
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const modalRef = useRef();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${URL}/api/categories`);
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    if (showModal) fetchCategories();
  }, [showModal]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleCloseModal();
      }
    };
    if (showModal) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModal, isSubmitting]);

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setShowModal(false);
    setError('');
    setSuccess('');
    setName('');
    setPrice('');
    setCategory('');
    setPhotoFile(null);
  };

  const handleFileChange = (e) => setPhotoFile(e.target.files[0] || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('category', category);
      if (photoFile) formData.append('photo', photoFile);

      const response = await fetch(`${URL}/api/item`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to create item');
      }
      const data = await response.json();
      setSuccess('Item created successfully!');
      onItemAdded?.(data.item);
      setTimeout(handleCloseModal, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        className="btn btn-primary mb-4 d-flex align-items-center gap-2"
        onClick={() => setShowModal(true)}
        style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.2)', transition: 'all 0.3s ease', fontWeight: 500, padding: '0.5rem 1.25rem', borderRadius: '8px' }}
        onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
        onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M2 2h12v12H2z" stroke="currentColor" strokeWidth="1" fill="none" />
          <path d="M8 4v8M4 8h8" stroke="currentColor" strokeWidth="1" />
        </svg>
        Add Item
      </button>

      {showModal && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog" ref={modalRef}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Item</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal} disabled={isSubmitting} aria-label="Close" />
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Price</label>
                    <input type="number" step="0.01" className="form-control" value={price} onChange={(e) => setPrice(e.target.value)} required disabled={isSubmitting} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} disabled={isSubmitting} required>
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Photo File</label>
                    <input type="file" className="form-control" onChange={handleFileChange} accept="image/jpeg, image/png, image/webp" disabled={isSubmitting} />
                    <small className="text-muted">Max 5MB. JPG, PNG, or WEBP.</small>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={handleCloseModal} disabled={isSubmitting} style={{ borderRadius: '8px' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ borderRadius: '8px', minWidth: '120px' }}>
                      {isSubmitting ? (
                        <><span className="spinner-border spinner-border-sm me-2" />Creating...</>
                      ) : (
                        'Create Item'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddItemButton;