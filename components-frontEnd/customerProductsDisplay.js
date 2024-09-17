import * as queries from 'src/graphql/queries';
import { API, graphqlOperation } from "aws-amplify";
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api';
import React, { useState, useEffect } from 'react';
import config from 'src/aws-exports';
import 'bootstrap/dist/css/bootstrap.min.css';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Placeholder from 'react-bootstrap/Placeholder';
import Accordion from 'react-bootstrap/Accordion';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
API.configure(config);

const CustomerProductsDisplay = (props) => {
    const [productsArray, setProductsArray] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showAlert, setShowAlert] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [nextToken, setNextToken] = useState(null);
    const [showFiltersModal, setShowFiltersModal] = useState(false);

    const handleCloseFiltersModal = () => setShowFiltersModal(false);
    const handleShowFiltersModal = () => setShowFiltersModal(true);

    const handleShowAlert = () => {
        setShowAlert(true);
        setTimeout(() => {
            setShowAlert(false);
        }, 3000); // hide alert after 3 seconds
    };

    const saveCartItemsToSessionStorage = (cartItems) => {
        sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
    };

    function displayPrice(price) {
        const priceFixed = Number((price / 100) * 1.5).toFixed(2);
        return priceFixed;
    }

    function fetchImageURL(product) {
        const defaultImage = "";
        if (product.systemTag) {
            const str = product.systemTag;
            const regex = /#imageURL_\((.*?)\)/;
            const match = str.match(regex);
            if (match && match.length > 1) {
                return match[1];
            } else {
                return defaultImage;
            }
        } else {
            return defaultImage;
        }

    }

    //cart and products hook
    useEffect(() => {
        const fetchProductsData = async () => {
            console.log('classification: ', props.classification);

            // classification sent in from component call; should be: SW, FW, or FE
            const variables = {
                filter: {
                    classification: { contains: props.classification },
                    amountTotal: { gt: 0 },
                },
                limit: 25,
                nextToken: nextToken
            };

            const ProductsQuery = await API.graphql({
                query: queries.listProducts,
                variables: variables,
                authMode: GRAPHQL_AUTH_MODE.API_KEY,
            });

            //const productsArray = ProductsQuery.data.listProducts.items;
            const productsArray = ProductsQuery.data.listProducts.items.filter(product => product._deleted === null); // filter out products with non-null _deleted attribute
            setProductsArray(productsArray);
            setNextToken(ProductsQuery.data.listProducts.nextToken);
            console.log('products array length: ', productsArray.length);
        };

        const storedCartItems = sessionStorage.getItem('cartItems');
        if (storedCartItems) {
            setCartItems(JSON.parse(storedCartItems));
        };

        fetchProductsData();
    }, [props.classification]);

    const loadMoreProducts = async () => {
        const variables = {
            filter: {
                classification: { contains: props.classification },
                amountTotal: { gt: 0 },
            },
            limit: 25,
            nextToken: nextToken,
        };

        const ProductsQuery = await API.graphql({
            query: queries.listProducts,
            variables: variables,
            authMode: GRAPHQL_AUTH_MODE.API_KEY,
        });

        const newProductsArray = ProductsQuery.data.listProducts.items.filter(product => product._deleted === null); // filter out products with non-null _deleted attribute
        setNextToken(ProductsQuery.data.listProducts.nextToken);
        setProductsArray(prevState => [...prevState, ...newProductsArray]);
    };

    const handleAddToCart = (item) => {

        const existingItem = cartItems.find((cartItem) => cartItem.title === item.title && cartItem.description === item.description);

        if (existingItem) {
            // item already in cart, update quantity
            const updatedCartItems = cartItems.map((cartItem) => {
                if (cartItem.id === existingItem.id) {
                    return { ...cartItem, quantity: cartItem.quantity + 1 };
                }
                return cartItem;
            });

            setCartItems([...updatedCartItems]);
            saveCartItemsToSessionStorage(updatedCartItems);
        } else {
            // item not in cart, add it
            setCartItems([...cartItems, { ...item, quantity: 1 }]);
            saveCartItemsToSessionStorage([...cartItems, { ...item, quantity: 1 }]);
        }
        handleShowAlert();

    };

    const handleSearch = async (event) => {
        event.preventDefault();
        const variables = {
            filter: {
                or: [
                    { name: { matchPhrasePrefix: searchTerm } },
                ],
            },
        };
        console.log('search term:', searchTerm);
        const ProductsQuery = await API.graphql({
            query: queries.searchProducts,
            variables: variables,
            authMode: GRAPHQL_AUTH_MODE.API_KEY,
        });
        const results = ProductsQuery.data.searchProducts.items.filter(product => product._deleted === null);
        console.log('search results: ', results);
        console.log('search results length: ', results.length);
        setSearchResults(results);
    };


    function displayProducts(product, index) {
        if (product._deleted !== null || product.name == 'test product search again' || product.name == 'test search product' || product.amountTotal < 1) {
            return;
        }
        return (
            <Col key={index}>
                <Card className='mx-1'>
                    {product ? (
                        <>
                            <Card.Header>
                                <Card.Title> {product.name} </Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <Card.Img style={{ width: 'auto', maxHeight: '20rem', maxWidth: '100%' }} variant="top" src={fetchImageURL(product)} />
                                <Accordion flush>
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>See more...</Accordion.Header>
                                        <Accordion.Body>
                                            <Card.Text>
                                                {product.description}
                                            </Card.Text>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                                <Card.Text>
                                    <u><strong>${displayPrice(product.price)}</strong></u>
                                </Card.Text>
                                <Button onClick={() => handleAddToCart(product)} className='w-50' variant="primary">Add to Cart</Button>
                            </Card.Body>
                        </>
                    ) : (
                        <Placeholder as={Card.Body} animation="glow">
                            <Placeholder xs={6} />
                            <Placeholder xs={7} />
                            <Placeholder xs={5} />
                            <Placeholder.Button xs={6} />
                        </Placeholder>
                    )}
                </Card>
            </Col>
        );
    }

    function resetButton() {
        setSearchTerm('');
        setSearchResults([]);
    }

    return (
        <div className='d-grid gap-2 w-100 text-center my-5'>
            <div className="position-relative align-content-center">
                {showAlert && (
                    <Alert variant="success" className="position-fixed top-5 start-50 translate-middle-x w-50 my-5" style={{ zIndex: 9999 }}>
                        Added to Cart!
                    </Alert>
                )}
            </div>
            <Form onSubmit={handleSearch} className='mb-3 mt-2 mx-1'>
                <Row className='align-items-center'>
                    <Col xs={6} md={8}>
                        <Form.Control
                            type='text'
                            placeholder='Search all products by name...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Col>
                    <Col xs={3} md={2}>
                        <Form.Select className='w-100'
                            onChange={(e) => (
                                setSearchTerm(''),
                                setSearchResults([]),
                                setSearchTerm(e.target.value),
                                handleSearch(e)
                            )} >
                            <option value="">Reset</option>
                            <option value="ASD">ASD</option>
                            <option value="Dennerle">Dennerle</option>
                            <option value="Sicce">Sicce</option>
                            <option value="JBJ">JBJ</option>
                            <option value="Fritz">Fritz</option>
                            <option value="Polyp">Polyplab</option>
                            <option value="V2O">V2O</option>
                        </Form.Select>

                    </Col>
                    <Col xs={3} md={2}>
                        <Button className='w-100' type='submit' variant='primary'>
                            Search
                        </Button>
                    </Col>
                </Row>
            </Form>
            {searchResults.length > 0 ? (
                <div>
                    <Row xs={1} md={2} lg={4} className='g-3'>
                        {searchResults.map(displayProducts)}
                    </Row>
                    <div className='m-2 w-100'>
                        <Button onClick={loadMoreProducts} className='w-75' variant="outline-primary">Load more</Button>
                    </div>
                </div>
            ) : productsArray.length > 0 ? (
                <div>
                    <Row xs={1} md={2} lg={4} className='g-3'>
                        {productsArray.map(displayProducts)}
                    </Row>
                    <div className='m-2 w-100'>
                        <Button onClick={loadMoreProducts} className='w-75' variant="outline-primary">Load more</Button>
                    </div>
                </div>
            ) : (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '75vh' }}>
                    <Row>
                        <p className="text-center">Currently no products in this category, come back as we update our inventory!</p>
                    </Row>
                </div>
            )}

        </div>
    );

}

export default CustomerProductsDisplay;
