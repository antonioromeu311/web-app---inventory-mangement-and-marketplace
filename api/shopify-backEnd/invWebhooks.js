import { API } from "aws-amplify";
import config from 'src/aws-exports'
import * as queries from 'src/graphql/queries';
import * as mutations from 'src/graphql/mutations';
import crypto from 'crypto';
API.configure(config);


async function queryProducts(variables, nextToken = null) {
    const updatedVariables = {
        ...variables,
        nextToken
    };
    const products = await API.graphql({
        query: queries.listProducts,
        variables: updatedVariables,
        authMode: 'API_KEY'
    });
    return products.data.listProducts;
}

async function updateProduct(product, variantTitle, productListingDesc, variantPrice, variantInventory, newSystemTag) {
    const updatedProduct = {
        id: product.id,
        name: variantTitle,
        description: productListingDesc,
        price: variantPrice,
        classification: product.classification,
        amountOnHand: variantInventory,
        amountCommit: 0,
        amountTotal: variantInventory,
        systemTag: newSystemTag,
        _version: product._version,
    }
    const response = await API.graphql({
        query: mutations.updateProducts,
        variables: { input: updatedProduct }
    });
    return response;
}

export default async function invWebhooks(req, res) {
    console.log('shopify inv webhooks called');
    console.log('inv webhook body:', req.body);
    const hmacHeader = req.headers['x-shopify-hmac-sha256'];
    if (!hmacHeader) {
        res.status(401).json({ error: 'Invalid webhook request' });
        console.log('invalid webhook request');
        return;
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
    const productListing = req.body.product_listing;
    const variantsArray = productListing.variants;
    const productListingTitle = productListing.title;
    const productListingDesc = ((productListing.body_html).replace(/<[^>]*>/g, '') === '') ? productListingTitle : (productListing.body_html).replace(/<[^>]*>/g, '');
    const imageSrc = productListing.images[0].src;
    for (const variant of variantsArray) {
        const variantTitle = (variant.title === 'Default Title') ? productListingTitle : variant.title;
        const variantPrice = variant.price * 100; // convert to cents
        const variantInventory = variant.inventory_quantity;
        const attributes = { productListingTitle, productListingDesc, imageSrc, variantTitle, variantPrice, variantInventory };
        console.log('attributes:', attributes);

        const variables = {
            filter: {
                name: {
                    contains: variantTitle
                },
                systemTag: {
                    contains: 'shopify'
                }
            },
            sortField: 'createdAt',
        }

        try {
            let productFound = null;
            let nextToken = null;
            do {
                const productsData = await queryProducts(variables, nextToken);
                const productsArray = productsData.items;

                for (const product of productsArray) {
                    if (product._deleted !== null) {
                        continue;
                    }
                    console.log('product found:', product);
                    productFound = product;
                    break;
                }
                nextToken = productsData.nextToken;
            } while (nextToken && !productFound);

            if (productFound) {
                const regex = /(#imageURL_)\((.*?)\)/;
                const newSystemTag = productFound.systemTag.replace('#imageURL_()', `$1(${imageSrc})`);
                const updatedProduct = await updateProduct(productFound, variantTitle, productListingDesc, variantPrice, variantInventory, newSystemTag);
                console.log('updated product:', updatedProduct.data.updateProducts);
                return res.status(200).json({ updatedProduct: updatedProduct.data.updateProducts });
            } else { // product not found, product listing must not be added to database, ignore webhook
                return res.status(200).end();
            }
        } catch (error) {
            console.error('Error updating database from webhook:', error);
            return res.status(500).json({ error });
        }

    }
    res.status(200).end();
}