import React from 'react';
import { Table } from 'react-bootstrap';

const LedgerBook = ({ orders }) => {
    const totalAmount = orders.reduce((acc, order) => acc + order.orderTotal, 0);
  return (
    <div className="ledger-book">
      <h2 className='text-white'>Order Ledger</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer Name</th>
            <th>Payment Method</th>
            <th>Order Status</th>
            <th>Date of Order</th>
            <th>Product Details</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.orderId}</td>
              <td>{order.customerId.name}</td>
              <td>{order.paymentMethod}</td>
              <td>{order.products[0].orderStatus}</td>
              <td>{new Date(order.orderDate).toLocaleDateString()}</td>
              <td>
                <ul>
                  {order.products.map((product, index) => (
                    <li key={index}>
                      {product.productName} - {product.selectedColor} - {product.selectedSize} - {product.quantity} x {product.discountPrice}
                    </li>
                  ))}
                </ul>
              </td>
              <td>{order.orderTotal}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="6"></td>
            <td className='d-flex justify-content-end'>Total: {totalAmount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </Table>
    </div>
  );
};

export default LedgerBook;
