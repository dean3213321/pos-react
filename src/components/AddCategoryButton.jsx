import { useState, useRef, useEffect } from 'react';

const AddCategoryButton = ({ onCategoryAdded }) => {
    // Default to localhost:3000 if REACT_APP_URL isn't set
    const API_BASE_URL = process.env.REACT_APP_URL || 'http://localhost:3000';
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

            const response = await fetch(`${API_BASE_URL}/api/categories`, {
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
                className="btn btn-primary mb-4"
                onClick={() => setShowModal(true)}
            >
                Add New Category
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
                                            className="btn btn-secondary" 
                                            onClick={handleCloseModal}
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary" 
                                            disabled={isSubmitting}
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