import { Link, AccountConnection } from '@shopify/polaris';
import { useState, useCallback, useEffect } from 'react';
import useConnection from './useConnection';

export default function OnBoardPage({ shopName }) {

  const { connected, checkConnectionStatus } = useConnection(shopName);
  const accountName = connected ? shopName : '';

  useEffect(() => {
    checkConnectionStatus();
  }, [checkConnectionStatus]);


  const handleAction = useCallback(() => {
    
      window.open(``);
    
  }, [shopName]);

  const buttonText = connected ? 'View Account' : 'Connect';
  const details = connected ? 'Account connected' : 'No account connected';
  const terms = connected ? null : (
    <p>
      By clicking <strong>Connect</strong>, you agree to accept to tie your Fish Reef account with your Shopify account.
      This will link your Fish Reef sign in with the products you publish and sell on Shopify onto our site.
      The Fish Reef website will open and you will be prompted to sign in or create an account.
    </p>
  );

  return (
    <AccountConnection
      accountName={accountName}
      connected={connected}
      title="Connect Fish Reef Account"
      action={{
        content: buttonText,
        onAction: handleAction,
      }}
      details={details}
      termsOfService={terms}
    />
  );
}
