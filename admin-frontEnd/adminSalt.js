import Link from 'next/link';
import styles from '@/styles/Home.module.css'
import { ProductsCreateForm } from 'src/ui-components';
import '@aws-amplify/ui-react/styles.css';
import {
    Card, Alert, Expander, ExpanderItem, Table, Flex, View,
    TableCell, TableBody, TableHead, TableRow, ScrollView, Image,
    Button, Loader, Collection, Heading, Divider, Text, Badge
} from '@aws-amplify/ui-react';
import * as queries from 'src/graphql/queries';
import { DataStore } from '@aws-amplify/datastore';
import { Products } from 'src/models';
import { API } from "aws-amplify";
import React, { useState, useEffect } from 'react';
import AdminInvManager from '@/components/adminInvManager';
import AdminRoute from '@/components/AdminRoute';

export default function AdminSalt() {

    const [selectedProduct, setSelectedProduct] = useState([]);
    const [productsData, setProductsData] = useState([]);

    useEffect(() => {
        const fetchProductsData = async () => {
            const variables = {
                filter: {
                    classification: {
                        eq: 'SW'
                    }
                }
            };


            const ProductsQuery = await API.graphql({
                query: queries.listProducts,
                variables: variables
            });

            const productsArray = ProductsQuery.data.listProducts.items;
            setProductsData(productsArray);
            console.log(productsArray);
        };

        fetchProductsData();

    }, []);

    return (
        <AdminRoute>
            <>
                <main className={styles.main}>

                    <h1>Saltwater Inventory</h1>

                    <AdminInvManager classification='SW' />


                    {productsData.length > 0 ? (

                        <Collection
                            items={productsData}
                            type="list"
                            direction="row"
                            alignContent="center"
                            alignItems="center"
                            justifyContent="center"
                            gap="20px"
                            wrap="wrap"
                            isPaginated
                            itemsPerPage={9}
                            isSearchable
                        >

                            {(item, index) => (
                                <Card
                                    key={index}
                                    borderRadius="medium"
                                    maxWidth="20rem"
                                    minWidth="20rem"
                                    variation="outlined"
                                >
                                    <Image
                                        src={`https://source.unsplash.com/800x600/?fish&${Math.random()}`}
                                        alt="image of product"
                                    />
                                    <View padding="xs" >
                                        <Flex justifyContent="center"
                                            alignItems="center"
                                            alignContent="center">

                                        </Flex>
                                        <Divider padding="xs" />
                                        <Heading padding="medium">{item.name}</Heading>
                                        <Button variation="primary" isFullWidth>
                                            Add to Cart
                                        </Button>
                                    </View>
                                </Card>

                            )}

                        </Collection>

                    ) : (
                        <Loader size="large" variation="linear" />

                    )}

                    <Card variation="outlined">
                        <ProductsCreateForm
                            onSubmit={async (fields) => {

                                const response = await fetch("../api/create-product", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "x-api-key": "da2-o3bdlq4frreq7kjuzjou2kjjfe"
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
