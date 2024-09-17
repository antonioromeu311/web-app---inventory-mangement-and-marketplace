import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import React, { useEffect, useState } from 'react';
import Image from 'react-bootstrap/Image'
import { Auth } from 'aws-amplify';
import Layout from 'src/components/layout';
import Spinner from 'react-bootstrap/Spinner';
const inter = Inter({ subsets: ['latin'] })
import { AccountSettings } from '@aws-amplify/ui-react';
import { useRouter } from 'next/router';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import '@aws-amplify/ui-react/styles.css';


const CustomerSettings = () => {
    const router = useRouter();

    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        async function getUserEmail() {
            const user = await Auth.currentAuthenticatedUser();
            setUserEmail(user.attributes.email);
        }
        getUserEmail();
    }, []);

    async function stripeBillingPortal() {
        console.log(userEmail);
        const billingPortalUrl =
            '' +
            encodeURIComponent(userEmail);
        window.location.href = billingPortalUrl;
    }


    return (
        <>
            <Layout>
                <main className={styles.main}>
                    <h1>Settings for: {userEmail}</h1>
                    <div>
                        <AccountSettings.ChangePassword />
                    </div>
                    <Button onClick={stripeBillingPortal}>Billing Settings</Button>

                </main>
            </Layout>
        </>
    );
};

export default CustomerSettings;
