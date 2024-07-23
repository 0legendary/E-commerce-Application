import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axiosInstance from '../../../config/axiosConfig';

function Category() {
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [categories, setCategories] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);


  useEffect(() => {
    axiosInstance.get('/admin/getAllCategories')
      .then(response => {
        if (response.data.status) {
          setCategories(response.data.categories);
        }
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
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
    setCategories([...categories, { ...newCategory }]);
    console.log(newCategory);
    await axiosInstance.post('/admin/newCategory', newCategory)
      .then(response => {
        if (response.data.status) {
          setCategories([...categories, response.data.category]);
          handleCloseModal();
        }
      })
      .catch(error => {
        console.error('Error adding category:', error);
      });
  };

  const handleEditCategory = async () => {
    const editedCategory = {
      _id: editCategoryId,
      ...newCategory
    }
    await axiosInstance.put('/admin/editCategory', editedCategory)
      .then(response => {
        if (response.data.status) {
          setCategories(categories.map(category =>
            category._id === editCategoryId ? response.data.category : category
          ));
          handleCloseModal();
        }
      })
      .catch(error => {
        console.error('Error editing category:', error);
      });
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
      await axiosInstance.delete(`/admin/deleteCategory/${categoryToDelete._id}`)
        .then(response => {
          if (response.data.status) {
            setCategories(categories.filter(category => category._id !== categoryToDelete._id));
            handleCloseDeleteModal();
          }
        })
        .catch(error => {
          console.error('Error deleting category:', error);
        });
    }
  };


  const handleToggleCategory = async (_id) => {
    try {
      const response = await axiosInstance.put('/admin/toggleCategory', { _id });
      if (response.data.status) {
        setCategories(categories.map(category =>
          category._id === _id ? { ...category, isBlocked: !category.isBlocked } : category
        ));
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
          <div key={category._id} className="card m-2" style={{ width: '18rem' }}>
            <div className="card-body">
              <h5 className="card-title">{category.name}</h5>
              <p className="card-text">{category.description}</p>
              <button
                className="btn btn-primary mr-2"
                onClick={() => openEditModal(category)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger m-3"
                onClick={() => openDeleteModal(category)}
              >
                Delete
              </button>
              <button className={`btn ${!category.isBlocked ? 'btn-danger': 'btn-success'} m-2`} onClick={() => handleToggleCategory(category._id)}>{category.isBlocked ? 'Unblock' : 'Block'}</button>
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
