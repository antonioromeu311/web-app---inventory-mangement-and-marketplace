require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
import { API } from "aws-amplify";
import config from 'src/aws-exports'
import * as mutations from 'src/graphql/mutations';
import * as queries from 'src/graphql/queries';
API.configure(config);

export default async function handler(req, res) {

    async function getProductData(productName) {
        const varsQuery = {
            filter: {
                name: { eq: productName }
            }
        };
        const productData = await API.graphql({
            query: queries.searchProducts,
            variables: varsQuery
        });
        const item = productData.data.searchProducts.items[0];
        console.log('item:\n', item);
        return item;
    }
    if (req.method === 'POST') {
        const { lineItems } = req.body;
        let errorCount = 0;
        let successCount = 0;
        console.log('lineItems:\n', lineItems);
        console.log('handle mutations handler called');

        if (req.headers['order-mutations'] === 'true') {
            //req came from delivered order, subtract quantity from commit and on hand
            for (const { productName, quantity } of lineItems) {
                const productAWS = await getProductData(productName);
                const newCommit = productAWS.amountCommit - quantity;
                const newOnHand = productAWS.amountOnHand - quantity;
                try {
                    const productUpdateDetails = {
                        input: {
                            id: productAWS.id,
                            amountCommit: newCommit,
                            amountOnHand: newOnHand,
                            _version: productAWS._version
                        }
                    };
                    const productUpdate = await API.graphql({
                        query: mutations.updateProducts,
                        variables: productUpdateDetails
                    });
                    if (productUpdate && !productUpdate.errors) {
                        console.log('Product updated successfully');
                        continue;
                    }
                } catch (error) {
                    console.log('Product update failed:', error);
                    res.status(400).json({ message: 'Product update failed' });
                }
            }
            res.status(200).json({ message: 'Products updated successful from confirmed delivery order.' });
            return;
        } else {

            try {
                for (const { productName, quantity } of lineItems) {
                    console.log('-------------------');
                    console.log('PRODUCT NAME: ' + productName + '\nQUANTITY: ' + quantity);
                    const productAWS = await getProductData(productName);

                    console.log('PRODUCT AMOUNT TOTAL PRE CHANGE: ' + productAWS.amountTotal);
                    console.log('PRODUCT AMOUNT COMMIT PRE CHANGE: ' + productAWS.amountCommit);
                    const newTotal = productAWS.amountTotal - quantity;
                    const newCommit = productAWS.amountCommit + quantity;
                    console.log('NEW TOTAL: ' + newTotal + '\nNEW COMMIT: ' + newCommit);
                    try {
                        const productUpdateDetails = {
                            input: {
                                id: productAWS.id,
                                amountCommit: newCommit,
                                amountTotal: newTotal,
                                _version: productAWS._version
                            }
                        };
                        const productUpdate = await API.graphql({
                            query: mutations.updateProducts,
                            variables: productUpdateDetails
                        });
                        if (productUpdate && !productUpdate.errors) {
                            console.log(productUpdate);
                            console.log('Product updated successfully');
                            console.log('PRODUCT AMOUNT COMMIT POST CHANGE: ' + productUpdate.data.updateProducts.amountCommit);
                            console.log('PRODUCT AMOUNT TOTAL POST CHANGE: ' + productUpdate.data.updateProducts.amountTotal);
                            successCount++;
                            continue;

                        } else {
                            console.log('Product update failed:', productUpdate.errors);
                            errorCount++;
                            continue;
                        }
                    } catch (error) {
                        console.log('Product update failed:', error);
                        errorCount++;
                        continue;
                    }
                }
                console.log('after for loop in handle mutations');
                console.log('error count: ' + errorCount);
                console.log('success count: ' + successCount);
                res.status(200).json({ message: 'All product mutations completed successfully' });
                return;
            } catch (error) {
                console.log(error);
                console.log('error count: ' + errorCount);
                console.log('success count: ' + successCount);
                res.status(500).json({ error: 'An error occurred while updating the product' });
                return;
            }
        }

    } else {
        // Handle any other HTTP method
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}
