import React, { useState, useEffect } from "react";
import { DataTable, DT } from "../utils/datatables-imports";
import "../styling/Items.css";
import AddItemButton from "../modals/AddItemButton";

// Bootstrap imports
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

DataTable.use(DT);

const Items = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    // fetch items
    const fetchItems = async () => {
      try {
        const URl = process.env.REACT_APP_URL || "";
        const res = await fetch(`${URl}/api/items`);
        if (!res.ok) throw new Error("Failed to fetch items");
        const items = await res.json();
        setData(items.data || items);
      } catch (err) {
        console.error(err);
      }
    };
    // fetch categories for dropdown
    const fetchCategories = async () => {
      try {
        const URl = process.env.REACT_APP_URL || "";
        const res = await fetch(`${URl}/api/categories`);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const cats = await res.json();
        setCategories(cats);
      } catch (err) {
        console.error(err);
      }
    };
    fetchItems();
    fetchCategories();
  }, []);

  const handleEdit = (item) => {
    setCurrentItem(item);
    setShowEditModal(true);
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const URl = process.env.REACT_APP_URL || "";
      const res = await fetch(`${URl}/api/items/${itemToDelete.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to delete item');

      const updatedRes = await fetch(`${URl}/api/items`);
      const updatedData = await updatedRes.json();
      setData(updatedData.data || updatedData);

      setDeleteConfirm(false);
      setItemToDelete(null);
      alert('Item deleted successfully');
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const URl = process.env.REACT_APP_URL || "";
      const res = await fetch(`${URl}/api/items/${currentItem.id}`, {
        method: 'PUT',
        body: formData
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update item');
      }
      const updatedRes = await fetch(`${URl}/api/items`);
      const updatedData = await updatedRes.json();
      setData(updatedData.data || updatedData);

      setShowEditModal(false);
      setCurrentItem(null);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const columns = [
    {
      title: "Photo",
      data: "photo_path",
      render: (path, type, row) => {
        if (!path) return '<div class="dt-no-image">No Image</div>';
        const src = `${process.env.REACT_APP_URL}${path}`;
        return `<img src="${src}" class="dt-image" alt="${row.name} image" />`;
      }
    },
    { title: "Name", data: "name" },
    { title: "Price", data: "price" },
    { title: "Category", data: "category" },
    {
      title: "Actions",
      data: null,
      render: (data, type, row) => `
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-primary edit-btn" data-id="${row.id}"><i class="bi bi-pencil"></i> Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${row.id}"><i class="bi bi-trash"></i> Delete</button>
        </div>
      `
    }
  ];

  useEffect(() => {
    const handleButtonClick = (e) => {
      if (e.target.closest('.edit-btn')) {
        const id = +e.target.closest('.edit-btn').dataset.id;
        const item = data.find(i => i.id === id);
        if (item) handleEdit(item);
      } else if (e.target.closest('.delete-btn')) {
        const id = +e.target.closest('.delete-btn').dataset.id;
        const item = data.find(i => i.id === id);
        if (item) handleDelete(item);
      }
    };
    document.addEventListener('click', handleButtonClick);
    return () => document.removeEventListener('click', handleButtonClick);
  }, [data]);

  return (
    <div className="items-wrapper">
      <div className="items-header d-flex justify-content-between align-items-center mb-3">
        <h2>Items</h2>
        <AddItemButton />
      </div>
      <div className="datatable-container">
        <DataTable
          className="display cell-border"
          columns={columns}
          data={data}
          options={{
            responsive: true,
            select: true,
            dom: '<"d-flex justify-content-between"lf>rt<"d-flex justify-content-between"ip>B',
            buttons: ["copy", "csv", "excel", "pdf", "print", "colvis"],
            autoWidth: false,
            pageLength: 10
          }}
        />
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Item</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdate}>
          <Modal.Body>
            {currentItem && (
              <> 
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" name="name" defaultValue={currentItem.name} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control type="number" step="0.01" name="price" defaultValue={currentItem.price} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  {/* Dropdown select for categories */}
                  <Form.Select name="category" defaultValue={currentItem.category || ''} required>
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Current Photo</Form.Label>
                  {currentItem.photo_path ? (
                    <img src={`${process.env.REACT_APP_URL}${currentItem.photo_path}`} alt="current" className="img-thumbnail mb-2" style={{ maxHeight: '150px' }} />
                  ) : <p>No photo</p>}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Update Photo</Form.Label>
                  <Form.Control type="file" name="photo" accept="image/*" />
                  <Form.Text className="text-muted">Leave empty to keep current photo</Form.Text>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Close</Button>
            <Button variant="primary" type="submit">Save Changes</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={deleteConfirm} onHide={() => setDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{itemToDelete?.name}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
          <Button varian t="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Items;
