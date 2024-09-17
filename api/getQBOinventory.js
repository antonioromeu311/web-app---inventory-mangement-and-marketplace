import { API } from 'aws-amplify';
import config from 'src/aws-exports';
import * as mutations from 'src/graphql/mutations';
import * as queries from 'src/graphql/queries';
import { listQBOtokens } from 'src/graphql/queries';
import axios from 'axios';
import oauthClient from 'src/pages/api/auth/oauthClient';
API.configure(config);

async function checkAndRefreshAccessToken(oauthClient, refreshToken) {
    try {
        if (oauthClient.isAccessTokenValid()) {
            console.log('Access token is valid');
        } else {
            console.log('Access token is invalid, refreshing...');
            await oauthClient.refreshUsingToken(refreshToken);
            console.log('Access token refreshed:', oauthClient.getToken());
            const accessToken = oauthClient.getToken().access_token;
            const realmID = oauthClient.getToken().realmId;
            const newRefreshToken = oauthClient.getToken().refresh_token;
            const bodyTokens = { accessToken, realmID, refreshToken: newRefreshToken };
            // Save the new access token and refresh token in your GraphQL database
            const saveTokensResponse = await fetch('', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "x-api-key": ""
                },
                body: JSON.stringify(bodyTokens),
            });

            console.log('saveTokensResponse:', saveTokensResponse, await saveTokensResponse.json());

            if (saveTokensResponse.status === 200) {
                console.log('Success saving authentication!');



            } else {
                console.log('Error saving authentication!');
                console.log('Error details:', saveTokensResponse.statusText);


            }

        }
    } catch (error) {
        console.error('Error refreshing access token:', error);
        throw error;
    }

}


async function fetchQBOtokens(nameQBO) {
    // Fetch the saved QBO tokens and realmID from your GraphQL database
    try {
        const filter = {
            nameQBO: {
                eq: nameQBO,
            },
        };
        const result = await API.graphql({
            query: listQBOtokens,
            variables: { filter },
        });

        if (result.data.listQBOtokens.items.length === 0) {
            throw new Error("No tokens found for the specified nameQBO");
        }

        const accessToken = result.data.listQBOtokens.items[0].accessToken;
        const refreshToken = result.data.listQBOtokens.items[0].refreshToken;
        const realmID = oauthClient.getToken().realmId;
        console.log('realmID:', realmID);

        return { accessToken, refreshToken, realmID };
    } catch (error) {
        console.error("Error fetching tokens:", error);
        throw error;
    }

}

async function fetchQBOInventory(accessToken, realmID, startPosition = 1, maxResults = 1000) {
    // Use the QBO API to fetch the inventory items
    try {
        const apiURL = `https://quickbooks.api.intuit.com/v3/company/${hardRealmID}/query`;
        const query = `SELECT * FROM Item STARTPOSITION ${startPosition} MAXRESULTS ${maxResults}`;

        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        };

        const response = await axios.get(apiURL, {
            headers: headers,
            params: { query },
        });

        if (response.status === 200) {
            const inventoryItems = response.data.QueryResponse.Item;
            //const nonServiceItems = inventoryItems.filter(item => item.Type !== 'Service');
            console.log(`Fetched ${inventoryItems.length} inventory items.`);
            return inventoryItems;
        } else {
            throw new Error('Error fetching inventory items: ' + response.statusText);
        }
    } catch (error) {
        console.error('Error fetching inventory items:', error);
        throw error;
    }

}

function formatPrice(price) {
    const priceInCents = Math.round(parseFloat(price) * 100);
    return priceInCents;
}

