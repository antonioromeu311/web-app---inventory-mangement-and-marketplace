import '@shopify/shopify-api/adapters/node';
import { Shopify } from '@shopify/shopify-api';
import shopify from './shopifyClient';
import axios from 'axios';


async function getSession(shop) {
    try {
        const response = await axios.post('', {
            shop: shop
        });
        const session = response.data;
        console.log('session:', session);
        if (session) {
            return session;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting session:', error);
        return null;
    }
}

export default async function startAuth(req, res, app) {
    if (!req.query.shop) {
        res.status(500);
        return res.send("No shop provided");
    }
    console.log('shop from start auth:', req.query.shop);
    const session = await getSession(req.query.shop);
    if (session) {
        console.log('session found');
        return res.redirect(`/shopifyLane/shopifyAppBridge?host=${req.query.host}`);
    }

    if (req.query.embedded === "1") {
        return clientSideRedirect(req, res);
    }

    return await serverSideRedirect(req, res, app);
}

function clientSideRedirect(req, res) {
    const shop = shopify.utils.sanitizeShop(req.query.shop, true);
    const redirectUriParams = new URLSearchParams({
        shop,
        host: req.query.host,
    }).toString();
    const queryParams = new URLSearchParams({
        ...req.query,
        shop,
        redirectUri: ``,
    }).toString();

    return res.redirect(`/shopifyLane/exitiframe?${queryParams}`);
}

async function serverSideRedirect(req, res, app) {
    const redirectUrl = await shopify.auth.begin({
        shop: shopify.utils.sanitizeShop(req.query.shop, true),
        callbackPath: `/api/shopifyAuth/shopify-callback`,
        isOnline: false,
        rawRequest: req,
        rawResponse: res,
    });

    return res.redirect(redirectUrl);
}
