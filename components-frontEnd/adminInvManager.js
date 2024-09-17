import * as queries from 'src/graphql/queries';
import { API, graphqlOperation } from "aws-amplify";
import { updateProducts } from '@/graphql/mutations';
import config from 'src/aws-exports'
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import FormGroup from 'react-bootstrap/FormGroup';
import Alert from 'react-bootstrap/Alert';

API.configure(config);
//check for inv count add up, add guardrail
const AdminInvManager = (props) => {
    const [productsArray, setProductsArray] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showReviewChangesModal, setShowReviewChangesModal] = useState(false);
    const [disableConfirmButton, setDisableConfirmButton] = useState(true);
    const [updatedProductFields, setUpdatedProductFields] = useState({
        name: null,
        description: null,
        price: null,
        classification: props.classification,
        amountOnHand: null,
        amountCommit: null,
        amountTotal: null,
        systemTag: null,
    });

    useEffect(() => {
        const fetchProductsData = async () => {
            const variables = {
                filter: {
                    classification: {
                        eq: props.classification // sent in from component call; should be: SW, FW, FE, OT
                    }
                }
            };

            const ProductsQuery = await API.graphql({
                query: queries.listProducts,
                variables: variables
            });

            setProductsArray(ProductsQuery.data.listProducts.items);
        };

        fetchProductsData();
    }, [props.classification]);

    useEffect(() => {
        const results = productsArray.filter((product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(results);
    }, [productsArray, searchTerm]);

    function displayPrice(price, type) {
        const formattedPrice = Number((price / 100).toFixed(2));
        if (type === 'retail' && props.classification === 'FE') {
            return Number((formattedPrice * 1.35).toFixed(2));
        } else if (type === 'wholesale') {
            return formattedPrice;
        } else if (type === 'retail' && props.classification !== 'FE') {
            return Number((formattedPrice * 1.5).toFixed(2));
        } else {
            return 'error in price formatting';
        }
    }

    const handleSearch = (event) => {
        event.preventDefault();
        const results = productsArray.filter((product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(results);
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setUpdatedProductFields({
            name: product.name,
            description: product.description,
            price: product.price,
            classification: product.classification,
            amountOnHand: product.amountOnHand,
            amountCommit: product.amountCommit,
            amountTotal: product.amountTotal,
            systemTag: product.systemTag,
        });
        setShowModal(true);
    };


    const handleCloseModal = () => {
        setDisableConfirmButton(true);
        setShowReviewChangesModal(false)
        setShowModal(false);
        setSelectedProduct(null);
        setUpdatedProductFields({
            name: null,
            amountOnHand: null,
            amountCommit: null,
            amountTotal: null,
            price: null,
            classification: props.classification,
            amountOnHand: null,
            amountCommit: null,
            amountTotal: null,
            systemTag: null,
        });
    };

    const handleFieldChange = (event) => {
        const { name, value } = event.target;
        setUpdatedProductFields((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleReviewChanges = () => {
        setShowReviewChangesModal(true);
        setShowModal(false);
    };

    const handleConfirmUpdate = async () => {
        const updateProductMutation = {
            id: selectedProduct.id,
            name: updatedProductFields.name || selectedProduct.name,
            description: updatedProductFields.description || selectedProduct.description,
            price: updatedProductFields.price || selectedProduct.price,
            classification: props.classification,
            amountOnHand: updatedProductFields.amountOnHand || selectedProduct.amountOnHand,
            amountCommit: updatedProductFields.amountCommit || selectedProduct.amountCommit,
            amountTotal: updatedProductFields.amountTotal || selectedProduct.amountTotal,
            systemTag: updatedProductFields.systemTag || selectedProduct.systemTag,
            _version: selectedProduct._version,
        };


        try {
            await API.graphql(graphqlOperation(updateProducts, { input: updateProductMutation }));

            console.log('Product successfully updated!');
            // update the local state with the updated product fields
            setProductsArray((prevState) =>
                prevState.map((product) =>
                    product.id === selectedProduct.id ? { ...product, ...updatedProductFields } : product
                )
            );
        } catch (error) {
            console.error('Error updating product:', error);
        }


        handleCloseModal();
        setShowReviewChangesModal(false);
    };


    return (
        <div className='d-grid gap-2 w-100 text-center'>
            <Form onSubmit={handleSearch} className='mb-3'>
                <Row className='align-items-center'>
                    <Col xs={9} md={10}>
                        <Form.Control
                            type='text'
                            placeholder='Search products name...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Col>
                    <Col xs={3} md={2}>
                        <Button type='submit' variant='primary'>
                            Search
                        </Button>
                    </Col>
                </Row>
            </Form>
            {searchResults.length > 0 ? (
                <Row xs={1} md={2} lg={3} className='g-4'>
                    {searchResults.map((product, index) => (
                        <Col key={index}>
                            <Card>
                                <Card.Header>{product.name}</Card.Header>
                                <ListGroup variant="flush">
                                    <ListGroup.Item>Description: {product.description}</ListGroup.Item>
                                    <ListGroup.Item>Amount On Hand: {product.amountOnHand}</ListGroup.Item>
                                    <ListGroup.Item>Amount Committed: {product.amountCommit}</ListGroup.Item>
                                    <ListGroup.Item>Amount Total: {product.amountTotal}</ListGroup.Item>
                                    <ListGroup.Item>Wholesale Price: ${displayPrice(product.price, 'wholesale')}</ListGroup.Item>
                                    <ListGroup.Item>Retail Price: ${displayPrice(product.price, 'retail')}</ListGroup.Item>
                                    <ListGroup.Item>System Tag: {product.systemTag}</ListGroup.Item>
                                </ListGroup>
                                <Card.Body>
                                    <Button onClick={() => handleEdit(product)} className='w-50' variant="primary">Edit</Button>
                                    <Button className='w-50' variant="danger">Delete</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <div>
                    <p>No products found</p>
                </div>
            )}
            {selectedProduct && (
                <Modal show={showModal} onHide={handleCloseModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit: {selectedProduct.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedProduct && (
                            <div>
                                <FormGroup controlId="forName">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={updatedProductFields.name}
                                        onChange={handleFieldChange}
                                    />
                                </FormGroup>
                                <FormGroup controlId="forDescription">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="description"
                                        value={updatedProductFields.description}
                                        onChange={handleFieldChange}
                                    />
                                </FormGroup>
                                <FormGroup controlId="forPrice">
                                    <Form.Label>Wholesale Price ; $25.00 = 2500, simply no decimal or $</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="price"
                                        value={updatedProductFields.price}
                                        onChange={handleFieldChange}
                                    />
                                    <Form.Label>
                                        Retail Price = ${
                                            !updatedProductFields.price
                                                ? displayPrice(selectedProduct.price, 'retail')
                                                : displayPrice(updatedProductFields.price, 'retail')
                                        }
                                    </Form.Label>
                                </FormGroup>
                                <Form.Group controlId="forAmountOnHand">
                                    <Form.Label>Amount On Hand</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="amountOnHand"
                                        value={updatedProductFields.amountOnHand}
                                        onChange={handleFieldChange}
                                    />
                                </Form.Group>
                                <Form.Group controlId="forAmountCommit">
                                    <Form.Label>Amount Committed</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="amountCommit"
                                        value={updatedProductFields.amountCommit}
                                        onChange={handleFieldChange}
                                    />
                                </Form.Group>
                                <Form.Group controlId="forAmountTotal">
                                    <Form.Label>Amount Total</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="amountTotal"
                                        value={updatedProductFields.amountTotal}
                                        onChange={handleFieldChange}
                                    />
                                </Form.Group>
                                <Form.Group controlId="forSystemTag">
                                    <Form.Label>System Tag</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="systemTag"
                                        value={updatedProductFields.systemTag}
                                        onChange={handleFieldChange}
                                    />
                                </Form.Group>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handleReviewChanges}>
                            Review Changes
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
            {selectedProduct && (
                <Modal show={showReviewChangesModal} onHide={() => setShowReviewChangesModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Review Changes: {selectedProduct.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {Object.keys(updatedProductFields).map((field) => {
                            if (selectedProduct[field] !== updatedProductFields[field] && updatedProductFields[field]) {
                                if (disableConfirmButton) setDisableConfirmButton(false); 
                                return (
                                    <ListGroup.Item key={field}>
                                        <strong>{field}:</strong>
                                        <br />
                                        Current Value: {selectedProduct[field]}
                                        <br />
                                        Proposed Value: {updatedProductFields[field]}
                                    </ListGroup.Item>
                                );
                            }
                            return null;
                        })}
                    </Modal.Body>
                    <Modal.Footer>
                        <Alert show={disableConfirmButton} variant="warning">Be certain of these changes, they cannot be auto-reverted!</Alert>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Close
                        </Button>
                        <Button variant="primary" disabled={disableConfirmButton} onClick={handleConfirmUpdate}>
                            Confirm Edits
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default AdminInvManager;
