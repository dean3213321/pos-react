import React from 'react';

const EditCategoryModal = ({ 
  show, 
  handleClose, 
  category, 
  handleSave,
  modalRef
}) => {
  const [name, setName] = React.useState('');
  const [photo, setPhoto] = React.useState(null);

  React.useEffect(() => {
    if (category) {
      setName(category.name || '');
    } else {
      setName('');
      setPhoto(null);
    }
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!category || !category.id) {
      console.error("No category selected for editing");
      return;
    }

    handleSave({
      id: category.id,
      name,
      photo
    });
  };

  if (!show || !category) return null;

  return (
    <div className="modal fade show" style={{ display: 'block' }}>
      <div className="modal-dialog" ref={modalRef}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Category</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose}
              aria-label="Close"
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Category Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files[0])}
                />
                {category?.photo_path && !photo && (
                  <div className="mt-2">
                    <img 
                      src={`${process.env.REACT_APP_URL}${category.photo_path}`} 
                      alt="Current" 
                      style={{ maxWidth: '100px' }}
                    />
                    <p className="text-muted mt-1">Current Image</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleClose}
              >
                Close
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!name.trim()}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCategoryModal;