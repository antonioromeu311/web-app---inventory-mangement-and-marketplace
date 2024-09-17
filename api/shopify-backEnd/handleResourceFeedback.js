import { API } from "aws-amplify";
import config from 'src/aws-exports'
import * as queries from 'src/graphql/queries';
API.configure(config);
import axios from 'axios';


async function getAccessToken(shop) {
    console.log('shop:', shop);
    let nextToken = null;
    const variables = {
        filter: {
            nameQBO: {
                eq: shop
            },
            refreshToken: {
                eq: 'shopify_access_token'
            }
        },
        sortField: 'createdAt',
        limit: 10
    }
    try {
        do {
            if (nextToken) {
                variables.nextToken = nextToken;
            }
            const tokenShopify = await API.graphql({
                query: queries.listQBOtokens,
                variables: variables,
                authMode: 'API_KEY'
            });
            const tokensArray = tokenShopify.data.listQBOtokens.items;
            console.log('tokens array:', tokensArray);
            nextToken = tokenShopify.data.listQBOtokens.nextToken;

            for (const token of tokensArray) {
                if (token._deleted !== null) {
                    continue;
                }
                console.log('token found:', token);
                return token.accessToken;
            }
        } while (nextToken);
        return null;
    } catch (error) {
        console.error('Error getting access token in database:', error);
        return error;
    }
}

export default async function handleResourceFeedback(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
    const { shopName, status } = req.body;

    const accessToken = await getAccessToken(shopName + '.myshopify.com');
    console.log('accessToken:', accessToken);

    if (!accessToken) {
        res.status(400).json({ error: 'Access token not found' });
        return;
    }

    const feedbackDataStart = {
        resource_feedback: {
            state: "requires_action",
            messages: ["products not classified. All products must be classified before publishing."],
            feedback_generated_at: new Date().toISOString()
        }
    };

    const feedbackDataEnd = {
        resource_feedback: {
            state: "success",
            feedback_generated_at: new Date().toISOString()
        }
    };

    const apiUrl = `https://${shopName}.myshopify.com/admin/api/2023-10/resource_feedback.json`;

    try {
        const response = await axios.post(apiUrl, 
            ((status === 'startClassifyingFeedback') ? feedbackDataStart : feedbackDataEnd), {
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json'
            }
        });
        res.status(200).json(response.status);
    } catch (error) {
        console.error('Error sending resource feedback:', error.data);
        res.status(500).json({ error: 'Failed to send resource feedback' });
    }
}