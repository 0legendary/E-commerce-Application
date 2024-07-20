import React from 'react';
import './SingleProduct.css';

const product = {
  _id: "6699701ce61d8713626c8c4b",
  name: "Adidas ULTRA 4DFWD SHOES",
  description: "RUNNING SHOES DESIGNED TO MOVE YOU FORWARD, MADE IN PART WITH PARLEY OCEAN PLASTIC.",
  category: "Sports",
  brand: "Adidas",
  price: "22999",
  discountPrice: 13799,
  stock: "40",
  sizeOptions: ["7", "8", "9", "10"],
  colorOptions: ["Red", "Blue", "Green"],
  material: "Rubber outsole",
  mainImage: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/7e6dcfdc0a1b4fb08ba4bc057d465459_9366/Ultraboost_5x_Shoes_Black_JI1334_HM1.jpg",
  additionalImages: [
    "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/53a3ca19c06b4c5abc39131398fae837_9366/Ultraboost_5x_Shoes_Black_JI1334_HM3_hover.jpg",
    "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/b5e29909433b4d9daaba38c2e7ab019d_9366/Ultraboost_5x_Shoes_Black_JI1334_HM5.jpg",
    "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/0af8bc2c5cc64ff59cfc41da136f5015_9366/Ultraboost_5x_Shoes_Black_JI1334_HM9.jpg"
  ],
  weight: "394",
  gender: "Unisex",
  season: "All Seasons",
  __v: 2
};

function SingleProduct() {
  return (
    <div className="container " style={{"margin-top":"15rem"}}>
      <div className="row">
        <div className="col-md-6">
          <img src={product.mainImage} className="img-fluid main-image rounded" alt={product.name} />
        </div>
        <div w2className="col-md-6">
          <h2 className="mb-3">{product.name}</h2>
          <p className="text-muted mb-4">{product.description}</p>
          <div className="product-details mb-4">
            <h4>Category: <span className="text-info">{product.category}</span></h4>
            <h4>Brand: <span className="text-info">{product.brand}</span></h4>
            <h4>Price: <span className="text-danger">₹{product.price}</span></h4>
            <h4>Discount Price: <span className="text-success">₹{product.discountPrice}</span></h4>
            <h4>Stock: <span className="text-warning">{product.stock}</span></h4>
            <h4>Material: <span className="text-secondary">{product.material}</span></h4>
            <h4>Weight: <span className="text-secondary">{product.weight}g</span></h4>
            <h4>Gender: <span className="text-secondary">{product.gender}</span></h4>
            <h4>Season: <span className="text-secondary">{product.season}</span></h4>
          </div>
          <div className="product-options mb-4">
            <h4>Sizes:</h4>
            <ul className="list-inline">
              {product.sizeOptions.map((size, index) => (
                <li key={index} className="list-inline-item badge badge-primary p-2 mr-2">{size}</li>
              ))}
            </ul>
            <h4>Colors:</h4>
            <ul className="list-inline">
              {product.colorOptions.map((color, index) => (
                <li key={index} className="list-inline-item badge badge-secondary p-2 mr-2">{color}</li>
              ))}
            </ul>
          </div>
          <h4>Additional Images:</h4>
          <div className="additional-images">
            {product.additionalImages.map((image, index) => (
              <img key={index} src={image} className="img-fluid additional-image rounded mr-2 mb-2" alt={`Additional ${index + 1}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SingleProduct;
