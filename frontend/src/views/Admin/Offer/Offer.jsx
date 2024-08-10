import React, { useState, useEffect } from 'react';
import { Table, Form, InputGroup, Button } from 'react-bootstrap';
import axiosInstance from '../../../config/axiosConfig';
import moment from 'moment';
import NewOffer from './NewOffer';
import EditOffer from './EditOffer';


function Offer() {
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [editData, setEditData] = useState({})
    const [offers, setOffers] = useState([]);
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])



    useEffect(() => {
        axiosInstance.get('/admin/get-offers')
            .then(response => {
                if (response.data.status) {
                    let data = response.data
                    setProducts(data.products)
                    setCategories(data.categories)
                    setOffers(data.offers);
                }
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
            });
    }, []);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };


    const filteredOffers = offers.filter(offer => {
        return (
            offer.type.toLowerCase().includes(search.toLowerCase()) ||
            moment(offer.startDate).format('MMMM D, YYYY').includes(search) ||
            moment(offer.endDate).format('MMMM D, YYYY').includes(search)
        );
    });

    const handleCreateOffer = (newOffer) => {
        newOffer.type !== 'click' && setOffers([...offers, newOffer])
        setShowForm(!showForm)
    }
    const handleEditOffer = (editOffer) => {
        setShowEditForm(!showEditForm)
        setEditData(editOffer)
    }

    const completeEditOffer = (editOffer) => {
        setShowEditForm(!showEditForm)
        if (editOffer._id) {
            const updatedOffers = offers.map(offer =>
                offer._id === editOffer._id ? editOffer : offer
            );
            setOffers(updatedOffers);
        }
    }

    const handleToggle = (offer_id) => {
        axiosInstance.put('/admin/toggle-offers',{offer_id})
            .then(response => {
                if (response.data.status) {
                    setOffers(prevOffers =>
                        prevOffers.map(offer =>
                            offer._id === offer_id ? { ...offer, isActive: !offer.isActive } : offer
                        )
                    );
                }
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
            });
    }



    return (
        <div className="container mt-5 text-white font-monospace">
            <h2 className="mb-4">Manage Offers</h2>
            {showForm && (
                <div>
                    <NewOffer cancelCreate={handleCreateOffer} products={products} categories={categories}/>
                </div>
            )}
            {showEditForm && (
                <div>
                    <EditOffer completeEditCoupon={completeEditOffer} offer={editData} products={products} categories={categories} />
                </div>
            )}
            {!showForm && !showEditForm && (
                <div>
                    <Form className="mb-4 d-flex">
                        <Button variant="outline-success" className='me-5' onClick={handleCreateOffer}>Create</Button>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Search by code, valid date, or expiry date"
                                value={search}
                                onChange={handleSearch}
                            />
                            <Button variant="outline-secondary">Search</Button>
                        </InputGroup>
                    </Form>

                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Discount</th>
                                <th>Valid From</th>
                                <th>Valid Until</th>
                                <th>Discount amount</th>
                                <th>Change</th>
                                <th>Block/Unblock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOffers.map((offer, index) => (
                                <tr key={index}>
                                    <td>{offer.type}</td>
                                    <td>{offer.description}</td>
                                    <td>{offer.discountPercentage ? offer.discountPercentage : 0}%</td>
                                    <td>{moment(offer.startDate).format('MMMM D, YYYY')}</td>
                                    <td>{moment(offer.endDate).format('MMMM D, YYYY')}</td>
                                    <td>{offer.discountAmount ? offer.discountAmount : 0}</td>
                                    <td><Button onClick={() => handleEditOffer(offer)}>Edit</Button></td>
                                    <td><Button variant={offer.isActive ? 'danger': 'secondary'} onClick={() => handleToggle(offer._id)}>{offer.isActive ? 'Block' : 'Unblock'}</Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </div>
    )
}
export default Offer
