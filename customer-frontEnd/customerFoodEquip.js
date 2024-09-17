import Link from 'next/link';
import styles from '@/styles/Home.module.css'
import React, { useState, useEffect } from 'react';
import Layout from 'src/components/layout';
import 'bootstrap/dist/css/bootstrap.min.css';
import CustomerProductsDisplay from 'src/components/customerProductsDisplay';

//food, pellet, pellets to scan for feed
const CustomerFoodEquip = () => {


    return (
        <>
            <main >
                <Layout>
                    <CustomerProductsDisplay classification="FE" />
                </Layout>
            </main>
        </>
    );

}

export default CustomerFoodEquip;