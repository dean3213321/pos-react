import { useState, useRef, useEffect } from 'react';

const AddCategoryButton = ({ onCategoryAdded }) => {
    const URL = process.env.REACT_APP_URL;
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const modalRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                handleCloseModal();
            }
        };

        if (showModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showModal]);

    const handleCloseModal = () => {
        if (isSubmitting) return;
        setShowModal(false);
        setError('');
        setSuccess('');
        setName('');
        setPhotoFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            if (!photoFile) {
                throw new Error('Please upload an image');
            }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('photo', photoFile);

            const response = await fetch(`${URL}/api/categories`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create category');
            }

            const data = await response.json();
            setSuccess('Category created successfully!');
            
            if (onCategoryAdded) {
                onCategoryAdded(data.category);
            }
            
            setTimeout(() => {
                handleCloseModal();
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e) => {
        setPhotoFile(e.target.files[0] || null);
    };

    return (
        <>
            <button 
                className="btn btn-primary mb-4 d-flex align-items-center gap-2"
                onClick={() => setShowModal(true)}
                style={{
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    fontWeight: 500,
                    padding: '0.5rem 1.25rem',
                    borderRadius: '8px'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
                Add Category
            </button>

            {showModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog" ref={modalRef}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New Category</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={handleCloseModal}
                                    disabled={isSubmitting}
                                    aria-label="Close"
                                />
                            </div>
                            <div className="modal-body">
                                {error && <div className="alert alert-danger">{error}</div>}
                                {success && <div className="alert alert-success">{success}</div>}
                                
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Category Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    
                                    <div className="mb-3">
                                        <label className="form-label">Category Image</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={handleFileChange}
                                            accept="image/jpeg, image/png, image/webp"
                                            required
                                            disabled={isSubmitting}
                                        />
                                        <small className="text-muted">
                                            Max 5MB. JPG, PNG, or WEBP.
                                        </small>
                                    </div>
                                    
                                    <div className="modal-footer">
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-secondary" 
                                            onClick={handleCloseModal}
                                            disabled={isSubmitting}
                                            style={{ borderRadius: '8px' }}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary" 
                                            disabled={isSubmitting}
                                            style={{ 
                                                borderRadius: '8px',
                                                minWidth: '120px'
                                            }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" />
                                                    Creating...
                                                </>
                                            ) : 'Create Category'}
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

export default AddCategoryButton;