import React, { useState, useEffect } from 'react';
import { Table, Form, InputGroup, Button, Pagination, Card } from 'react-bootstrap';
import axiosInstance from '../../../config/axiosConfig';
import moment from 'moment';
import NewOffer from './NewOffer';
import EditOffer from './EditOffer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { handleApiResponse } from '../../../utils/utilsHelper';

function Offer() {
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [editData, setEditData] = useState({})
    const [offers, setOffers] = useState([]);
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;


    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const apiCall = axiosInstance.get('/admin/get-offers');
                const { success, data, message } = await handleApiResponse(apiCall);

                if (success) {
                    setProducts(data.products);
                    setCategories(data.categories);
                    setOffers(data.offers);
                } else {
                    console.error('Error fetching offers:', message);
                }
            } catch (error) {
                console.error('Error fetching offers:', error);
            }
        };

        fetchOffers();
    }, []);
    const handleSearch = (e) => {
        setSearch(e.target.value);
    };


    const filteredOffers = offers.filter(offer => {
        if (!offer) return false;

        const type = offer.type ? offer.type.toLowerCase() : '';
        const startDate = offer.startDate ? moment(offer.startDate).format('MMMM D, YYYY') : '';
        const endDate = offer.endDate ? moment(offer.endDate).format('MMMM D, YYYY') : '';

        return (
            type.includes(search.toLowerCase()) ||
            startDate.includes(search) ||
            endDate.includes(search)
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


    const handleToggle = async (offer_id) => {
        try {
            const apiCall = axiosInstance.put('/admin/toggle-offers', { offer_id });
            const { success, message } = await handleApiResponse(apiCall);

            if (success) {
                setOffers(prevOffers =>
                    prevOffers.map(offer =>
                        offer._id === offer_id ? { ...offer, isActive: !offer.isActive } : offer
                    )
                );
                toast.success("Status changed successfully", {
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            } else {
                toast.error(message || "Something went wrong while updating the status", {
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            }
        } catch (error) {
            console.error('Error updating offer status:', error);
            toast.error('An unexpected error occurred', {
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

    const handleDeleteOffer = async (offer_id) => {
        try {
            const apiCall = axiosInstance.post('/admin/delete-offer', { offer_id });
            const { success, message } = await handleApiResponse(apiCall);
            if (success) {
                setOffers(prevOffers =>
                    prevOffers.filter(offer =>
                        offer._id !== offer_id
                    )
                );
                toast.success("Offer deleted", {
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            } else {
                toast.error(message, {
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            }
        } catch (error) {
            console.error('Error sending data:', error);
            toast.error('An unexpected error occurred', {
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

    const indexOfLastOffer = currentPage * itemsPerPage;
    const indexOfFirstOffer = indexOfLastOffer - itemsPerPage;
    const currentOffers = filteredOffers.slice(indexOfFirstOffer, indexOfLastOffer);

    const pageCount = Math.ceil(filteredOffers.length / itemsPerPage);

    return (
        <div className="mt-5 font-monospace">
            <ToastContainer />
            <h2 className="mb-4 text-uppercase">Manage Offers</h2>
            {showForm && (
                <div>
                    <NewOffer cancelCreate={handleCreateOffer} products={products} categories={categories} />
                </div>
            )}
            {showEditForm && (
                <div>
                    <EditOffer completeEditOffer={completeEditOffer} offer={editData} products={products} categories={categories} />
                </div>
            )}
            {!showForm && !showEditForm && (
                <Card className='p-3'>
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
                                <th>Delete</th>
                                <th>Block/Unblock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOffers.length > 0 ? (
                                currentOffers.map((offer, index) => (
                                    <tr key={index}>
                                        <td>{offer.type}</td>
                                        <td>{offer.description}</td>
                                        <td>{offer.discountPercentage ? offer.discountPercentage : 0}%</td>
                                        <td>{moment(offer.startDate).format('MMMM D, YYYY')}</td>
                                        <td>{moment(offer.endDate).format('MMMM D, YYYY')}</td>
                                        <td>{offer.discountAmount ? offer.discountAmount : 0}</td>
                                        <td>
                                            <Button type='button' onClick={() => handleEditOffer(offer)}>Edit</Button>
                                        </td>
                                        <td>
                                            <Button variant='danger' onClick={() => handleDeleteOffer(offer._id)}>Delete</Button>
                                        </td>
                                        <td>
                                            <Button
                                                variant={offer.isActive ? 'warning' : 'secondary'}
                                                onClick={() => handleToggle(offer._id)}
                                            >
                                                {offer.isActive ? 'Block' : 'Unblock'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center">No offers found</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                    {filteredOffers.length > itemsPerPage &&
                        <nav className='d-flex justify-content-end'>
                            <Pagination>
                                <Pagination.Prev
                                    onClick={() => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))}
                                    disabled={currentPage === 1}
                                />
                                {Array.from({ length: pageCount }, (_, index) => (
                                    <Pagination.Item
                                        key={index + 1}
                                        active={currentPage === index + 1}
                                        onClick={() => setCurrentPage(index + 1)}
                                    >
                                        {index + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next
                                    onClick={() => setCurrentPage(prevPage => Math.min(prevPage + 1, pageCount))}
                                    disabled={currentPage === pageCount}
                                />
                            </Pagination>
                        </nav>
                    }
                </Card>
            )}
        </div>
    )
}
export default Offer
