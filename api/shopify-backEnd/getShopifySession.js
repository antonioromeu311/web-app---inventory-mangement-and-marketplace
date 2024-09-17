import { API } from "aws-amplify";
import config from 'src/aws-exports'
import * as queries from 'src/graphql/queries';
API.configure(config);


async function fetchSessions(variables, nextToken = null) {
    const updatedVariables = {
        ...variables,
        nextToken
    };
    const sessions = await API.graphql({
        query: queries.listQBOtokens,
        variables: updatedVariables,
        authMode: 'API_KEY'
    });
    return sessions.data.listQBOtokens;
}

export default async function getShopifySession(req, res) {

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }

    const { shop } = req.body;
    console.log('shop:', shop);

    const variables = {
        filter: {
            nameQBO: {
                eq: shop
            },
            accessToken: {
                contains: 'shpat_'
            },
            refreshToken: {
                contains: 'read'
            }
        },
        sortField: 'createdAt',
    }
    try {
        let sessionFound = null;
        let nextToken = null;
        do {
            const sessionsData = await fetchSessions(variables, nextToken);
            const sessionArray = sessionsData.items;
            //console.log('sessions array:', sessionArray);

            for (const sessionToken of sessionArray) {
                if (sessionToken._deleted !== null) {
                    continue;
                }
                console.log('session token found:', sessionToken);
                sessionFound = sessionToken;
                break;
            }

            if (sessionFound) break;

            nextToken = sessionsData.nextToken;
        } while (nextToken);

        if (!sessionFound) {
            return res.status(500).json('No session found in database');
        }

        const id = `offline_${shop}`;
        const shopToken = sessionFound.nameQBO;
        const state = sessionFound.realmID;
        const accessToken = sessionFound.accessToken;
        const scope = sessionFound.refreshToken;
        const session = {
            id,
            shop: shopToken,
            state,
            isOnline: false,
            accessToken,
            scope,
        };
        console.log('session:', session);
        return res.status(200).json(session);
    }

    catch (error) {
        console.error('Error checking for connection profile in database:', error);
        return res.status(500).json('Error checking for connection profile in database');
    }

}