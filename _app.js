import '@/styles/globals.css'
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import React, { useEffect, useState } from 'react';
import { Amplify, Auth, Storage } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator, ThemeProvider } from '@aws-amplify/ui-react';
import { useRouter } from 'next/router';
import awsconfig from '../aws-exports';
Amplify.configure(awsconfig);
require('dotenv').config();
const stripePromise = loadStripe(****);

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const router = useRouter();


  useEffect(() => {
    const publicRoutes = ['/api/shopifyAuth/shopify-auth', '/api/shopifyAuth/shopify-callback', '/shopifyLane/startAuth',
      '/api/shopifyAuth/shopifyClient', '/shopifyLane/exitiframe', '/shopifyLane/shopifyAppBridge', '/shopifyLane/onBoard', '/customerLane/termsCond'];
    if (publicRoutes.includes(router.pathname)) {
      setUser('public');
    } else {
      Auth.currentAuthenticatedUser()
        .then((user) => {
          setUser(user);
        })
        .catch(() => setUser(null));
    }
  }, [router.pathname]);

  const handleSignOut = () => {
    Auth.signOut()
      .then(() => setUser(null))
      .catch((error) => console.log('Error signing out:', error));
  };

  const isPublicRoute = user === 'public';

  return (
    <ThemeProvider>
      <Elements stripe={stripePromise}>
        {isPublicRoute ? (
          <Component {...pageProps} signOut={handleSignOut} />
        ) : (
          <Authenticator variation="modal" loginMechanisms={['email']}>
            {({ authState }) => {
              const isAuthenticated = authState === 'signedin';
              return (
                <React.Fragment>
                  {isAuthenticated && (
                    <Component {...pageProps} signOut={handleSignOut} />
                  )}
                  {!isAuthenticated && (
                    <Component {...pageProps} signOut={handleSignOut} />
                  )}
                </React.Fragment>
              );
            }}
          </Authenticator>
        )}
      </Elements>
    </ThemeProvider>
  );
}
