import { Auth } from 'aws-amplify';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import useConnection from './useConnection';
import styles from '@/styles/Home.module.css'
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { API } from "aws-amplify";
import config from 'src/aws-exports'
import * as mutations from 'src/graphql/mutations';
import * as queries from 'src/graphql/queries';
API.configure(config);

async function handleNewConnection(email, shop) {
    //delete any possible previous connections for this shop
    //nameQBO = shop, realmID = email, refreshToken = shopify_connection_profile, accessToken = connection status
    const deleteVariables = {
        filter: {
            nameQBO: {
                eq: shop
            },
            realmID: {
                eq: email
            },
            refreshToken: {
                eq: 'shopify_connection_profile'
            }
        }
    }
    try {
        const connections = await API.graphql({
            query: queries.listQBOtokens,
            variables: deleteVariables,
            authMode: 'API_KEY'
        });
        const connectionsArray = connections.data.listQBOtokens.items;
        console.log('connectionsArray:', connectionsArray);

        for (const connection of connectionsArray) {
            if (connection._deleted !== null) {
                continue;
            }
            console.log('connection to be deleted:', connection);
            const deleteInput = {
                input: {
                    id: connection.id,
                    _version: connection._version
                }
            }
            const deleteConnection = await API.graphql({
                query: mutations.deleteQBOtokens,
                variables: deleteInput,
                authMode: 'API_KEY'
            });
            console.log('deleteConnection: ', deleteConnection.data.deleteQBOtokens._deleted);
        }
    } catch (error) {
        console.error('Error deleting past connections found in database:', error);
        return error;
    }

    //create new connection
    const newConnection = {
        accessToken: 'connected',
        realmID: email,
        refreshToken: 'shopify_connection_profile',
        nameQBO: shop,
    };

    try {
        const createConnection = await API.graphql({
            query: mutations.createQBOtokens,
            variables: { input: newConnection },
            authMode: 'API_KEY'
        });
        console.log('createConnection: ', createConnection.data.createQBOtokens);
        return createConnection.data.createQBOtokens;
    } catch (error) {
        console.error('Error creating new connection profile in database:', error);
        return error;
    }
}



export default function ConnectAccount() {

    const shopName = new URLSearchParams(window.location.search).get('shopName');
    const shop = shopName + '.myshopify.com';

    const [email, setEmail] = useState("");
    const { connected, setConnected, checkConnectionStatus } = useConnection(shopName);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        checkConnectionStatus();
    }, [checkConnectionStatus]);

    const handleCheckboxChange = (event) => {
        setChecked(event.target.checked);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        //setConnectionStatus('connecting');
        const newConnection = await handleNewConnection(email, shop);
        if (newConnection) {
            setConnected(true);
            alert('Your Fish Reef account is now connected to your Shopify shop, you may return to your Shopify shop to import products.');
        } else {
            setConnected(false);
        }
    };



    useEffect(() => {
        async function fetchUser() {
            const user = await Auth.currentAuthenticatedUser();
            const userEmail = user.attributes.email;
            setEmail(userEmail);
        }
        fetchUser();

    }, [email]);




    return (
        <main className={styles.main}>
            <div>
                <Tabs
                    style={{ width: '100%' }}
                    defaultActiveKey="Account"
                    fill
                    className="mb-3"
                >
                    <Tab eventKey="Account" title="Account">
                        {(() => {

                            if (connected) {
                                return <ConnectedUI />;
                            } else {
                                return <DisconnectedUI />;
                            }
                        })()}
                    </Tab>
                    <Tab eventKey="Settings" title="Settings">
                        <div style={{ width: '100%' }}>
                            <h4>{email} --- {shop} --- {connected ? 'Connected' : 'Not Connected'}</h4>
                            <hr />
                            <Button onClick={() => Auth.signOut()} variant="warning" >
                                Sign Out
                            </Button>
                            <hr />
                            <Button variant="danger" disabled >
                                Disconnect Fish Reef Account & Pull *ALL* Products Linked **IRREVERSIBLE**
                            </Button>
                            <p>This will disconnect your Fish Reef account email from being linked with your Shopify shop.
                                This will not delete your Fish Reef account, but it
                                will remove the connection between your Fish Reef account and your Shopify shop. It will pull
                                all of your products from our site and remove them from being tied your Fish Reef account.
                            </p>
                            <hr />
                        </div>
                    </Tab>
                </Tabs>
            </div>
        </main>
    );

   

    function ConnectedUI() {
        return (
            <>
                <hr />
                <Card>
                    <Card.Body>
                        <Card.Title>Connected</Card.Title>
                        <Card.Text>
                            Your Fish Reef account is connected to your Shopify shop.
                        </Card.Text>
                        <Card.Text>
                            Email: {email}
                        </Card.Text>
                        <Card.Text>
                            Shopify Shop: {shop}
                        </Card.Text>
                        <Card.Text>
                            Connection Status: {connected ? 'Connected' : 'Not Connected'}
                        </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                        <Card.Text>
                            To edit your connection, visit the Settings tab.
                        </Card.Text>
                    </Card.Footer>
                </Card>
            </>
        );
    };

    function DisconnectedUI() {
        return (
            <>
                <hr />
                <h6>This connection will tie your Fish Reef account with your Shopify shop.
                    This will tag the products you upload as yours, for future data privacy and security.
                    This way when you want to edit your connection from our site, you can do so easily and thoroughly.
                </h6>
                <hr />
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control disabled type="email" defaultValue={email} />
                        <Form.Text className="text-muted">
                            The Fish Reef account email that will be tied to your Shopfiy Shop
                        </Form.Text>
                    </Form.Group>
                    <hr />
                    <Form.Group>
                        <Form.Label>Shopify Shop</Form.Label>
                        <Form.Control disabled type="text" defaultValue={shop} />
                        <Form.Text className="text-muted">
                            This is the name of your Shopify store.
                        </Form.Text>
                    </Form.Group>
                    <hr />
                    <Form.Group>
                        <Form.Check type="checkbox" label="Yes, the information shown is accurate and what I want to use to connect"
                            checked={checked}
                            onChange={handleCheckboxChange} />
                    </Form.Group>
                    <hr />
                    <Form.Group>
                        <Button variant="primary" type="submit" disabled={!checked}>
                            Connect
                        </Button>
                    </Form.Group>
                </Form>
            </>
        );
    }
}
