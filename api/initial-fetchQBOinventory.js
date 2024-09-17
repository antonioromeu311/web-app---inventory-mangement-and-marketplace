import axios from 'axios';
import OAuthClient from 'src/pages/api/auth/oauthClient';
import { API } from "aws-amplify";
import config from 'src/aws-exports'
import * as mutations from 'src/graphql/mutations';
import * as queries from 'src/graphql/queries';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
API.configure(config);

const client = new S3Client({ region: 'us-east-1' });

async function saveUpdatedToken(accessToken, refreshToken, realmID) {
    console.log('realm id in saveUpdatedToken', realmID);
    try {
        const varsQuery = {
            filter: {
                realmID: { eq: realmID }
            }
        };
        const existingToken = await API.graphql({
            query: queries.listQBOtokens,
            variables: varsQuery,
            authMode: 'API_KEY'
        });
        console.log('Existing QBO tokens:', existingToken.data.listQBOtokens.items);
        const existingTokenData = existingToken.data.listQBOtokens.items;
        let foundToken = null;
        for (const validToken of existingTokenData) {
            if (validToken._deleted === null) {
                foundToken = validToken;
                break;
            }
        }
        if (foundToken === null) {
            return null;
        }
        const tokenQBO = {
            input: {
                id: foundToken.id,
                accessToken: accessToken,
                refreshToken: refreshToken,
                _version: foundToken._version
            }
        };
        console.log("Before updating QBO tokens");
        const updatedQBOtokens = await API.graphql({
            query: mutations.updateQBOtokens,
            variables: tokenQBO,
            authMode: 'API_KEY'
        });
        console.log('Updated QBO tokens:', updatedQBOtokens.data.updateQBOtokens);
        return updatedQBOtokens.data.updateQBOtokens;
    } catch (error) {
        console.error('Error while updating token: ' + error);
        return null;
    }
}

async function validateToken(accessToken, refreshToken, realmID) {
    console.log('Validating token');
    console.log('accessToken', accessToken);
    console.log('refreshToken', refreshToken);
    try {
        OAuthClient.setToken({
            access_token: accessToken,
            refresh_token: refreshToken,
        });

        const isValid = await OAuthClient.isAccessTokenValid(accessToken);
        if (isValid) {
            console.log('Token is valid');
            return { validAccessToken: accessToken, validRefreshToken: refreshToken };
        } else {
            console.log('Token is invalid, refreshing');
            await OAuthClient.refreshUsingToken(refreshToken);
            const refreshedTokens = OAuthClient.getToken();
            const newAccessToken = refreshedTokens.access_token;
            const newRefreshToken = refreshedTokens.refresh_token;
            console.log('newAccessToken', newAccessToken);
            console.log('newRefreshToken', newRefreshToken);
            try {
                const updatedToken = await saveUpdatedToken(newAccessToken, newRefreshToken, realmID);
                if (!updatedToken) {
                    console.log('Error while updating token, did not save new validated tokens');
                } else {
                    console.log('Successfully updated token:', updatedToken);
                }
            } catch (error) {
                console.error('Error while updating token: ' + error);
            }
            return { validAccessToken: newAccessToken, validRefreshToken: newRefreshToken };
        }

    } catch (error) {
        console.error('Error while validating token: ' + error);
        console.error('Error message:', error.originalMessage);
        return { accessToken: null, refreshToken: null }
    }

}


async function fetchQBOInventory(accessToken, realmID, startPosition = 1, maxResults = 1000) {
    const apiURL = `https://quickbooks.api.intuit.com/v3/company/${realmID}/query`;
    const query = `SELECT * FROM Item STARTPOSITION ${startPosition} MAXRESULTS ${maxResults}`;

    const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    }
    try {
        const response = await axios.get(apiURL, {
            headers: headers,
            params: { query },
        });
        return response.data.QueryResponse.Item;
    } catch (error) {
        console.log('error', error.message);
        return error;
    }
}

async function fetchImages(item, accessToken, realmID) {
    const apiURL = `https://quickbooks.api.intuit.com/v3/company/${realmID}/query`;
    const query = `select * from Attachable where AttachableRef.EntityRef.Type = 'Item' and AttachableRef.EntityRef.value = '${item.Id}'`;
    const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'text/plain'
    }
    try {
        const response = await axios.get(apiURL, {
            headers: headers,
            params: { query },
        });
        return response.data.QueryResponse;
    } catch (error) {
        console.log('error', error.message);
        return error;
    }
}

export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const { accessToken, realmID, refreshToken } = req.body
    console.log('accessTokenBody', accessToken);
    console.log('realmID', realmID);
    console.log('refreshTokenBody', refreshToken);

    const { validAccessToken, validRefreshToken } = await validateToken(accessToken, refreshToken, realmID) || {};

    if (!validAccessToken || !validRefreshToken) {
        return res.status(500).json({ message: 'Failed to validate or refresh tokens' });
    }
    console.log('valid accessToken', validAccessToken);
    console.log('valid refreshToken', validRefreshToken);

    const inventory = (await fetchQBOInventory(validAccessToken, realmID)).filter(item => item.Type === 'Inventory');
    //console.log('inventory', inventory);

    for (const item of inventory) {
        const imageDataResponse = await fetchImages(item, validAccessToken, realmID);
        if (imageDataResponse.Attachable) {
            console.log('imageDataResponse attachable', imageDataResponse.Attachable);
            const image = imageDataResponse.Attachable[0];
            const imageUri = `https://quickbooks.api.intuit.com${image.FileAccessUri}`;
            const imageKey = `public/images/${image.FileName}`;
            const headers = {
                Authorization: `Bearer ${validAccessToken}`,
                'Content-Type': 'text/plain'
            };
            try {
                const responseImage = await axios.get(imageUri,
                    {
                        headers: headers,
                    });
                console.log('responseImage', responseImage.data);
                const imageLink = responseImage.data;
                const imageDownload = await axios.get(imageLink, { responseType: 'arraybuffer', buffer: true });
                const imageBuffer = imageDownload.data;
                console.log('imageBuffer', imageBuffer);
                const uploadResult = new PutObjectCommand({
                    Bucket: '',
                    Key: imageKey,
                    Body: imageBuffer,
                    ACL: 'public-read'
                });
                const responseUpload = await client.send(uploadResult);
                console.log('Succeeded: ', responseUpload);
                if (responseUpload.$metadata.httpStatusCode === 200) {
                    console.log('Successfully uploaded image');
                    const objectURL = `}`;
                    const newProduct = await axios.post('',
                        {
                            name: item.Name,
                            description: item.Description,
                            price: Math.floor(item.UnitPrice * 100),
                            classification: 'FE',
                            amountOnHand: item.QtyOnHand,
                            amountCommit: 0,
                            amountTotal: item.QtyOnHand,
                            systemTag: `QBO_${realmID}, #imageURL_(${objectURL})`,
                        });
                    console.log('newProduct', newProduct);
                }
            } catch (error) {
                console.log('error in processing image', error);
            }
        } else {
            const newProduct = await axios.post('',
                {
                    name: item.Name,
                    description: item.Description,
                    price: Math.floor(item.UnitPrice * 100),
                    classification: 'FE',
                    amountOnHand: item.QtyOnHand,
                    amountCommit: 0,
                    amountTotal: item.QtyOnHand,
                    systemTag: `QBO_${realmID}`,
                });
            console.log('newProduct', newProduct);
        }
    }

    res.status(200).json({ inventory });
    return;
}
