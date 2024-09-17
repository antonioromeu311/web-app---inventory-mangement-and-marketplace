require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
import { API } from "aws-amplify";
import config from 'src/aws-exports'
import { DataStore } from '@aws-amplify/datastore';
import { Products } from 'src/models';
import * as mutations from 'src/graphql/mutations';
API.configure(config);


export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { name, description, price, classification, 
            amountOnHand, amountCommit, amountTotal, systemTag } = req.body;
        console.log('create product body:', req.body);
        try {
            const product = await stripe.products.create({
                name,
                description,
            });

            await stripe.prices.create({
                product: product.id,
                unit_amount: price,
                currency: 'usd',
            });


            try {
                const Products = {
                    name: name,
                    description: description,
                    price: price,
                    classification: classification,
                    amountOnHand: amountOnHand,
                    amountCommit: amountCommit,
                    amountTotal: amountTotal,
                    systemTag: systemTag
                };

                const newProducts = await API.graphql({
                    query: mutations.createProducts,
                    variables: { input: Products }
                });
            } catch (error) {
                console.log(error);
            }

            res.status(200).json({ message: 'Product created successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while creating the product' });
        }

    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}
