import React from 'react';
import './adminProduct.css';
import { Link } from 'react-router-dom';

function AdminProducts() {
  const products = [
    {
        id: 1,
        name: 'Product 1',
        price: '$100',
        stock: 10,
        imageUrl: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/e1216dc4ad9e4535b6d749c9843bf2e5_9366/Terrex_Soulstride_RAIN.RDY_Trail_Running_Shoes_Black_IF5015_HM1.jpg',
        originalImageUrl: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/e1216dc4ad9e4535b6d749c9843bf2e5_9366/Terrex_Soulstride_RAIN.RDY_Trail_Running_Shoes_Black_IF5015_HM1.jpg'
      },
      {
        id: 2,
        name: 'Product 2',
        price: '$200',
        stock: 5,
        imageUrl: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/2711a2657d164ecd86f557693665f6d6_9366/4DFWD_3_Running_Shoes_White_IG8987_01_standard.jpg',
        originalImageUrl: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/2711a2657d164ecd86f557693665f6d6_9366/4DFWD_3_Running_Shoes_White_IG8987_01_standard.jpg'
      },
  ];

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
            <th scope="col">Stock</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <th scope="row">{product.id}</th>
              <td>
                <div className="product-image-wrapper">
                  <img src={product.imageUrl} alt={product.name} className="product-image" />
                  <img src={product.originalImageUrl} alt={product.name} className="product-image-hover" />
                </div>
              </td>
              <td>{product.name}</td>
              <td>{product.price}</td>
              <td>{product.stock}</td>
              <td>
                <button className="btn btn-warning btn-sm">
                   Edit
                </button>
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
