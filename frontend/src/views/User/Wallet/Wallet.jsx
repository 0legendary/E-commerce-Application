import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../config/axiosConfig';
import { handleApiResponse } from '../../../utils/utilsHelper';
import Layout from '../Header/Layout';
import { Button, Card, Form, Tab, Tabs, ListGroup } from 'react-bootstrap';
import './Wallet.css'; // Create a Wallet.css file for custom styling
import { walletValidate } from '../../../config/validateWallet';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

function Wallet() {
    const [wallet, setWallet] = useState({});
    const [showAddMoney, setShowAddMoney] = useState(false);
    const [showTransfer, setShowTransfer] = useState(false);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [errors, setErrors] = useState({})
    const [user, setUser] = useState({})
    const [loading, setLoading] = useState(true);

    const mainHeading = "Wallet";
    const breadcrumbs = [{ name: "Home", path: "/" }];

    useEffect(() => {
        const fetchWalletData = async () => {
            try {
                const apiCall = axiosInstance.get('/user/wallet');
                const { success, data, message } = await handleApiResponse(apiCall);
                if (success) {
                    setWallet(data.wallet ? data.wallet[0] : {});
                    setUser(data.userData ? data.userData : {});
                } else {
                    console.error(message);
                }
                setLoading(false)
            } catch (error) {
                console.error('Error fetching wallet data:', error);
            }
        };

        fetchWalletData();
    }, []);


    const initPayment = async (paymentData) => {
        const options = {
            amount: paymentData.amount,
            currency: paymentData.currency,
            name: "Olegendary",
            description: "wallet payment",
            order_id: paymentData.id,
            handler: async (response) => {
                try {
                    const apiResponse = await axiosInstance.post('/user/add-wallet', {
                        response,
                        amount: parseInt(amount),
                        description: 'Adding money to wallet',
                        userID: user._id
                    });

                    const { success, data } = await handleApiResponse(apiResponse);

                    if (success) {
                        toast.success(`₹ ${amount} added to your wallet`, {
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: false,
                            draggable: true,
                            progress: undefined,
                            theme: "dark",
                        });

                        setWallet(prevWallet => ({
                            ...prevWallet,
                            balance: data.wallet.balance,
                            transactions: data.wallet.transactions
                        }));

                        setAmount('');
                        setShowAddMoney(false);
                    }
                } catch (error) {
                    console.error('Server error', error);
                    toast.error('Error adding money to wallet', {
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                }
            },
            prefill: {
                name: user.name,
                email: user.email,
                contact: user.mobile ? user.mobile : null,
                userId: user._id
            },
            theme: {
                color: "#3399cc",
            },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    }

    const handleAddMoney = async (e) => {
        e.preventDefault();
        let Errors = walletValidate(amount)
        setErrors(Errors)
        if (Object.keys(Errors).length === 0) {
            try {
                const { success, data, message } = await handleApiResponse(
                    axiosInstance.post('/user/payments', { amount: amount })
                );

                if (success) {
                    initPayment(data);
                } else {
                    console.error(message);
                }
            } catch (error) {
                console.error('Error initiating payment:', error.message);
            }
        }
    };


    const handleTransfer = (e) => {
        e.preventDefault();
        let Errors = walletValidate(amount)
        setErrors(Errors)
        if (Object.keys(Errors).length === 0) {

        }
    };


    return (
        <div className="wallet-page">
            <Layout mainHeading={mainHeading} breadcrumbs={breadcrumbs} />
            <ToastContainer />
            <SkeletonTheme baseColor='#d6d6d6' highlightColor='#ecebeb'>
                <div className="container mt-5">
                    <div className="row">
                        <div className="col-md-6 mb-4">
                            <Card className="premium-card shadow-sm">
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <span>Wallet Balance</span>
                                    <i className="bi bi-wallet premium-icon"></i>
                                </Card.Header>
                                {loading ? (
                                    <Card.Body>
                                        <Skeleton width={170} height={35} />
                                        <div className='pt-5'>
                                            <Skeleton width={120} height={42} />
                                        </div>
                                    </Card.Body>
                                ) : (
                                    <Card.Body>
                                        <h3 className="text-success font-monospace display-5">₹{wallet ? wallet.balance : 0}</h3>
                                        <Button
                                            className="premium-btn mt-3"
                                            variant="primary"
                                            onClick={() => { setShowAddMoney(!showAddMoney); setShowTransfer(false); setAmount(''); }}
                                        >
                                            {showAddMoney ? 'Cancel' : 'Add Money'}
                                        </Button>
                                        {showAddMoney && (
                                            <Form onSubmit={handleAddMoney} className="mt-4 fade-in">
                                                <Form.Group controlId="formAmount">
                                                    <Form.Label className="premium-label">Amount</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="Enter amount"
                                                        value={amount}
                                                        onChange={(e) => { setAmount(e.target.value); setErrors('') }}
                                                        className="premium-input"
                                                    />
                                                    {errors.amount && <p className="text-danger">{errors.amount}</p>}
                                                </Form.Group>
                                                <Button variant="primary" type="submit" className="mt-3 premium-btn animated-btn">
                                                    Add Money <i class="bi bi-bank"></i>
                                                </Button>
                                            </Form>
                                        )}
                                        {showTransfer && (
                                            <Form onSubmit={handleTransfer} className="mt-4 fade-in">
                                                <Form.Group controlId="formTransferAmount">
                                                    <Form.Label className="premium-label">Amount</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="Enter amount"
                                                        value={amount}
                                                        onChange={(e) => setAmount(e.target.value)}
                                                        className="premium-input"
                                                        required
                                                    />
                                                </Form.Group>
                                                <Form.Group controlId="formDescription" className="mt-2">
                                                    <Form.Label className="premium-label">Description</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Enter description"
                                                        value={description}
                                                        onChange={(e) => setDescription(e.target.value)}
                                                        className="premium-input"
                                                    />
                                                </Form.Group>
                                                <Button variant="primary" type="submit" className="mt-3 premium-btn animated-btn">
                                                    Transfer
                                                </Button>
                                            </Form>
                                        )}
                                    </Card.Body>
                                )}

                            </Card>
                        </div>
                        <div className="col-md-6">
                            <Card className="premium-card shadow-sm">
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <span>Transaction History</span>
                                    <i className="bi bi-clock-history premium-icon"></i>
                                </Card.Header>
                                <Card.Body>
                                    <Tabs defaultActiveKey="credit" id="transaction-tabs" className="premium-tabs">
                                        <Tab eventKey="credit" title="Credit">
                                            {loading ? (
                                                <ListGroup variant="flush" className="mt-3 fade-in transaction-list">
                                                    {Array(3).fill().map((_, index) => (
                                                        <ListGroup.Item key={index} className="premium-list-item">
                                                            <Skeleton borderRadius={10} height={45} width={'100%'} />
                                                        </ListGroup.Item>
                                                    ))}
                                                </ListGroup>
                                            ) : (
                                                <ListGroup variant="flush" className="mt-3 fade-in transaction-list">
                                                    {wallet && wallet.transactions?.filter(transaction => transaction.type === 'credit').length > 0 ? (
                                                        wallet.transactions
                                                            .filter(transaction => transaction.type === 'credit')
                                                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                            .map(transaction => (
                                                                <ListGroup.Item key={transaction._id} className="premium-list-item">
                                                                    ₹{transaction.amount} - {transaction.description} <br />
                                                                    <small>{new Date(transaction.createdAt).toLocaleString()}</small>
                                                                </ListGroup.Item>
                                                            ))
                                                    ) : (
                                                        <ListGroup.Item className="no-transaction-item">
                                                            No Credit History
                                                        </ListGroup.Item>
                                                    )}
                                                </ListGroup>
                                            )}

                                        </Tab>

                                        <Tab eventKey="debit" title="Debit">
                                            {loading ? (
                                                <ListGroup variant="flush" className="mt-3 fade-in transaction-list">
                                                    {Array(3).fill().map((_, index) => (
                                                        <ListGroup.Item key={index} className="premium-list-item">
                                                            <Skeleton borderRadius={10} height={45} width={'100%'} />
                                                        </ListGroup.Item>
                                                    ))}
                                                </ListGroup>
                                            ) : (
                                                <ListGroup variant="flush" className="mt-3 fade-in transaction-list">
                                                    {wallet && wallet.transactions?.filter(transaction => transaction.type === 'debit').length > 0 ? (
                                                        wallet.transactions
                                                            .filter(transaction => transaction.type === 'debit')
                                                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                            .map(transaction => (
                                                                <ListGroup.Item key={transaction._id} className="premium-list-item">
                                                                    ₹{transaction.amount} - {transaction.description} <br />
                                                                    <small>{new Date(transaction.createdAt).toLocaleString()}</small>
                                                                </ListGroup.Item>
                                                            ))
                                                    ) : (
                                                        <ListGroup.Item className="no-transaction-item">
                                                            No Debit History
                                                        </ListGroup.Item>
                                                    )}
                                                </ListGroup>
                                            )}
                                        </Tab>
                                    </Tabs>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </div>
            </SkeletonTheme>
        </div>

    );
}

export default Wallet;
