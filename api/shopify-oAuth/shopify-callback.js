import '@shopify/shopify-api/adapters/node';
import shopify from './shopifyClient';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { API } from "aws-amplify";
import config from 'src/aws-exports'
import * as mutations from 'src/graphql/mutations';
import * as queries from 'src/graphql/queries';
import axios from 'axios';
API.configure(config);
dotenv.config();


async function deleteToken(id, version) {
    const deleteInput = {
        input: {
            id: id,
            _version: version
        }
    }
    try {
        const deleteToken = await API.graphql({
            query: mutations.deleteQBOtokens,
            variables: deleteInput,
            authMode: 'API_KEY'
        });
        console.log('token deleted: ', deleteToken.data.deleteQBOtokens._deleted);
        return deleteToken.data.deleteQBOtokens._deleted;
    } catch (error) {
        console.error('Error deleting token from database:', error);
        return error;
    }
}

async function saveSession(session) {
    //find and delete previous access tokens for this shop
    // const variablesFilter = {
    //     filter: {
    //         realmID: {
    //             eq: 'shopify'
    //         },
    //         nameQBO: {
    //             eq: shop
    //         },
    //         refreshToken: {
    //             eq: 'shopify_access_token'
    //         },
    //     },
    //     sortField: "createdAt", 
    // }
    try {
        //     const accessTokens = await API.graphql({
        //         query: queries.listQBOtokens,
        //         variables: variablesFilter,
        //         authMode: 'API_KEY'
        //     });
        //     const accessTokensArray = accessTokens.data.listQBOtokens.items;

        //     for (const token of accessTokensArray) {
        //         if (token._deleted !== null) {
        //             continue;
        //         }
        //         console.log('access token to be deleted:', token);
        //         await deleteToken(token.id, token._version);
        //     }

        const tokenShopify = {
            accessToken: session.accessToken,
            realmID: session.state,
            refreshToken: session.scope,
            nameQBO: session.shop,
        };

        const newTokenShopify = await API.graphql({
            query: mutations.createQBOtokens,
            variables: { input: tokenShopify },
            authMode: 'API_KEY'
        });

        console.log('newTokenShopify:', newTokenShopify.data.createQBOtokens);
        return newTokenShopify;

    } catch (error) {
        console.error('Error saving tokens to database:', error);
        return error;
    }
}

function constructQueryString(params) {
    return Object.keys(params)
        .filter(key => key !== 'hmac')
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');
}


async function handleWebhooks(accessToken, shop) {
    console.log('handle webhooks function called in callback');
    console.log('accessToken:', accessToken);
    console.log('shop:', shop);
    try {
        const response = await axios.post(
            'https://main.d1c3f6aw1p2ute.amplifyapp.com/api/shopifyApp/handleWebhooks', 
            {
                accessToken: accessToken,
                shop: shop
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('response status code:', response.status);
    }
    catch (error) {
        console.error('Error handling webhooks:', error.code);
    }
    return;
}


export default async function handler(req, res) {
    console.log('req.query:', req.query);
    try {
        const shop = req.query.shop;
        const code = req.query.code;
        const host = req.query.host;
        const hmac = req.query.hmac;
        const data = constructQueryString(req.query);
        console.log(req.headers);

        

        const generatedHmac = crypto
            .createHmac('sha256', process.env.SHOPIFY_OAUTH_CLIENT_SECRET)
            .update(data)
            .digest('hex');
        if (generatedHmac !== hmac) {
            return res.status(400).send('HMAC validation failed');
        }
        if (!shop || !code) {
            throw new Error('Missing "shop" or "code" query parameter');
        }

        try {
            const callbackResponse = await shopify.auth.callback({
                rawRequest: req,
                rawResponse: res,
            });
            console.log('session:', callbackResponse.session);
            const session = callbackResponse.session;
            
            const savedSession = await saveSession(session);
            if (savedSession === null) {
                res.status(500).send('Error saving access token to database');
            };
            await handleWebhooks(session.accessToken, shop);
            
        } catch (error) {
            console.error('Error in shopify.auth.callback:', error);
            res.status(500).send('Error in shopify callback');
            return;
        };
        res.redirect(`/shopifyLane/shopifyAppBridge?host=${host}`);
        return;
    } catch (error) {
        console.error('Error exchanging code for access token: ', error);
        res.status(500).send('An error occurred during the OAuth process');
        return;
    }
}