import { API } from "aws-amplify";
import config from 'src/aws-exports'
import * as queries from 'src/graphql/queries';
import * as mutations from 'src/graphql/mutations';
import axios from 'axios';
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

async function createProduct(product) {
    const response = await axios.post('/api/create-product',
        {
            name: product.name,
            description: product.description,
            price: product.price,
            classification: product.classification,
            amountOnHand: product.amountOnHand,
            amountCommit: product.amountCommit,
            amountTotal: product.amountTotal,
            systemTag: product.systemTag
        });
    console.log('response:', response);
    return response;
}

async function updateProduct(product, name, description, price, classification, amountOnHand, systemTag) {
    const updatedProduct = {
        id: product.id,
        name: name,
        description: description,
        price: price,
        classification: classification,
        amountOnHand: amountOnHand,
        amountCommit: 0,
        amountTotal: amountOnHand,
        systemTag: systemTag,
        _version: product._version,
    }
    const response = await API.graphql({
        query: mutations.updateProducts,
        variables: { input: updatedProduct }
    });
    console.log('update product response:', response);
    return response;
}


export default async function handleImportProducts(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }

    const { name, description, price, classification,
        amountOnHand, amountCommit, amountTotal, systemTag } = req.body;

    const variables = {
        filter: {
            classification: {
                eq: classification
            },
            name: {
                eq: name
            },
            description: {
                eq: description
            },
            systemTag: {
                contains: 'shop'
            }
        },
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
            const updatedProduct = await updateProduct(productFound, name, description, price, classification, amountOnHand, systemTag);
            console.log('updated product:', updatedProduct.data.updateProducts);
            return res.status(200).end();
        } else { // create product
            console.log('creating product:', req.body);
            const newProduct = await createProduct(req.body);
            console.log('new product:', newProduct.data.createProducts);
            return res.status(200).end();
        }
    } catch (error) {
        console.error('Error merging products into database:', error);
        return res.status(500).json({ error });
    }

}