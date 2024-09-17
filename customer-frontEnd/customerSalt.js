import Link from 'next/link';
import styles from '@/styles/Home.module.css'
import * as queries from 'src/graphql/queries';
import { API } from "aws-amplify";
import React, { useState, useEffect } from 'react';
import Layout from 'src/components/layout';
import 'bootstrap/dist/css/bootstrap.min.css';
import CustomerProductsDisplay from 'src/components/customerProductsDisplay';


const CustomerSalt = () => {

    return (

        <>
            <Layout>
                <main >
                    <CustomerProductsDisplay classification="SW" />
                </main>
            </Layout>
        </>
    );

}

export default CustomerSalt;