import { API } from "aws-amplify";
import config from 'src/aws-exports'
import * as mutations from 'src/graphql/mutations';
import * as queries from 'src/graphql/queries';
API.configure(config);


export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
        return;
    }
    const { accessToken, realmID, refreshToken } = req.body;
    //console.log('Request body: ', req.body);
    console.log('accessToken to be saved: ', accessToken);
    console.log('realmID to be saved: ', realmID);
    console.log('refreshToken to be saved: ', refreshToken);
    const varsQuery = {
        filter: {
            realmID: { eq: realmID }
        }
    };
    try {
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

        if (foundToken !== null) {
            console.log('QBO tokens already exist, updating...');
            try {
                const tokenQBO = {
                    input: {
                        id: foundToken.id,
                        accessToken: accessToken,
                        realmID: realmID,
                        refreshToken: refreshToken,
                        nameQBO: `QBO_${realmID}`,
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
                res.status(200).json({ message: 'Success saving authentication!' });
                return;
            } catch (error) {
                console.error('Error details:', error.message);
                res.status(500).json({ error: 'Error saving authentication!', errorDetails: error.message });
                return;
            }
        } else {
            try {
                const tokenQBO = {
                    accessToken: accessToken,
                    realmID: realmID,
                    refreshToken: refreshToken,
                    nameQBO: `QBO_${realmID}`
                };
                const newQBOtokens = await API.graphql({
                    query: mutations.createQBOtokens,
                    variables: { input: tokenQBO },
                    authMode: 'API_KEY'
                });
                console.log('New QBO tokens:', newQBOtokens);
                res.status(200).json({ message: 'Success saving authentication!' });
                return;
            } catch (error) {
                console.error('Error details:', error.message);
                res.status(500).json({ error: 'Error saving authentication!', errorDetails: error });
                return;
            }
        };
    } catch (error) {
        console.error('Error details:', error);
        res.status(500).json({ error: 'Error saving authentication!', errorDetails: error });
        return;
    }

}