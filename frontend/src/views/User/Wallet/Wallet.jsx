import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../config/axiosConfig';
import Layout from '../Header/Layout';
import { Button, Card, Form, Tab, Tabs, ListGroup } from 'react-bootstrap';
import './Wallet.css'; // Create a Wallet.css file for custom styling
import { walletValidate } from '../../../config/validateWallet';

function Wallet() {
    const [wallet, setWallet] = useState({});
    const [showAddMoney, setShowAddMoney] = useState(false);
    const [showTransfer, setShowTransfer] = useState(false);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState({})
    const [user, setUser] = useState({})
    const mainHeading = "Wallet";
    const breadcrumbs = [{ name: "Home", path: "/" }];

    useEffect(() => {
        axiosInstance.get('/user/wallet')
            .then(response => {
                if (response.data.status) {
                    console.log(response.data);
                    setWallet(response.data.wallet ? response.data.wallet[0] : {});
                    setUser(response.data.userData ? response.data.userData : {});

                }
            })
            .catch(error => {
                console.error('Error getting data:', error);
            });
    }, []);


    const initPayment = async (paymentData) => {
        console.log(paymentData);
        const options = {
            amount: paymentData.amount,
            currency: paymentData.currency,
            name: "Olegendary",
            description: "shopping",
            order_id: paymentData.id,
            handler: (response) => {
                description.length === 0 && setDescription('Adding money to wallet') 
                axiosInstance.post('/user/add-wallet', { response, amount: parseInt(amount), description, userID: user._id })
                    .then(response => {
                        if (response.data.status) {
                            let res = response.data
                            setWallet(prevWallet => ({
                                ...prevWallet,
                                balance: res.wallet.balance,
                                transactions: res.wallet.transactions
                            }));
                            setAmount('')
                            setDescription('')
                            setShowAddMoney(false)
                        }
                    })
                    .catch(error => {
                        console.error('Error getting data:', error);
                    })
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
        let Errors = walletValidate(amount, description)
        setErrors(Errors)
        if (Object.keys(Errors).length === 0) {
            
            try {
                const { data } = await axiosInstance.post('/user/payments', { amount: amount })
                initPayment(data.data)
            } catch (error) {
                console.log(error);
            }
        }
    };


    const handleTransfer = (e) => {
        e.preventDefault();
        description.length === 0 && setDescription('Transfering money to Account')
        let Errors = walletValidate(amount, description)
        setErrors(Errors)
        if (Object.keys(Errors).length === 0) {

        }
        // Transfer money to bank account
        // Implement the API call for the transfer
    };


    return (
        <div>
            <Layout mainHeading={mainHeading} breadcrumbs={breadcrumbs} />
            <div className="container mt-4">
                <div className="row">
                    <div className="col-md-6">
                        <Card>
                            <Card.Header>Wallet Balance</Card.Header>
                            <Card.Body>
                                <h3>₹{wallet ? wallet.balance : 0}</h3>
                                <Button variant="primary" onClick={() => { setShowAddMoney(!showAddMoney); setShowTransfer(false); setAmount(''); setDescription('') }}>
                                    {showAddMoney ? 'Cancel' : 'Add Money'}
                                </Button>
                                <Button variant="secondary" className="ms-2" onClick={() => { setShowTransfer(!showTransfer); setShowAddMoney(false); setAmount(''); setDescription('') }}>
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