// Save the fetched inventory items in your GraphQL database
async function saveInventoryItemsToDatabase(inventoryItems) {
    let successCount = 0;
    let errorCount = 0;
    let existingProductCount = 0;
    try {
        const queryResult = await API.graphql({
            query: queries.listProducts,
            authMode: 'API_KEY'
        });

        console.log('queryResult length:', queryResult.data.listProducts.items.length);

        for (let i = 0; i < inventoryItems.length; i++) {
            const item = inventoryItems[i];
            if (item.Type !== 'Service' && item.Active) {
                console.log('Item name: ', item.Name);
                console.log('Description: ', item.Description);
                console.log('Quantity on hand: ', item.QtyOnHand);
                console.log('Unit price: ', item.UnitPrice);
                console.log('Formatted price: ', formatPrice(item.UnitPrice));
                console.log('SKU: ', item.SKU);
                console.log('------------------------');

                let systemTag = ('QBO');
                if (item.SKU) {
                    systemTag = ('QBO.' + item.SKU);
                }

                const existingProduct = queryResult.data.listProducts.items.find((product) => product.name === item.Name && product.description === item.Description && product._deleted !== true);
                
                if (existingProduct && !existingProduct._deleted) {
                    console.log('Item already exists in database');
                    existingProductCount++;
                    try {
                        const product = {
                            input: {
                                id: existingProduct.id,
                                name: item.Name,
                                description: item.Description,
                                price: formatPrice(item.UnitPrice),
                                classification: 'FE',
                                amountOnHand: item.QtyOnHand,
                                amountCommit: existingProduct.amountCommit,
                                amountTotal: item.QtyOnHand,
                                systemTag: systemTag,
                                _version: existingProduct._version
                            }
                        };
                        const updatedProduct = await API.graphql({
                            query: mutations.updateProducts,
                            variables: product,
                            authMode: 'API_KEY'
                        });

                        if (updatedProduct && !updatedProduct.errors) {
                            console.log('Item updated in database');
                            console.log('Updated item:', updatedProduct.data.updateProducts)
                            successCount++;
                        } else {
                            console.log('Error updating item in database');
                            console.log('Error details:', updatedProduct.errors);
                            errorCount++;
                        }
                    } catch (error) {
                        console.error('Error updating item in database:', error);
                        errorCount++;
                        throw error;
                    }

                } else {
                    try {
                        const body = {
                            name: item.Name, description: item.Description,
                            price: formatPrice(item.UnitPrice), classification: 'FE', amountOnHand: item.QtyOnHand,
                            amountCommit: 0, amountTotal: item.QtyOnHand, systemTag: systemTag
                        };
                        const saveInventoryResponse = await fetch('https://main.d1c3f6aw1p2ute.amplifyapp.com/api/create-product', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                "x-api-key": "da2-lyrppsviqbhdzm43f7g7lmwsi4"
                            },
                            body: JSON.stringify(body),
                        });
                        if (saveInventoryResponse.status === 200) {
                            console.log('Success saving inventory item!');
                            successCount++;
                        } else {
                            console.log('Error saving inventory item!');
                            console.log('Error status text:', saveInventoryResponse.statusText);
                            console.log('Error details: ', saveInventoryResponse.body);
                            errorCount++;
                        }
                    } catch (error) {
                        console.error('Error saving inventory item:', error);
                        errorCount++;
                        throw error;
                    }
                }

                console.log('Success count:', successCount);
                console.log('Error count:', errorCount);
                console.log('Existing product count:', existingProductCount);
            }
        }

    } catch (error) {
        console.error('Error while saving inventory items to database', error);
        throw error;
    }
}

export default async function handler(req, res) {

    if (req.method === 'GET') {
        const nameQBO = 'chadOrlando';
        try {
            const { accessToken, refreshToken, realmID } = await fetchQBOtokens(nameQBO).catch((error) => {
                console.error('Error fetching tokens:', error.message);
                throw error;
            });
            console.log('Tokens:', { accessToken, refreshToken, realmID });


            oauthClient.setToken({
                access_token: accessToken,
                refresh_token: refreshToken,
            });
            console.log("Before checking and refreshing access token");
            await checkAndRefreshAccessToken(oauthClient, refreshToken);
            console.log("After checking and refreshing access token");
            const updatedAccessToken = oauthClient.getToken().access_token;
            console.log("Before fetching QBO inventory");

            const inventoryItems = await fetchQBOInventory(updatedAccessToken, hardRealmID).catch((error) => {
                console.error('Error fetching inventory items:', error.message);
                throw error;
            });
            console.log("After fetching QBO inventory");
            //console.log('inventoryItems:', inventoryItems);
            await saveInventoryItemsToDatabase(inventoryItems);
            res.status(200).json({ inventoryItems });
            return;
        } catch (error) {
            console.error('Error fetching and saving inventory items:', error.message);
            res.status(500).json({ error: 'Error fetching and saving inventory items' });
        }
    } else {
        res.setHeader('Allow', 'GET');
        res.status(405).end('Method Not Allowed');
    }
}



