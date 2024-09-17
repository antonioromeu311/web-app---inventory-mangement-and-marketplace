
//instance of client
// intuit-auth.js and intuit-callback.js
import oauthClient from './oauthClient';
import OAuthClient from 'intuit-oauth';

export default async function handler(req, res) {

    // Redirect the authUri
    const authUri = oauthClient.authorizeUri({
        scope: [OAuthClient.scopes.Accounting],
        state: 'testState',
    });
    console.log('authUri: ' + authUri);
    res.redirect(authUri);
    return;
}
