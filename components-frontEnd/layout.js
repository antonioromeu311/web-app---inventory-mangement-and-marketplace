import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Popover from 'react-bootstrap/Popover';
import PropTypes from 'prop-types';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import NavDropdown from 'react-bootstrap/NavDropdown';


const Layout = ({ children }) => {
    return (
        <>
            <Navbar bg="light" fixed="top" expand="lg">
                <Container>
                    <Navbar.Brand href="/"><strong>The Fish Reef</strong></Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <OverlayTrigger trigger="click" placement="bottom" overlay={
                            <Popover id="popover-basic">
                                <Popover.Header as="h3">Contact us at:</Popover.Header>
                                <Popover.Body>
                                    <strong>Email: </strong> <a href=""></a>
                                </Popover.Body>
                            </Popover>
                        }>
                            <Nav.Link className="d-none d-lg-block">Contact Us</Nav.Link>
                        </OverlayTrigger>
                    <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end">
                        <Nav>
                            <Nav.Link href="/customerLane/cartCheckout" className="d-lg-none">Cart</Nav.Link>
                            <NavDropdown title="Navigation" id="collasible-nav-dropdown">
                                <NavDropdown.Item href="/customerLane/customerSalt">Saltwater</NavDropdown.Item>
                                <NavDropdown.Item href="/customerLane/customerFresh">Freshwater</NavDropdown.Item>
                                <NavDropdown.Item href="/customerLane/customerFoodEquip">Food & Equipment</NavDropdown.Item>
                                <NavDropdown.Item disabled>Text Account Manager</NavDropdown.Item>
                                <NavDropdown.Item href="/customerLane/customerSettings">Settings and Billing</NavDropdown.Item>
                                <NavDropdown.Item href="/customerLane/customerOrders">Order Status</NavDropdown.Item>
                            </NavDropdown>
                            <Nav.Link href="/customerLane/cartCheckout" className="d-none d-lg-block">Cart</Nav.Link>
                            <OverlayTrigger trigger="click" placement="bottom" overlay={
                                <Popover id="popover-basic">
                                    <Popover.Header as="h3">Contact us at:</Popover.Header>
                                    <Popover.Body>
                                        <strong>Email: </strong> <a href=""></a>
                                    </Popover.Body>
                                </Popover>
                            }>
                                <Nav.Link className="d-lg-none">Contact Us</Nav.Link>
                            </OverlayTrigger>
                        </Nav>
                    </Navbar.Collapse>
                    
                </Container>
            </Navbar>
            {children}
        </>
    );
};

Layout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Layout;
