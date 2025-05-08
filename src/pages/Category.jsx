import React, { useState, useEffect } from "react";
import { DataTable, DT } from "../utils/datatables-imports";
import "../styling/Category.css";
import AddCategoryButton from "../modals/AddCategoryButton";

// Bootstrap imports
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

DataTable.use(DT);

const Category = () => {
  const [data, setData] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const URl = process.env.REACT_APP_URL || "";
        const res = await fetch(`${URl}/api/categories`);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const categories = await res.json();
        setData(categories.data || categories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleEdit = (category) => {
    setCurrentCategory(category);
    setShowEditModal(true);
  };

  const handleDelete = (category) => {
    setCategoryToDelete(category);
    setDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const URl = process.env.REACT_APP_URL || "";
      const res = await fetch(`${URl}/api/categories/${categoryToDelete.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok) {
        if (result.items_count > 0) {
          throw new Error(`Cannot delete category. It has ${result.items_count} associated items.`);
        }
        throw new Error(result.error || 'Failed to delete category');
      }
      const updatedRes = await fetch(`${URl}/api/categories`);
      if (!updatedRes.ok) throw new Error("Failed to fetch updated categories");
      const updatedCategories = await updatedRes.json();
      setData(updatedCategories.data || updatedCategories);
      setDeleteConfirm(false);
      setCategoryToDelete(null);
      const photoMsg = result.photo_deleted ? "and its photo were" : "was";
      alert(`Category ${photoMsg} deleted successfully`);
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
      const res = await fetch(`${URl}/api/categories/${currentCategory.id}`, {
        method: 'PUT',
        body: formData
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update category');
      }
      const updatedRes = await fetch(`${URl}/api/categories`);
      const updatedData = await updatedRes.json();
      setData(updatedData.data || updatedData);
      setShowEditModal(false);
      setCurrentCategory(null);
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
        return `<img src="${src}" class="dt-image" alt="${row.name} category image" />`;
      }
    },
    { title: "Name", data: "name" },
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
        const category = data.find(c => c.id === id);
        if (category) handleEdit(category);
      } else if (e.target.closest('.delete-btn')) {
        const id = +e.target.closest('.delete-btn').dataset.id;
        const category = data.find(c => c.id === id);
        if (category) handleDelete(category);
      }
    };
    document.addEventListener('click', handleButtonClick);
    return () => document.removeEventListener('click', handleButtonClick);
  }, [data]);

  return (
    <div className="category-wrapper">
      <div className="category-header d-flex justify-content-between align-items-center mb-3">
        <h2>Categories</h2>
        <AddCategoryButton />
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
          pageLength: 10,       // default to 10 rows per page
          lengthChange: true     // show the dropdown
        }}
      />

      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Category</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdate}>
          <Modal.Body>
            {currentCategory && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Category Name</Form.Label>
                  <Form.Control type="text" name="name" defaultValue={currentCategory.name} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Current Image</Form.Label>
                  {currentCategory.photo_path ? (
                    <img src={`${process.env.REACT_APP_URL}${currentCategory.photo_path}`} className="img-thumbnail mb-2" style={{ maxHeight: '200px' }} alt={`${currentCategory.name} current`} />
                  ) : (
                    <p>No image</p>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Update Image</Form.Label>
                  <Form.Control type="file" name="photo" accept="image/jpeg, image/png, image/webp" />
                  <Form.Text className="text-muted">Leave empty to keep current image</Form.Text>
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

      {/* Delete Confirmation Modal */}
      <Modal show={deleteConfirm} onHide={() => setDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the category "{categoryToDelete?.name}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Category;
