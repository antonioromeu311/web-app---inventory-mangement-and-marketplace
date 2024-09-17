// intuit-auth.js and intuit-callback.js
import oauthClient from './oauthClient';
import axios from 'axios';

export default async function handler(req, res) {

    console.log(req.url);
    //handle the callback
    oauthClient
        .createToken(req.url)
        .then(async function (authResponse) {
            console.log('Token created: ' + JSON.stringify(authResponse.getJson()));
            // use the access token to make requests to the Intuit API

            const accessToken = oauthClient.getToken().access_token;
            const realmID = oauthClient.getToken().realmId;
            const refreshToken = oauthClient.getToken().refresh_token;
            const bodyTokens = { accessToken, realmID, refreshToken };
            console.log('body tokens:', bodyTokens);

            const saveTokensResponse = await axios.post(
                '',
                JSON.stringify(bodyTokens),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        "x-api-key": ""
                    }
                });

            console.log('saveTokensResponse status:', saveTokensResponse.status);

            if (saveTokensResponse.status === 200) {
                console.log('Success saving authentication!');
                res.status(200).send('Success saving authentication!');
                return;

            } else {
                console.log('Error saving authentication!');
                console.log('Error details:', saveTokensResponse.status);
                res.status(500).send('Error saving authentication! Please try again.');
                return;
            }




        })
        .catch(function (e) {
            console.error('Error while retrieving token: ' + e);
            console.error('Error message:', e.originalMessage);
            console.error('Intuit TID:', e.intuit_tid);
            console.error('Error object:', JSON.stringify(e));
            res.status(500).send('Error while retrieving token: ' + e.message);
            return;
        });

}
