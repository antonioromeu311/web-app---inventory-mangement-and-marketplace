// oauthClient.js
import OAuthClient from 'intuit-oauth';

const oauthClient = new OAuthClient({
  clientId: '',
  clientSecret: '',
  environment: 'production',
  redirectUri: '',
  logging: true,
});

module.exports = oauthClient;
