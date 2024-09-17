require('dotenv').config();
import axios from 'axios';


async function prepLineItems(lineItems) {
    console.log('prepLineItems function called...');
    const lineItems_Products = [];
    try {
        for (const lineItem of lineItems) {
            console.log('starting instance of line items...');
            const productName = lineItem.description;
            const quantity = lineItem.quantity;
            console.log('productName: ' + productName);
            console.log('quantity: ' + quantity);
            lineItems_Products.push({
                productName: productName,
                quantity: quantity
            });
        };
    } catch (error) {
        console.log('error while stepping through line items\nerror: ' + error);
    }

    console.log('lineItems_Products:\n', lineItems_Products);
    if (lineItems_Products.length > 0) {
        return lineItems_Products;
    } else {
        console.log('lineItems_Products.length <= 0');
        return [];
    }
}

async function productMutations(lineItems_Products) {
    console.log('productMutations function called...');
    try {
        console.log('before fetch to handleMutations');
        console.log('lineItems_Products:\n', lineItems_Products);
        const response = await axios.post(``, {
            lineItems: lineItems_Products
        }, {
            headers: {
                'Content-Type': 'application/json',
                "x-api-key": ""
            },
            timeout: 30000
        });
        
        console.log('after fetch to handleMutations');

        if (response && response.status == 200) {
            console.log('SUCCESSFUL MUTATION');
            console.log(response.status);
        } else {
            console.log('FAILED MUTATION');
            console.log(response.status);
        }

        console.log('after fetch to handleMutations');
    } catch (error) {
        console.log('error while fetching to handleMutations' + error);
    }
}

async function orderCreation(customerName, customerEmail, customerAddress, lineItems_Products) {
    try {
        console.log('orderCreation function called...');
        console.log('customerEmail:\n', customerEmail);
        console.log('customerName:\n', customerName);
        console.log('customerAddress:\n', customerAddress);
        console.log('lineItems_Products:\n', lineItems_Products);
        const orderResponse = await axios.post(``, {
            customerName: customerName,
            customerEmail: customerEmail,
            customerAddress: customerAddress,
            lineItems_Products: lineItems_Products
        }, {
            headers: {
                'Content-Type': 'application/json',
                "x-api-key": ""
            },
            timeout: 30000
        });
       
        if (orderResponse && orderResponse.status == 200) {
            console.log('SUCCESS ORDER CREATION');
            console.log(orderResponse.status);
        } else {
            console.log('FAILED ORDER CREATION');
            console.log(orderResponse.status);
        }
        console.log('after fetch to create order');
    } catch (error) {
        console.log('error while creating order' + error);
    }
}

export default async function prepOrder(req, res) {
    if (req.method === 'POST') {

        console.log('prepOrder function called...');

        const { customerName, customerEmail, customerAddress, lineItems } = req.body;

        if (customerName && customerEmail && customerAddress && lineItems) {

            for (const lineItem of lineItems) {
                console.log('lineItem name: ' + lineItem.description);
                console.log('lineItem quantity: ' + lineItem.quantity);
                console.log('lineItem price: ' + lineItem.amount_total);
            };

            
            const lineItems_Products = await prepLineItems(lineItems);
            if (lineItems_Products.length >= 0) {
            await productMutations(lineItems_Products);
            await orderCreation(customerName, customerEmail, customerAddress, lineItems_Products);
            res.status(200).json({ message: 'Operations finished!' });
            }
        }
    }
    else {
        // Handle any other HTTP method
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }

}
