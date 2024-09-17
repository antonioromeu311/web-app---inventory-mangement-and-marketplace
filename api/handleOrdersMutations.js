require('dotenv').config();
import { API, graphqlOperation } from "aws-amplify";
import config from 'src/aws-exports'
import * as mutations from 'src/graphql/mutations';
import * as queries from 'src/graphql/queries';
API.configure(config);
import axios from 'axios';


export default async function handler(req, res) {

    function formatLineItems(inputString) {
        const lineItems = [];
        const items = inputString.toString().split(", ");

        items.forEach(item => {
            const match = item.match(/^(.*) x \((\d+)\)$/);

            if (match) {
                const productName = match[1].trim();
                const quantity = parseInt(match[2]);

                lineItems.push({ productName, quantity });
            }
        });

        return lineItems;
    }

    if (req.method == 'POST') {
        console.log('handle orders mutations handler called');

        const { customerName, customerEmail, customerAddress, line_items,
            selected_items } = req.body;


        try {
            console.log('-------------------');
            console.log('before updating order');
            console.log('customerName: ' + customerName);
            console.log('customerEmail: ' + customerEmail);
            console.log('customerAddress: ' + customerAddress);
            console.log('line_items: ' + line_items);
            console.log('selected_items: ' + selected_items);

            const varsQuery = {
                filter: {
                    customerName: { eq: customerName },
                    customerEmail: { eq: customerEmail },
                    customerAddress: { eq: customerAddress },
                }
            };
            const orderData = await API.graphql({
                query: queries.listOrders,
                variables: varsQuery
            });

            const orderAWS = orderData.data.listOrders.items[0];

            // console.log('orderData: ' + JSON.stringify(orderData));
            // let orderAWS = null;
            // for (const order of orderData.data.listOrders.items) {
            //     if (order.line_items[0] == line_items[0] && !order._deleted) {
            //         orderAWS = order; 
            //     }
            // }
            // if (!orderAWS) { 
            //     return res.status(500).json({ message: 'Could not locate order in database' });
            // }

            //to avoid null writeten error
            let notes = '';
            if (orderAWS.orderNotes !== null) {
                notes = orderAWS.orderNotes;
            }


            //if order status is delivered, then update the line items commit and total amounts
            if (orderAWS.status == 'Delivered to Customer') {
                console.log('Order status is delivered, updating inventory database count...');
                //format line items for mutation
                const lineItemsFormatted = formatLineItems(orderAWS.line_items);
                console.log('lineItemsFormatted: ' + JSON.stringify(lineItemsFormatted));
                const responseProductMutate = await axios.post('', {
                    lineItems: lineItemsFormatted
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        "x-api-key": "da2-lyrppsviqbhdzm43f7g7lmwsi4",
                        'order-mutations': 'true'
                    }
                });
                if (responseProductMutate && responseProductMutate.status == 200) {
                    res.status(200).json({ message: 'Order delivered to customer, successfully updated inventory!' });
                } else {
                    res.status(500).json({ message: 'Error updating inventory database count' });
                }


            }

            if (orderAWS.quarantine && orderAWS.status !== 'Quarantined' || selected_items !== null) {
                //split order by selected quarantine items
                //create new order for quarantine items
                //create new order for remaining items
                //delete original order

                console.log('Order is quarantined, splitting order...');
                const today = new Date();
                const day = today.getDate();
                const month = today.getMonth() + 1; // getMonth() returns 0-indexed months, so + 1 = the correct month
                const startDate = month + '/' + day + '/' + today.getFullYear();

                const quarantineOrder = {
                    input: {
                        customerName: orderAWS.customerName + ' (Quarantine)',
                        customerEmail: orderAWS.customerEmail,
                        customerAddress: orderAWS.customerAddress,
                        orderNotes: notes + '\nStarting quarantine on ' + startDate + ' for: ' + selected_items,
                        status: 'Quarantined',
                        line_items: selected_items,
                        quarantine: true,
                        tags: orderAWS.tags
                    }
                };

                const newQuarantineOrder = await API.graphql({
                    query: mutations.createOrders,
                    variables: quarantineOrder
                });

                if (newQuarantineOrder && !newQuarantineOrder.errors) {
                    console.log('New quarantine order created successfully');
                }

                if (orderAWS.line_items[0] == selected_items) {
                    const deleteInput = {
                            input: {
                                id: orderAWS.id,
                                _version: orderAWS._version
                            }
                        };
                        const deletionResult = await API.graphql({
                            query: mutations.deleteOrders,
                            variables: deleteInput
                        });
                        if (deletionResult && !deletionResult.errors) {
                            console.log('Order successfully deleted: ' + JSON.stringify(deletionResult));
                            res.status(200).json({ message: 'Order successfully mutated!' });
                        }
                }
                //new order with remaining items
              
                const lineItemsArray = orderAWS.line_items[0].split(", ");
                const selectedItemsArray = selected_items.split(", ");

                // filter remaining items
                const remainingItems = lineItemsArray.filter(item => !selectedItemsArray.includes(item));

                console.log('remainingItems: ' + remainingItems);
                const newNonQuarantineOrder = {
                    input: {
                        customerName: orderAWS.customerName + ' (Not Quarantined)',
                        customerEmail: orderAWS.customerEmail,
                        customerAddress: orderAWS.customerAddress,
                        orderNotes: notes + '\nOrder split due to quarantined items. Items without quarantine: ' + remainingItems,
                        status: orderAWS.status,
                        line_items: remainingItems,
                        quarantine: false,
                        tags: orderAWS.tags
                    }
                };
                const orderNonQuarantine = await API.graphql({
                    query: mutations.createOrders,
                    variables: newNonQuarantineOrder
                });
                if (orderNonQuarantine && !orderNonQuarantine.errors) {
                    console.log('New non quarantine order created successfully');
                }

                if (orderNonQuarantine && !orderNonQuarantine.errors && newQuarantineOrder && !newQuarantineOrder.errors) {

                    try {
                        const deleteInput = {
                            input: {
                                id: orderAWS.id,
                                _version: orderAWS._version
                            }
                        };
                        const deletionResult = await API.graphql({
                            query: mutations.deleteOrders,
                            variables: deleteInput
                        });
                        if (deletionResult && !deletionResult.errors) {
                            console.log('Order successfully deleted: ' + JSON.stringify(deletionResult));
                        }
                    } catch (error) {
                        console.log('Error occurred while attempting to delete order: ' + JSON.stringify(error));
                        res.status(500).json({ message: 'Error occurred while attempting to delete order: ' + error.message });
                        return;
                    } res.status(200).json({ message: 'Order successfully mutated!' });
                }

            }

            if (!orderAWS.quarantine && orderAWS.status !== 'Delivered to Customer') {
                res.status(200).json({ message: 'Order did not qualify for either quarantine edits or delivered to customer edits. Returning back the OK.' });
            }
        } catch (error) {
            console.log('Error occurred while attempting to mutate order: ' + error.message);
            res.status(500).json({ message: 'Error occurred while attempting to mutate order: ' + error.message });
            return;
        }


    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }
}
