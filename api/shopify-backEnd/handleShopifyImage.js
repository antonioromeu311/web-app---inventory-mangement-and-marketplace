import { API } from "aws-amplify";
import config from 'src/aws-exports'
import * as queries from 'src/graphql/queries';
API.configure(config);
import axios from 'axios';


async function getAccessToken(shop) {
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
    }
    try {
        const tokenShopify = await API.graphql({
            query: queries.listQBOtokens,
            variables: variables,
            authMode: 'API_KEY'
        });
        const tokensArray = tokenShopify.data.listQBOtokens.items;


        for (const token of tokensArray) {
            if (token._deleted !== null) {
                continue;
            }
            console.log('token found:', token);
            return token.accessToken;
        }
        return null;
    } catch (error) {
        console.error('Error getting access token in database:', error);
        return error;
    }
}

export default async function handleImageID(req, res) {
    const { shopifyID, shopName } = req.body;

    const accessToken = await getAccessToken(shopName + '.myshopify.com');
    console.log('accessToken:', accessToken);
    let imageUrl = null;
    const query = `
    {
      product(id: "${shopifyID}") {
        images(first: 1) {
          nodes {
            originalSrc
          }
        }
      }
    }
  `;


    try {
        const response = await axios.post(`https://${shopName}.myshopify.com/admin/api/2023-10/graphql.json`, {
            query: query,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
        });

        if (response.data.data.product.images === null || response.data.data.product.images.nodes.length === 0 || response === null || !response) {
            res.status(200).json({ imageURL: null });
            return null;
        }

        const imageURL = response.data.data.product.images.nodes[0].originalSrc;
        console.log(imageURL);
        res.status(200).json({ imageURL });
        return imageURL;


    } catch (error) {
        console.error('Error getting image from Shopify:', error);
        res.status(200).json({ imageURL: null });
        return null;
    }
}