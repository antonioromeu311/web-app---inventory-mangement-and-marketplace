import { API } from "aws-amplify";
import config from 'src/aws-exports'
import * as queries from 'src/graphql/queries';
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


export default async function getActiveProductsCount(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }

    const { shop } = req.body;
    console.log('shop:', shop);

    const variables = {
        filter: {
            systemTag: {
                contains: shop
            }
        },
    }
    try {
        let count = 0;
        let nextToken = null;
        do {
            const productsData = await queryProducts(variables, nextToken);
            const productsArray = productsData.items;

            for (const product of productsArray) {
                if (product._deleted !== null) {
                    continue;
                }
                console.log('product found:', product);
                count++;
            }
            nextToken = productsData.nextToken;
        } while (nextToken);
        
        return res.status(200).json({ count });
    } catch (error) {
        console.error('Error getting active products count:', error);
        return res.status(500).json({ error });
    }
}