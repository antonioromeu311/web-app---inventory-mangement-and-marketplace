require('dotenv').config();
import Link from 'next/link';
import styles from '@/styles/Home.module.css'
import * as queries from 'src/graphql/queries';
import { API } from "aws-amplify";
import config from 'src/aws-exports'
API.configure(config);
import 'bootstrap/dist/css/bootstrap.min.css';
ing, StepperField
import React, { useState, useEffect } from 'react';
import Layout from 'src/components/layout';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import Spinner from 'react-bootstrap/Spinner';



const CartCheckoutPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [buttonLoading, setButtonLoading] = useState(false);

    async function handleSubmit(cartItems) {
        setButtonLoading(true);
        console.log(cartItems);
        try {
            const response = await fetch('/api/prepCheckout', {
                method: 'POST',
                body: JSON.stringify(cartItems),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            window.location.href = data.url;
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setButtonLoading(false);
        }
    }

    useEffect(() => {
        const storedCartItems = JSON.parse(sessionStorage.getItem('cartItems')) || [];
        setCartItems(storedCartItems);
    }, []);

    useEffect(() => {
        setButtonDisabled(cartItems.length === 0);
    }, [cartItems]);

    const handleQuantityChange = (index, quantity) => {
        const updatedCartItems = [...cartItems];
        updatedCartItems[index].quantity = quantity;
        setCartItems(updatedCartItems);
        sessionStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
    };

    const handleRemoveItem = (index) => {
        const updatedCartItems = [...cartItems];
        updatedCartItems.splice(index, 1);
        setCartItems(updatedCartItems);
        sessionStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
    };

    const handlePrice = (price) => {
        const priceFixed = Number((price / 100) * 1.5).toFixed(2);
        return priceFixed;
    }

    const getCartSummary = () => {
        let itemCount = 0;
        
        for (let i = 0; i < cartItems.length; i++) {
            itemCount += parseInt(cartItems[i].quantity);
        }
        const total = cartItems.reduce((acc, item) => acc + (handlePrice(item.price) * item.quantity), 0);
        return `${itemCount} item(s), $${total.toFixed(2)}`;
    }

    return (
        <Layout>
            <main >
                <Container className="my-5 py-5">
                    <Row className="justify-content-center">
                        {cartItems.length > 0 ? (
                            cartItems.map((item, index) => (
                                <Col xs={12} md={6} lg={4} className="mb-4" key={index}>
                                    <Card>
                                        <Card.Img variant="top" src="" />
                                        <Card.Body>
                                            <Card.Title className='text-center'>{item.name}</Card.Title>
                                            <Form.Group>
                                                <Form.Label className=''>Quantity</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min={1}
                                                    defaultValue={item.quantity}
                                                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                />
                                            </Form.Group>
                                            <Card.Text className='text-center my-2'>
                                                <strong>${handlePrice(item.price)} x {item.quantity}</strong>
                                            </Card.Text>
                                            <Card.Text className='text-center my-2'>
                                                <strong>Subtotal: ${(handlePrice(item.price) * item.quantity).toFixed(2)}</strong>
                                            </Card.Text>
                                            <Button variant="danger" className='w-100 my-2' onClick={() => handleRemoveItem(index)}>
                                                Remove from Cart
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col xs={12} className="text-center my-3">
                                <h4>Loading cart items... Nothing coming up? Add to cart now!</h4>
                                <Spinner animation="border" className='my-5' variant='primary'/>
                            </Col>
                        )}
                    </Row>
                    <Row className="justify-content-center text-center">
                        <Col xs={12} md={6}>
                            <Button
                                className='my-3 w-100 gap-2'
                                variant="success"
                                size="lg"
                                disabled={buttonDisabled || buttonLoading}
                                onClick={() => handleSubmit(cartItems)}
                            >
                                {buttonLoading || buttonDisabled ? 'Loading...' : `Checkout Cart: ${getCartSummary()}`}
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </main>
        </Layout>
    );
};

export default CartCheckoutPage;
