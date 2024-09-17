import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { listOrders } from '@/graphql/queries';
import * as queries from 'src/graphql/queries';
import { updateOrders } from '@/graphql/mutations';
import styles from '@/styles/Home.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import moment from 'moment-timezone';
import axios from 'axios';
import AdminRoute from 'src/components/AdminRoute';


export default function AdminUpcoming() {
    const [orders, setOrders] = useState([]);
    const [editingOrder, setEditingOrder] = useState(null);
    const [reviewChanges, setReviewChanges] = useState(false);
    const [confirmDisabled, setConfirmDisabled] = useState(false);
    const [quarantineItems, setQuarantineItems] = useState([]);


    function renderField(item, column) {
        if (column.key === 'edit') {
            return (
                <button type="button" className="btn btn-primary" onClick={() => setEditingOrder(item)}>
                    Edit
                </button>
            );
        }
        if (column.key === 'orderNotes' || column.key === 'status' || column.key === 'tags' || column.key === 'quarantine') {
            if (column.key === 'quarantine') {
                return <span>{item[column.key] ? 'true' : 'false'}</span>;
            }
            return <span>{renderFieldEditable(item, column)}</span>;
        }
        if (column.key === 'createdAt' || column.key === 'updatedAt') {
            const denverTime = moment(item[column.key]).tz('America/Denver').format('M/D/YY h:mm A z');
            const label = column.key === 'createdAt' ? 'Created At:' : 'Updated At:';
            return <p><strong>{label}</strong> {denverTime}</p>;
        }
        if (column.key === 'line_items') {
            return <span>{item[column.key]}</span>;
        }
        return <p><strong>{column.label}:</strong> {item[column.key]}</p>;
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
        fetchOrders();
    }, []);

    async function fetchOrders() {
        try {
            const orderData = await API.graphql(graphqlOperation(listOrders));

            setOrders(orderData.data.listOrders.items);

        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    }

    async function handleUpdateOrder(updatedOrder) {
        try {
            await API.graphql(graphqlOperation(updateOrders, { input: updatedOrder }));
            fetchOrders();
            setEditingOrder(null);
        } catch (err) {
            console.error('Error updating order:', err);
        }
    }
    function handleQuarantineItemsCheckbox(index) {
        const updatedQuarantineItems = [...quarantineItems];
        updatedQuarantineItems[index] = !updatedQuarantineItems[index];
        setQuarantineItems(updatedQuarantineItems);
        setConfirmDisabled(updatedQuarantineItems.every((item) => !item));
    }


    async function onSaveChanges() {
        const updatedOrder = {
            id: reviewChanges.id,
            orderNotes: reviewChanges.orderNotes,
            status: reviewChanges.status,
            tags: reviewChanges.tags,
            quarantine: reviewChanges.quarantine,
            _version: reviewChanges._version
        };
        if (reviewChanges.status == 'Delivered to Customer') {
            //send off to API
            try {
                const ordersMutationResponse = await axios.post('/api/handleOrdersMutations', {
                    customerName: reviewChanges.customerName,
                    customerEmail: reviewChanges.customerEmail,
                    customerAddress: reviewChanges.customerAddress,
                    line_items: reviewChanges.line_items[0],
                    selected_items: null
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        "x-api-key": ""
                    }
                });
                console.log('API response:', ordersMutationResponse.data);
            } catch (err) {
                console.error('Error sending data to handleOrdersMutations:', err);
            }
        }
        if (reviewChanges.quarantine !== reviewChanges.originalQuarantine && reviewChanges.quarantine) {
            // quarantine was checked from false to true
            const selected_items = splitString(reviewChanges.line_items[0]).filter((item, index) => quarantineItems[index]);
            console.log('selected_items:', selected_items);
            if (selected_items.length > 0) {
                // at least one item was selected

                try {
                    const ordesrMutationResponse = await axios.post('/api/handleOrdersMutations', {
                        customerName: reviewChanges.customerName,
                        customerEmail: reviewChanges.customerEmail,
                        customerAddress: reviewChanges.customerAddress,
                        line_items: reviewChanges.line_items[0],
                        selected_items: selected_items.join(', ')
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            "x-api-key": ""
                        }
                    });
                    console.log('API response:', ordesrMutationResponse.data);
                } catch (err) {
                    console.error('Error sending data to handleOrdersMutations:', err);
                }
            }
        }
        handleUpdateOrder(updatedOrder);
        setReviewChanges(false);
    }

    function onReviewChanges(editingOrder) {
        const originalOrder = orders.find(order => order.id === editingOrder.id);
        setReviewChanges({
            ...editingOrder,
            originalOrderNotes: originalOrder.orderNotes,
            originalStatus: originalOrder.status,
            originalTags: originalOrder.tags,
            originalQuarantine: originalOrder.quarantine,
        });
    }

    function splitString(inputString) {
        const formattedLineItems = inputString.split(", ");
        return formattedLineItems;
    }



    function ReviewChangesModal({ reviewChanges, onSaveChanges, onClose }) {
        const editedFields = [];

        if (reviewChanges.orderNotes !== reviewChanges.originalOrderNotes) {
            editedFields.push({ name: 'Order Notes', oldValue: reviewChanges.originalOrderNotes, newValue: reviewChanges.orderNotes });
        } else {
            editedFields.push({ name: 'Order Notes', oldValue: reviewChanges.originalOrderNotes, newValue: 'No changes made' });
        }

        if (reviewChanges.status !== reviewChanges.originalStatus) {
            editedFields.push({ name: 'Status', oldValue: reviewChanges.originalStatus, newValue: reviewChanges.status });
        } else {
            editedFields.push({ name: 'Status', oldValue: reviewChanges.originalStatus, newValue: 'No changes made' });
        }

        if (reviewChanges.tags !== reviewChanges.originalTags) {
            editedFields.push({ name: 'Tags', oldValue: reviewChanges.originalTags, newValue: reviewChanges.tags });
        } else {
            editedFields.push({ name: 'Tags', oldValue: reviewChanges.originalTags, newValue: 'No changes made' });
        }

        if (reviewChanges.quarantine !== reviewChanges.originalQuarantine) {
            editedFields.push({ name: 'Quarantine', oldValue: reviewChanges.originalQuarantine ? 'Yes' : 'No', newValue: reviewChanges.quarantine ? 'Yes' : 'No' });
        } else {
            editedFields.push({ name: 'Quarantine', oldValue: reviewChanges.originalQuarantine ? 'Yes' : 'No', newValue: 'No changes made' });
        }

        return (
            <Modal show={true} onHide={onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Review Changes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editedFields.length > 0 ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Field</th>
                                    <th>Old Value</th>
                                    <th>New Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {editedFields.map((field) => (
                                    <tr key={field.name}>
                                        <td>{field.name}</td>
                                        <td>{field.oldValue}</td>
                                        <td>{field.newValue}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No changes made.</p>
                    )}
                    {reviewChanges.quarantine !== reviewChanges.originalQuarantine && reviewChanges.quarantine ? (
                        <>
                            <div>
                                <Alert variant="warning"> <strong>Warning:</strong> This order will be split based on item(s) selected.</Alert>
                            </div>
                            <p>Please specify which items to be quarantined:</p>
                            <div className="mb-3">
                                {(splitString(reviewChanges.line_items[0])).map((item, index) => (
                                    <div key={item.id} className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={`quarantineItem${index}`}
                                            checked={quarantineItems[index] || false}
                                            onChange={() => handleQuarantineItemsCheckbox(index)}
                                        />
                                        <label className="form-check-label" htmlFor={`quarantineItem${index}`}>
                                            {item}
                                        </label>
                                    </div>
                                ))}

                            </div>
                        </>
                    ) : null}
                    {reviewChanges.status == 'Delivered to Customer' ? (
                        <>
                            <div>
                                <Alert variant="warning"> <strong>Warning:</strong> This will update the live inventory count. Please verify the order is delivered & finished. </Alert>
                            </div>
                        </>
                    ) : null}
                    <label className="form-text">Please be intentional and certain these are the edits to be made.</label>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={onSaveChanges} disabled={confirmDisabled}>Confirm</button>
                </Modal.Footer>

            </Modal>
        );
    }


    return (
        <AdminRoute>
            <>
                <main className={styles.main}>
                    <h1>Upcoming Orders</h1>
                    <div className="row row-cols-1 row-cols-md-2 g-4">
                        {orders.filter((item) => !item._deleted).map((item) => (
                            <div className="col" key={item.id}>
                                <div className="card">
                                    <div className="card-body">
                                        <h5 className="card-title">{item.customerName}</h5>
                                        <h6 className="card-subtitle mb-2 text-muted">{item.customerEmail}</h6>
                                        <p className="card-text"><strong>Address:</strong> {item.customerAddress}</p>
                                        <p className="card-text"><strong>Notes:</strong> {renderField(item, { key: 'orderNotes', editable: true })}</p>
                                        <p className="card-text"><strong>Status:</strong> {renderField(item, { key: 'status', editable: true })}</p>
                                        <p className="card-text"><strong>Items:</strong> {renderField(item, { key: 'line_items' })}</p>
                                        <p className="card-text"><strong>Tags:</strong> {renderField(item, { key: 'tags', editable: true })}</p>
                                        <p className="card-text"><strong>Quarantine:</strong> {renderField(item, { key: 'quarantine', editable: true })}</p>
                                        {renderField(item, { key: 'createdAt' })}
                                        {renderField(item, { key: 'updatedAt' })}
                                        {renderField(item, { key: 'edit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <h2>
                        <Link href="/adminLane/adminLogin">Back to Home</Link>
                    </h2>

                    {editingOrder && (
                        <Modal show={true} onHide={() => setEditingOrder(null)}>
                            <Modal.Header closeButton>
                                <Modal.Title>Edit Order</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <div className="mb-3">
                                    <label htmlFor="orderNotes" className="form-label">Notes</label>
                                    <textarea className="form-control" id="orderNotes" rows="3" value={editingOrder.orderNotes} onChange={(e) => setEditingOrder({ ...editingOrder, orderNotes: e.target.value })}></textarea>
                                    <label className="form-text">These are notes editable and viewable both by employees and customer.</label>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="status" className="form-label">Status</label>
                                    <select className="form-select" id="status" value={editingOrder.status} onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}>
                                        <option value="Ordered by Customer, Pending Action">Ordered by Customer, Pending Action</option>
                                        <option value="Shipped by Supplier">Shipped by Supplier</option>
                                        <option value="Recieved by Fish Reef">Recieved by Fish Reef</option>
                                        <option value="Shipped to Customer, On the Way">Shipped to Customer, On the Way</option>
                                        <option value="Delivered to Customer">Delivered to Customer</option>
                                        <option disabled value="Quarantined">Quarantined</option>
                                    </select>
                                    <label className="form-text">Status to be viewed by customer for order tracking</label>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="tags" className="form-label">Tags</label>
                                    <input type="text" className="form-control" id="tags" value={editingOrder.tags} onChange={(e) => setEditingOrder({ ...editingOrder, tags: e.target.value })} />
                                    <label className="form-text">Prefix tracking tag with # and separate with space if multiple tags. Example: #Smith #Johnson</label>
                                </div>
                                <div className="mb-3 form-check">
                                    <input type="checkbox" className="form-check-input" id="quarantine" checked={editingOrder.quarantine} onChange={(e) => setEditingOrder({ ...editingOrder, quarantine: e.target.checked })} />
                                    <label className="form-check-label" htmlFor="quarantine">Quarantine</label>
                                </div>
                            </Modal.Body>

                            <Modal.Footer>
                                <button className="btn btn-secondary" onClick={() => setEditingOrder(null)}>Cancel</button>
                                <button className="btn btn-primary" onClick={() => { onReviewChanges(editingOrder); setEditingOrder(null); }}>Review Changes</button>
                            </Modal.Footer>
                        </Modal>
                    )}

                    {reviewChanges && (
                        <ReviewChangesModal
                            reviewChanges={reviewChanges}
                            onSaveChanges={onSaveChanges}
                            onClose={() => setReviewChanges(false)}
                        />
                    )}

                </main>
            </>
        </AdminRoute>
    );
}
