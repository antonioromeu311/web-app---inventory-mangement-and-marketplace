import { useState, useCallback } from 'react';
import { API } from "aws-amplify";
import config from 'src/aws-exports'
import * as queries from 'src/graphql/queries';
API.configure(config);

async function checkForProfile(shop) {
    const variables = {
        filter: {
            nameQBO: {
                eq: shop
            },
            refreshToken: {
                eq: 'shopify_connection_profile'
            }
        }
    }
    try {
        const connections = await API.graphql({
            query: queries.listQBOtokens,
            variables: variables,
            authMode: 'API_KEY'
        });
        const connectionsArray = connections.data.listQBOtokens.items;
  
        for (const connection of connectionsArray) {
            if (connection._deleted !== null) {
                continue;
            }
            console.log('connection found:', connection);
            return connection;
        }
        return null;
    } catch (error) {
        console.error('Error checking for connection profile in database:', error);
        return error;
    }
}

export default function useConnection(shopName) {
    const [connected, setConnected] = useState(false);
  
    const checkConnectionStatus = useCallback(async () => {
        const shop = shopName + '.myshopify.com';
        const connection = await checkForProfile(shop);
        if (!connection) {
            setConnected(false);
            return;
        }
        if (connection.accessToken === 'connected') {
            setConnected(true);
        }
    }, [shopName]);

    return {
        connected,
        setConnected,
        checkConnectionStatus,
    };
}
