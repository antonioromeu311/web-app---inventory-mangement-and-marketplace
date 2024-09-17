import '@shopify/shopify-api/adapters/node';
import shopify from './shopifyClient';
import dotenv from 'dotenv';
dotenv.config();



export default async function handler(req, res) {
  
  const shop = req.query.shop;
  console.log('shop:', shop);
  if (!shop || typeof shop !== 'string') {
    res.status(400).send('Missing or invalid shop parameter');
    return;
  }
  


  await shopify.auth.begin({
    shop: shopify.utils.sanitizeShop(req.query.shop, true),
    callbackPath: `/api/shopifyAuth/shopify-callback`,
    isOnline: false,
    rawRequest: req,
    rawResponse: res,
    forceRedirect: true,
  });
  return;
}