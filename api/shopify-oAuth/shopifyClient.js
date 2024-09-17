import '@shopify/shopify-api/adapters/node';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import dotenv from 'dotenv';
dotenv.config();

const shopify = shopifyApi({
    apiKey: '',
    apiSecretKey: '',
    scopes: ['read_inventory', 'read_products', 'read_product_listings', 'write_resource_feedbacks'],
    hostName: '',
    hostScheme: 'https',
    apiVersion: LATEST_API_VERSION,
    isEmbeddedApp: true
});

export default shopify;
