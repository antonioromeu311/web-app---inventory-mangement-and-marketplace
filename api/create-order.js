require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
import { API } from "aws-amplify";
import config from 'src/aws-exports'
import * as mutations from 'src/graphql/mutations';
API.configure(config);

function formatAddress(address) {
    const { city, country, line1, line2, postal_code, state } = address;
    let formattedAddress = `${line1}, ${city}, ${state} ${postal_code}, ${country}`;
    if (line2) {
        formattedAddress = `${line1}, ${line2}, ${city}, ${state} ${postal_code}, ${country}`;
    }
    return formattedAddress;
}

function formatLineItems(lineItems) {
    let formattedLineItems = '';
    for (const lineItem of lineItems) {
        formattedLineItems += `${lineItem.productName} x (${lineItem.quantity}), `;
    }
    formattedLineItems = formattedLineItems.slice(0, -2);
    return formattedLineItems;
}
export default async function handler(req, res) {
    if (req.method === 'POST') {
        console.log('create order handler called');
        const { customerName, customerEmail, customerAddress, lineItems_Products } = req.body;
        const formattedAddress = formatAddress(customerAddress);
        const formattedLineItems = formatLineItems(lineItems_Products);

        console.log('customerName: ' + customerName);
        console.log('customerEmail: ' + customerEmail);
        console.log('customerAddress stringified: ' + JSON.stringify(customerAddress));
        console.log(`lineItems_Products stringified: ${JSON.stringify(lineItems_Products)}`);
        console.log('formattedAddress: ' + formattedAddress);
        console.log('formattedLineItems: ' + formattedLineItems);

        try {
            // customerName, customerEmail, customerAddress, orderNotes, status, 
            //line_items
            console.log('defining order...');
            const order = {
                customerName: customerName,
                customerEmail: customerEmail,
                customerAddress: formattedAddress,
                status: 'Ordered by Customer, Pending Action',
                line_items: formattedLineItems,
                quarantine: false
            }

            console.log('order defined, now creating order...');

            const newOrder = await API.graphql({
                query: mutations.createOrders,
                variables: { input: order }
            });

            console.log(order);
            console.log('order created, now returning response...');
            res.status(200).json({ message: 'Order created successfully' });
            return;
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while creating the order ' + error });
        }
    }

    else {
        // Handle any other HTTP method
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }

}