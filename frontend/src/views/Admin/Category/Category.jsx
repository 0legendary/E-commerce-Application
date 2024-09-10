import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axiosInstance from '../../../config/axiosConfig';
import { handleApiResponse } from '../../../utils/utilsHelper';

function Category() {
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [categories, setCategories] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiCall = axiosInstance.get('/admin/getAllCategories');
        const { success, data, message } = await handleApiResponse(apiCall);

        if (success) {
          setCategories(data.categories);
        } else {
          console.error('Error fetching categories:', message);
        }
      } catch (error) {
        console.error('Unexpected error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);




  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setNewCategory({ name: '', description: '' });
    setEditCategoryId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };


  const handleAddCategory = async () => {
    const updatedCategories = [...categories, { ...newCategory }];
    setCategories(updatedCategories);

    // Post the new category to the backend
    const apiCall = axiosInstance.post('/admin/newCategory', newCategory);

    const { success, data, message } = await handleApiResponse(apiCall);

    if (success) {
      setCategories([...categories, data.newCategory]);
      handleCloseModal();
    } else {
      // Optionally handle error UI updates here
      console.error('Error adding category:', message);
    }
  };


  const handleEditCategory = async () => {
    const editedCategory = {
      _id: editCategoryId,
      ...newCategory
    };

    const apiCall = axiosInstance.put('/admin/editCategory', editedCategory);

    const { success, data, message } = await handleApiResponse(apiCall);
    
    if (success) {
      setCategories(categories.map(category =>
        category._id === editCategoryId ? data.existingCategory : category
      ));
      handleCloseModal();
    } else {
      // Optionally handle error UI updates here
      console.error('Error editing category:', message);
    }
  };

  const openEditModal = (category) => {
    setNewCategory({ name: category.name, description: category.description });
    setEditCategoryId(category._id);
    setIsEdit(true);
    handleShowModal();
  };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setCategoryToDelete(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
        const apiCall = axiosInstance.delete(`/admin/deleteCategory/${categoryToDelete._id}`);

        const { success, message } = await handleApiResponse(apiCall);

        if (success) {
            setCategories(categories.filter(category => category._id !== categoryToDelete._id));
            handleCloseDeleteModal();
        } else {
            // Optionally handle error UI updates here
            console.error('Error deleting category:', message);
        }
    }
};


  const handleToggleCategory = async (category_id) => {
    try {
        const apiCall = axiosInstance.put('/admin/toggleCategory', { category_id });
        const { success, data, message } = await handleApiResponse(apiCall);

        if (success) {
            setCategories(categories.map(category =>
                category._id === category_id ? data.category : category
            ));
        } else {
            console.error('Error toggling category:', message);
        }
    } catch (error) {
        console.error('Error toggling category:', error);
    }
};

  return (
    <div className="container mt-5 text-white">
      <h2 className="mb-4">Categories</h2>
      <div className="d-flex flex-wrap">
        {categories.map(category => (
          <div key={category._id} className="card m-2" >
            <div className="card-body">
              <h5 className="card-title">{category.name}</h5>
              <p className="card-text">{category.description}</p>
              <div className='d-flex gap-2'>
                <button
                  className="btn btn-primary"
                  onClick={() => openEditModal(category)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger "
                  onClick={() => openDeleteModal(category)}
                >
                  Delete
                </button>
                <button className={`btn ${!category.isBlocked ? 'btn-danger' : 'btn-success'}`} onClick={() => handleToggleCategory(category._id)}>{category.isBlocked ? 'Unblock' : 'Block'}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Modal for delete confirmation */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the category "{categoryToDelete?.name}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <button className="btn btn-success mt-4" onClick={handleShowModal}>
        Add New Category
      </button>

      {/* Modal for Adding or Editing Category */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit Category' : 'Add New Category'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formCategoryName">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter category name"
                name="name"
                value={newCategory.name}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formCategoryDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter category description"
                name="description"
                value={newCategory.description}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <div className='d-flex gap-3'>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="primary" onClick={isEdit ? handleEditCategory : handleAddCategory}>
              {isEdit ? 'Save Changes' : 'Add Category'}
            </Button>
          </div>

        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Category;
