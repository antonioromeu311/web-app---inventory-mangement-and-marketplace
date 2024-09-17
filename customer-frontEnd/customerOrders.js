import Link from 'next/link';
import styles from '@/styles/Home.module.css'
import { Auth } from 'aws-amplify';
import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { listOrders } from '@/graphql/queries';
import * as queries from 'src/graphql/queries';
import { updateOrders } from '@/graphql/mutations';
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import moment from 'moment-timezone';
import Layout from 'src/components/layout';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { Divider } from '@aws-amplify/ui-react';
import Alert from 'react-bootstrap/Alert';

const CustomerOrders = () => {
    const [email, setEmail] = useState("");
    const [orders, setOrders] = useState([]);
    const [editingOrder, setEditingOrder] = useState(null);
    const [editedFields, setEditedFields] = useState({});
    const [confirmDisabled, setConfirmDisabled] = useState(false);
    const [isEdited, setIsEdited] = useState(false);
    const [show, setShow] = useState(false);

    function renderField(item, column) {
        if (column.key === 'edit') {
            return (
                <Button type="button" variant="info" className="w-60" onClick={() => {
                    setShow(true);
                    setEditingOrder(item);
                    setEditedFields({ ...editedFields, originalOrderNotes: item.orderNotes });
                }}>
                    Edit Order Notes
                </Button>
            );
        }
        if (column.key === 'orderNotes') {
            return <span>{renderFieldEditable(item, column)}</span>;
        }
        if (column.key === 'createdAt' || column.key === 'updatedAt') {
            const denverTime = moment(item[column.key]).tz('America/Denver').format('M/D/YY h:mm A z');
            const label = column.key === 'createdAt' ? 'Order Placed:' : 'Last Updated:';
            return <div className='text-center'><strong>{label}</strong> {denverTime}</div>;
        }
        if (column.key === 'line_items' || column.key === 'status') {
            return <span>{item[column.key]}</span>;
        }
        return <div><strong>{column.label}:</strong> {item[column.key]}</div>;
    }



    function renderFieldEditable(item, column) {
        const value = item[column.key];
        return (
            <span onClick={() => setEditingOrder(item)} className="text-primary">
                {value}
            </span>
        );
    }

    useEffect(() => {
        async function fetchUser() {
            const user = await Auth.currentAuthenticatedUser();
            const userEmail = user.attributes.email;
            setEmail(userEmail);
            fetchOrders(userEmail);
        }
        fetchUser();
    }, []);


    async function fetchOrders(userEmail) {
        try {
            const orderData = await API.graphql(graphqlOperation(listOrders, { filter: { customerEmail: { eq: userEmail } } }));
            console.log('orderData:', orderData);
            setOrders(orderData.data.listOrders.items);

        } catch (error) {
            console.log('error on fetching orders\n', error);
        }
    }
    

    function EditableField({ item, column }) {
        const [isEditing, setIsEditing] = useState(false);
        const [value, setValue] = useState(editedFields[column.key] || item[column.key]);

        function saveChanges() {
            setIsEditing(false);
            setEditedFields({ ...editedFields, [column.key]: value });
        }

        function cancelChanges() {
            setIsEditing(false);
            setEditedFields({});
        }

        if (isEditing) {
            return (
                <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={saveChanges}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            saveChanges();
                        }
                    }}
                />
            );
        } else {
            return (
                <span onClick={() => setIsEditing(true)} className="text-primary">
                    {editedFields[column.key] || item[column.key]}
                </span>
            );
        }
    }

    function onReviewChanges() {
        setShow(false);
        setIsEdited(editedFields.orderNotes !== editedFields.originalOrderNotes);
    }
    

    function onSaveChanges() {
        const updatedOrder = { ...editingOrder, ...editedFields };
        console.log("Editing Order: ", editingOrder);
        console.log("Updated Order: ", updatedOrder);
        handleUpdateOrder(updatedOrder);
    }

    useEffect(() => {
        setConfirmDisabled(editedFields.orderNotes === editingOrder?.orderNotes);
    }, [editedFields, editingOrder]);

    
    async function handleUpdateOrder(updatedOrder) {
        try {
            const updatedFields = {
                id: editingOrder.id,
                orderNotes: updatedOrder.orderNotes,
                _version: updatedOrder._version
            };
            await API.graphql(graphqlOperation(updateOrders, { input: updatedFields }));
            fetchOrders(email);
            setEditedFields({});
            setIsEdited(false); 
        } catch (err) {
            console.error('Error updating order:', err);
        } finally {
            setEditingOrder(null);  
        }
    }


    function onClose() {
        setEditingOrder(null);
        setEditedFields({});
        setIsEdited(false);
    }

    function onProgressLoading(itemStatus) {
        switch (itemStatus) {
            case 'Ordered by Customer, Pending Action':
                return 25;

            case 'Shipped by Supplier':
                return 50;

            case 'Received by Fish Reef':
                return 75;

            case 'Quarantined':
                return 85;

            case 'Delivered to Customer':
                return 100;
            default:
                return 10;
        }
    }

    function showStatus(itemStatus) {
        switch (itemStatus) {
            case 'Ordered by Customer, Pending Action':
                return 'received and being processed';

            case 'Quarantined':
                return 'in quarantine';

            case 'Shipped by Supplier':
                return 'on the way to Fish Reef';

            case 'Received by Fish Reef':
                return 'in our care and is being prepared';

            case 'Shipped to Customer, On the Way':
                return 'in transit via shipping and on the way to you';

            case 'Delivered to Customer':
                return 'in your care now, and marked as delivered';

            //should not get these, red flag that status is not being set correctly, but in case, show this
            case 'pending':
                return 'in our system';
            default:
                return 'in our system';

        }
    }

    function ReviewChangesModal({ editedFields, onSaveChanges, onClose, editingOrder, setEditingOrder }) {
        if (editedFields.orderNotes !== editedFields.originalOrderNotes) {
            return (
                <Modal show={true} onHide={onClose}>
                    <Modal.Header closeButton>
                        <Modal.Title className='text-center'>Review Changes</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Order Notes</p>
                        <p><strong>Before Edits:</strong> {editedFields.originalOrderNotes}</p>
                        <p><strong>After Edits:</strong> {!editedFields.orderNotes ? editedFields.originalOrderNotes : editedFields.orderNotes}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => {
                            onClose();
                        }}>
                            Cancel
                        </Button>
                        <Button variant="primary" disabled={confirmDisabled} onClick={onSaveChanges}>
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </Modal>
            );
        }
    }

    return (
        <>

            <Layout>
                <main className={styles.main} style={{ width: '100%' }}>
                    <div className="w-100 text-center">
                        <p className='text-center h1 no-wrap'><strong>Your Orders:</strong></p>
                        <p className='text-center'>{email}</p>
                        <hr></hr>
                    </div>
                    <div className="row row-cols-1 row-cols-md-2 g-4 py-2" >
                        {orders.filter((item) => !item._deleted).map((item) => (
                            <div className="col w-100 p-2 py-4" key={item.id} style={{ maxWidth: '500px' }}>
                                <div className="card px-5 align-items-center justify-content-center">
                                    <div className="card-body">
                                        <h5 className="card-title text-center">{item.customerName}</h5>
                                        <h6 className="card-subtitle mb-2 text-muted text-center">{item.customerEmail}</h6>
                                        <hr />
                                        <p className="card-text"><strong>Address:</strong> {item.customerAddress}</p>
                                        <p className="card-text"><strong>Notes:</strong> {renderField(item, { key: 'orderNotes', editable: true })}</p>
                                        <p className="card-text"><strong>Items:</strong> {renderField(item, { key: 'line_items' })}</p>
                                        {renderField(item, { key: 'createdAt' })}
                                        {renderField(item, { key: 'updatedAt' })}

                                    </div>
                                    <div className='w-100 text-center p-2'>
                                        {renderField(item, { key: 'edit' })}
                                    </div>
                                </div>

                                <div className="py-2" style={{ height: '5rem' }}>

                                    <ProgressBar variant="info" style={{ height: '100%' }} animated now={onProgressLoading(item.status)} />
                                    <p className="py-2 text-center"><strong>This order is currently <u>{showStatus(item.status)}!</u></strong></p>

                                    <Divider />
                                </div>

                            </div>

                        ))}
                    </div>



                    {editingOrder && (
                        <Modal show={show} onHide={() => { setIsEdited(false); }}>
                            <Modal.Header closeButton>
                                <Modal.Title>Edit Order Notes</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <div className="mb-3">
                                    <label htmlFor="orderNotes" className="form-label">Notes</label>
                                    <textarea
                                        className="form-control"
                                        id="orderNotes"
                                        rows="6"
                                        value={editedFields.orderNotes || editingOrder.orderNotes || ""}
                                        onChange={(e) => {
                                            setEditedFields({ ...editedFields, orderNotes: e.target.value });
                                        }}
                                    ></textarea>
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <button className="btn btn-secondary" onClick={() => { onClose() }}>Cancel</button>
                                <Button className="btn btn-primary" onClick={() => { onReviewChanges();}}>Review Changes</Button>
                            </Modal.Footer>
                        </Modal>
                    )}

                    {isEdited && <ReviewChangesModal editedFields={editedFields} onSaveChanges={onSaveChanges} onClose={() => setIsEdited(false)} editingOrder={editingOrder} setEditingOrder={setEditingOrder} />}

                </main>
            </Layout>
        </>
    );
}

export default CustomerOrders;