import Head from 'next/head'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import Link from 'next/link';
import '@aws-amplify/ui-react/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import React, { useEffect, useState } from 'react';
import Image from 'react-bootstrap/Image'
import Layout from '../components/layout';
const inter = Inter({ subsets: ['latin'] })

const Home = ({ signOut }) => {

  return (
        <Layout>
          <main>
            <Container fluid>
              <Row className="justify-content-center">
                <Col xs={12} md={8} lg={6} className="text-center">
                  <Image
                    src=""
                    alt="Fish Reef Logo"
                    fluid
                    rounded
                    className='mt-5'
                  />
                </Col>
              </Row>
              <Row className="justify-content-center mt-1">
                <Col xs={12} sm={6} md={6} lg={6} className="mb-4">
                  <Card border="primary" bg="light" className="h-100" onClick={() => window.location.href = "/customerLane/customerSalt"}>
                    <Card.Body>
                      <Card.Title className='text-center'>Saltwater Species</Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12} sm={6} md={6} lg={6} className="mb-4">
                  <Card border="primary" bg="light" className="h-100" onClick={() => window.location.href = "/customerLane/customerFresh"}>
                    <Card.Body>
                      <Card.Title className='text-center'>Freshwater Species</Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12} sm={6} md={6} lg={6} className="mb-4">
                  <Card border="primary" bg="light" className="h-100" onClick={() => window.location.href = "/customerLane/customerFoodEquip"}>
                    <Card.Body>
                      <Card.Title className='text-center'>Food & Equipment</Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12} sm={6} md={6} lg={6} className="mb-4">
                  <Card border="primary" bg="light" className="h-100">
                    <Card.Body>
                      <Card.Title className='text-center'>Text Account. Manager</Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12} sm={6} md={6} lg={6} className="mb-4">
                  <Card border="primary" bg="light" className="h-100" onClick={() => window.location.href = "/customerLane/customerSettings"}>
                    <Card.Body>
                      <Card.Title className='text-center'>Settings & Billing</Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12} sm={6} md={6} lg={6} className="mb-4">
                  <Card border="primary" bg="light" className="h-100" onClick={() => window.location.href = "/customerLane/customerOrders"}>
                    <Card.Body>
                      <Card.Title className='text-center'>Order Status</Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <Row className="justify-content-center">
                <Col xs={12} sm={6} md={4} lg={3}>
                  <Button className="w-100 my-2" variant="danger" onClick={signOut}>Sign Out</Button>
                </Col>
              </Row>
            </Container>
          </main>
        </Layout>
  
  );
};

export default function HomePage(props) {
  const { signOut } = props;

  return <Home signOut={signOut} />;
}
