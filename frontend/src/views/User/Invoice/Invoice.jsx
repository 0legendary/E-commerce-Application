import React, { useState } from 'react'
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas'
import './Invoice.css';


function Invoice({ order }) {
    const [showInvoice, setShowInvoice] = useState(false)
    const currentDate = new Date().toLocaleDateString();
    const handleDownloadInvoice = async () => {
        setShowInvoice(true);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const input = document.getElementById(`invoice-container-${order.orderId}`);
        html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`invoice_${order.orderId}_${currentDate}.pdf`);
            setShowInvoice(false);
        });
    };



    return (
        <div>
            <div className='d-flex justify-content-end'>
                <button className="btn btn-success me-2" onClick={handleDownloadInvoice}>Download Invoice</button>
                <button className='btn btn-secondary' style={{ minWidth: "31px" }} onClick={() => setShowInvoice(!showInvoice)}><i class="bi bi-arrow-down-short"></i></button>
            </div>
            <div className={`d-flex justify-content-center ${showInvoice ? 'mt-5' : ''}`} >
                {order.shippingAddress && (
                    <div id={`invoice-container-${order.orderId}`} className={`invoice ${showInvoice ? 'show' : ''}`}>
                        <div className="invoice-details card">
                            <h2 className="invoice-title">Invoice</h2>
                            <div>
                                <div className="left">
                                    <p><strong>Order ID:</strong> {order.orderId}</p>
                                    <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                                    <p><strong>Invoice Date:</strong> {currentDate}</p>
                                </div>
                                <div className="right">
                                    <p><strong>Shipping Address</strong></p>
                                    <address className='text-dark'>
                                        {order.shippingAddress.name} <br />
                                        {order.shippingAddress.address}, <br />
                                        {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.pincode} <br />
                                        Phone: {order.shippingAddress.mobile}
                                    </address>
                                </div>
                            </div>

                        </div>

                        <div className="invoice-products card">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Qty</th>
                                        <th>Amount</th>
                                        <th>Discount/Coupons</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.products.map((product, index) => (
                                        <tr key={index}>
                                            <td>{product.productName}</td>
                                            <td>{product.quantity}</td>
                                            <td>{product.discountPrice}</td>
                                            <td>{product.offerDiscount}</td>
                                            <td>{product.totalPrice}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td><strong>Total</strong></td>
                                        <td><strong>{order.products.reduce((sum, product) => sum + product.quantity, 0)}</strong></td>
                                        <td><strong>{order.products.reduce((sum, product) => sum + product.discountPrice, 0)}</strong></td>
                                        <td><strong>{order.products.reduce((sum, product) => sum + product.offerDiscount, 0)}</strong></td>
                                        <td><strong>{order.products.reduce((sum, product) => sum + product.totalPrice, 0)}</strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                            <div className="grand-total">
                                <h3>Grand Total: ₹{order.products.reduce((sum, product) => sum + product.totalPrice, 0)}</h3>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    )
}

export default Invoice
