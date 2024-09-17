import { API } from "aws-amplify";
import config from 'src/aws-exports'
import * as queries from 'src/graphql/queries';
import * as mutations from 'src/graphql/mutations';
//import shopify from "./shopifyAuth/shopifyClient";
import dotenv from 'dotenv';
import crypto from 'crypto';
API.configure(config);
dotenv.config();

async function deleteData(tokenID) {
    const deleteTokenShopify = API.graphql({
        query: mutations.deleteQBOtokens,
        variables: { input: { id: tokenID } },
        authMode: 'API_KEY'
    });
    console.log('deleteTokenShopify response status code:', deleteTokenShopify.status);
    return;
}
export default async function handler(req, res) {
    const { topic, data } = req.body;

    const hmacHeader = req.headers['x-shopify-hmac-sha256'];
    const rawBody = JSON.stringify(req.body);
    const hmac = crypto
        .createHmac('sha256', process.env.SHOPIFY_OAUTH_CLIENT_SECRET) 
        .update(rawBody, 'utf8')
        .digest('base64');

    if (hmac !== hmacHeader) {
        res.status(401).json({ error: 'Invalid webhook request' });
        console.log('invalid webhook request');
        return;
    }

    const { shop_domain } = data;

    const variables = {
        filter: {
            nameQBO: {
                eq: shop_domain
            }
        },
    }
    const databaseTokensQuery = await API.graphql({
        query: queries.listQBOtokens,
        variables: variables,
        authMode: 'API_KEY'
    });

    const databaseToken = databaseTokensQuery.data.listQBOtokens.items[0];

    if (topic === 'customers/redact') {
        console.log('shop_domain in customers/redact:', shop_domain);

        await deleteData(databaseToken.id);

        res.status(200).json({ success: true });
    }

    else if (topic === 'customers/data_request') {
        console.log('shop_domain in customers/data_request:', shop_domain);
        const variables = {
            input: {
                id: databaseToken.id,
                realmID: 'DATA_REQUEST'
            }
        }

        const updateTokenShopify = API.graphql({
            query: mutations.updateQBOtokens,
            variables: variables,
            authMode: 'API_KEY'
        });

        console.log('updateTokenShopify response status code:', updateTokenShopify.status);
        res.status(200).json({ success: true });
    }

    else if (topic === 'shop/redact') {
        console.log('shop_domain shop/redact:', shop_domain);

        await deleteData(databaseToken.id);

        res.status(200).json({ success: true });
    }

    else {
        res.status(401).json({ error: 'Invalid webhook request' });
    }
}