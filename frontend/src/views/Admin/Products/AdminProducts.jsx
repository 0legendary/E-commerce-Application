import React, { useEffect, useState } from 'react';
import './adminProduct.css';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../config/axiosConfig';

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [deleteProduct, setDeleteProduct] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState({})

  useEffect(() => {
    axiosInstance.get('/admin/getProducts')
      .then(response => {
        if (response.data.status) {
          console.log(response.data.products);
          setProducts(response.data.products)
        }
      })
      .catch(error => {
        // Handle error
        console.error('Error sending data:', error);
      });
  }, [])

  const handleDelete = (_id, index) => {
    console.log(_id);
    setConfirmDelete(products[index])
    setDeleteProduct(true)
  }

  const handleMoveToTrash = (_id) => {
    console.log(_id);
    axiosInstance.post('/admin/moveToTrash', { product_id: _id })
      .then((response) => {
        if (response.data.status) {
          setProducts((prevProducts) => prevProducts.filter(product => product._id !== _id));
          setDeleteProduct(false)
          //setSuccess({ update: status ? 'Deleted successfully' : 'Moved to Trash' })
        } else {
          console.log('sdfd');
          //setErrors({ updateErr: 'Something went wrong' })
        }
      })
      .catch(() => {
        //setErrors({ updateErr: 'Something went wrong' })
      })
  }


  return (
    <>
      <div className="admin-products">
        <div className="header">
          <h1>Products</h1>
          <Link to='/admin/addProduct'>
            <button className="btn btn-primary">
              Add New Product
            </button>
          </Link>
        </div>
        {deleteProduct && (
          <div className="update-form bg-dark">
            <h5 className='text-danger d-flex justify-content-center pt-3 pb-3 txt-heading'>Are you sure to delete the user named '{confirmDelete.name}' permenantly ?</h5>
            <div className='d-flex gap-2 justify-content-center pb-3'>
              <button className='btn btn-danger w-50' >Delete Permenantly</button>
              <button className='btn btn-warning w-50' onClick={() => handleMoveToTrash(confirmDelete._id)}>Move to Trash</button>
            </div>
            <button className='btn btn-primary w-100' onClick={() => setDeleteProduct(false)}>Cancel Deletion</button>
            {/* {errors.updateErr && <div className="error alignText">{errors.updateErr}</div>}
          {success.update && <div className="success alignText">{success.update}</div>} */}
          </div>
        )}
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Image</th>
              <th scope="col">Name</th>
              <th scope="col">Price</th>
              <th scope="col">Catergory</th>
              <th scope="col">Stock</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product._id}>
                <th scope="row">{index + 1}</th>
                <td>
                  <div className="product-image-wrapper">
                    <img src={product.mainImage} alt={product.name} className="product-image" />
                    <img src={product.mainImage} alt={product.name} className="product-image-hover" />
                  </div>
                </td>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.category}</td>
                <td>{product.stock}</td>
                <td>
                  <Link to={`/admin/editProduct/${product._id}`}>
                    <button className="btn btn-warning btn-sm">
                      Edit
                    </button>
                  </Link>
                  <button onClick={() => handleDelete(product._id, index)} className="btn btn-danger btn-sm">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </>
  );
}

export default AdminProducts;
