import React, { useEffect, useState } from 'react';
import './adminProduct.css';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../config/axiosConfig';

function AdminProducts() {
  const [products, setProducts] = useState([])

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


  return (
    <div className="admin-products">
      <div className="header">
        <h1>Products</h1>
        <Link to='/admin/addProduct'>
          <button className="btn btn-primary">
            Add New Product
          </button>
        </Link>
      </div>
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
                <button className="btn btn-danger btn-sm">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminProducts;
