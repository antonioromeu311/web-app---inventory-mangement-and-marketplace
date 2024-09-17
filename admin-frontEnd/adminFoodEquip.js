import Link from 'next/link';
import styles from '@/styles/Home.module.css'
import { ProductsCreateForm } from 'src/ui-components';
import '@aws-amplify/ui-react/styles.css';
import { Card, Alert } from '@aws-amplify/ui-react';
import { DataStore } from '@aws-amplify/datastore';
import { Products } from 'src/models';
import AdminInvManager from 'src/components/adminInvManager';
import AdminRoute from 'src/components/AdminRoute';

export default function adminFoodEqup() {


    return (
        <AdminRoute>
            <>
                <main className={styles.main}>
                    <h1>Food & Equipment Inventory</h1>

                    <AdminInvManager classification="FE" />
                    <Card variation="outlined">
                        <ProductsCreateForm
                            onSubmit={async (fields) => {

                                const response = await fetch("../api/create-product", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "x-api-key": ""
                                    },
                                    body: JSON.stringify(fields)

                                })
                                if (response.status == 200) {
                                    alert('Succesfully created Product!\nSpecifications:\n' + JSON.stringify(fields) + '\n(Price displays in cents)');
                                    const models = await DataStore.query(Products);
                                    console.log(models);
                                } else {
                                    alert('Failed creating Product!\nSpecifications:\n' + JSON.stringify(response.statusText));
                                }
                            }}
                        />
                    </Card>



                    <h2><Link href="/adminLane/adminLogin">Back to Home</Link></h2>




                </main>
            </>
        </AdminRoute>
    );

}
