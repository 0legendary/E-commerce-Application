import React, { useEffect, useState } from 'react';
import './adminProduct.css';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../config/axiosConfig';
import { handleApiResponse } from '../../../utils/utilsHelper'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Skeleton from 'react-loading-skeleton';
import LoadingSpinner from '../../Loading/LoadingSpinner';
function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [deleteProduct, setDeleteProduct] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [isLoadingAction, setIsLoadingAction] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      const result = await handleApiResponse(
        axiosInstance.get('/admin/getProducts')
      );
      if (result.success) {
        setProducts(result.data.products);
        setFilteredProducts(result.data.products);
      } else {
        console.error(result.message);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
      setCurrentPage(1);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const handleDelete = (_id) => {
    const product = products.find(p => p._id === _id);

    if (product) {
      setConfirmDelete(product);
      setDeleteProduct(true);
    }
  };


  const handleMoveToTrash = async (_id) => {
    setIsLoadingAction(true);
    const apiCall = axiosInstance.post('/admin/moveToTrash', { product_id: _id });
    const { success, message } = await handleApiResponse(apiCall);
    if (success) {
      setProducts((prevProducts) => prevProducts.filter((product) => product._id !== _id));

      toast.error(message || "Product moved to trash", {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setDeleteProduct(false);
      setIsLoadingAction(false);

    } else {
      setIsLoadingAction(false);
      toast.error(message || "Failed to move to trash", {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };


  const handleDeletePermanently = async (_id) => {
    setIsLoadingAction(true);
    const apiCall = axiosInstance.post('/admin/deletePermanently', { product_id: _id });
    const { success, message } = await handleApiResponse(apiCall);

    if (success) {
      setProducts((prevProducts) => prevProducts.filter((product) => product._id !== _id));

      toast.error(message || "Product deleted", {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setIsLoadingAction(false);
    } else {
      setIsLoadingAction(false);
      toast.error(message || "Failed to delete permanently", {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }

    setDeleteProduct(false);
  };
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <div className="admin-products">
        <ToastContainer />
        <LoadingSpinner isLoadingAction={isLoadingAction} />
        <div className="header">
          <h2 className='text-uppercase font-monospace'>Products</h2>
          <Link to='/admin/addProduct'>
            <button className="btn btn-primary">
              Add New Product
            </button>
          </Link>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by product name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
        {deleteProduct && (
          <div className="update-form bg-dark">
            <h5 className='text-danger d-flex justify-content-center pt-3 pb-3 txt-heading'>
              Are you sure you want to delete the product named '{confirmDelete.name}' permanently?
            </h5>
            <div className='d-flex gap-2 justify-content-center pb-3'>
              <button className='btn btn-danger w-50' onClick={() => handleDeletePermanently(confirmDelete._id)}>Delete Permanently</button>
              <button className='btn btn-warning w-50' onClick={() => handleMoveToTrash(confirmDelete._id)}>Move to Trash</button>
            </div>
            <button className='btn btn-primary w-100' onClick={() => setDeleteProduct(false)}>Cancel Deletion</button>
          </div>
        )}
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Image</th>
              <th scope="col">Name</th>
              <th scope="col">Brand</th>
              <th scope="col">Price</th>
              <th scope="col">Stock</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          {loading ?
            <tbody>
              {[...Array(7)].map((_, index) => (
                <tr key={index}>
                  <td colSpan={7}>
                    <Skeleton height={80} width={'100%'} />
                  </td>
                </tr>
              ))}
            </tbody>
            :
            <tbody>
              {currentProducts.map((product, index) => {
                const mainImage = product?.images?.images?.find(image => image.mainImage);
                const displayImage = mainImage || product.images[0];
                return (
                  <tr key={product._id}>
                    <th scope="row">{indexOfFirstProduct + index + 1}</th>
                    <td>
                      <div className="product-image-wrapper">
                        <img src={displayImage.cdnUrl} alt={product.name} className="product-image" style={{ width: '100px', height: '100px' }} />
                        <img src={displayImage.cdnUrl} alt={product.name} className="product-image-hover" />
                      </div>
                    </td>
                    <td>{product.name}</td>
                    <td>{product.brand}</td>
                    <td>{product.variations[0].price}</td>
                    <td>{product.variations[0].stock}</td>
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
                )
              })}
            </tbody>
          }
        </table>
        {!loading &&
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-end">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>&laquo; Previous</button>
              </li>
              {Array.from({ length: totalPages }, (_, index) => (
                <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(index + 1)}>{index + 1}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next &raquo;</button>
              </li>
            </ul>
          </nav>
        }
      </div>
    </>
  );
}

export default AdminProducts;
