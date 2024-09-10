import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../config/axiosConfig';
import { handleApiResponse } from '../../../utils/utilsHelper';
import Layout from '../Header/Layout';
import { Button, Card, Form, Tab, Tabs, ListGroup } from 'react-bootstrap';
import './Wallet.css'; // Create a Wallet.css file for custom styling
import { walletValidate } from '../../../config/validateWallet';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Wallet() {
    const [wallet, setWallet] = useState({});
    const [showAddMoney, setShowAddMoney] = useState(false);
    const [showTransfer, setShowTransfer] = useState(false);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [errors, setErrors] = useState({})
    const [user, setUser] = useState({})

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
        <div>
            <Layout mainHeading={mainHeading} breadcrumbs={breadcrumbs} />
            <ToastContainer />
            <div className="container mt-4">
                <div className="row">
                    <div className="col-md-6">
                        <Card>
                            <Card.Header>Wallet Balance</Card.Header>
                            <Card.Body>
                                <h3>₹{wallet ? wallet.balance : 0}</h3>
                                <Button variant="primary" onClick={() => { setShowAddMoney(!showAddMoney); setShowTransfer(false); setAmount(''); }}>
                                    {showAddMoney ? 'Cancel' : 'Add Money'}
                                </Button>
                                <Button variant="secondary" className="ms-2" onClick={() => { setShowTransfer(!showTransfer); setShowAddMoney(false); setAmount(''); }}>
                                    {showTransfer ? 'Cancel' : 'Transfer to Bank'}
                                </Button>
                                {showAddMoney && (
                                    <Form onSubmit={handleAddMoney} className="mt-3">
                                        <Form.Group controlId="formAmount">
                                            <Form.Label>Amount</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Enter amount"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}

                                            />
                                            {errors.amount && <p className='text-danger'>{errors.amount}</p>}
                                        </Form.Group>
                                        <Button variant="primary" type="submit" className="mt-3">
                                            Add Money
                                        </Button>
                                    </Form>
                                )}
                                {showTransfer && (
                                    <Form onSubmit={handleTransfer} className="mt-3">
                                        <Form.Group controlId="formTransferAmount">
                                            <Form.Label>Amount</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Enter amount"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                required
                                            />
                                        </Form.Group>
                                        <Form.Group controlId="formDescription" className="mt-2">
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter description"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                            />
                                        </Form.Group>
                                        <Button variant="primary" type="submit" className="mt-3">
                                            Transfer
                                        </Button>
                                    </Form>
                                )}
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="col-md-6">
                        <Card>
                            <Card.Header>Transaction History</Card.Header>
                            <Card.Body>
                                <Tabs defaultActiveKey="credit" id="transaction-tabs" className="mb-3">
                                    <Tab eventKey="credit" title="Credit">
                                        {wallet ?
                                            <>
                                                <ListGroup variant="flush" className="mt-2">
                                                    {wallet.transactions
                                                        ?.filter(transaction => transaction.type === 'credit')
                                                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                        .map(transaction => (
                                                            <ListGroup.Item key={transaction._id}>
                                                                ₹{transaction.amount} - {transaction.description} <br />
                                                                <small>{new Date(transaction.createdAt).toLocaleString()}</small>
                                                            </ListGroup.Item>
                                                        ))}
                                                </ListGroup>
                                            </>
                                            : <div>
                                                No Credit History
                                            </div>
                                        }

                                    </Tab>
                                    <Tab eventKey="debit" title="Debit">

                                        {wallet ?
                                            <>
                                                <ListGroup variant="flush" className="mt-2">
                                                    {wallet.transactions
                                                        ?.filter(transaction => transaction.type === 'debit')
                                                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                        .map(transaction => (
                                                            <ListGroup.Item key={transaction._id}>
                                                                ₹{transaction.amount} - {transaction.description} <br />
                                                                <small>{new Date(transaction.createdAt).toLocaleString()}</small>
                                                            </ListGroup.Item>
                                                        ))}
                                                </ListGroup>
                                            </>
                                            : <div>
                                                No Debit History
                                            </div>
                                        }
                                    </Tab>
                                </Tabs>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Wallet;
