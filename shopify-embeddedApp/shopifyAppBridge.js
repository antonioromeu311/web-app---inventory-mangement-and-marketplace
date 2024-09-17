import React from 'react';
import { useEffect, useState } from 'react';
import shopify from 'src/pages/api/shopifyAuth/shopifyClient';
import enTranslations from '@shopify/polaris/locales/en.json';
import OnBoardPage from 'src/pages/shopifyLane/onBoard';
import useConnection from 'src/pages/shopifyLane/useConnection';
import createApp from '@shopify/app-bridge';
import { ResourcePicker, Redirect } from '@shopify/app-bridge/actions';
import {
    AppProvider, Page, LegacyCard, Text, Divider, Banner, Modal, Badge,
    Button, FooterHelp, Layout, Link, ResourceList, ResourceItem
} from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import axios from 'axios';

export default function EmbeddedApp() {

    const hostFromUrl = new URLSearchParams(location.search).get("host");
    const decodedHost = atob(hostFromUrl);
    const parts = decodedHost.split('/');  // split the decoded string by /
    const shopName = parts[parts.length - 1];  // last part of split string
    //console.log(shopName);

    const { connected, checkConnectionStatus } = useConnection(shopName); //connection to fish reef account
    const [selectedProducts, setSelectedProducts] = useState([]); //selected products from shop to publish
    const [classifyingProducts, setClassifyingProducts] = useState([]); //selected products to classify
    const [shopifySession, setShopifySession] = useState(null); //session object, has access token
    const [activePublishCount, setActivePublishCount] = useState(0); //published products in fish reef
    const [allowPublish, setAllowPublish] = useState(false); //allow publishing to fish reef
    const [productPublishCount, setProductPublishCount] = useState(0); //products from shop available for publishing count
    const [showBanner, setShowBanner] = useState(false); //feedback banner
    const [showModal, setShowModal] = useState(false); //classification modal
    const [renderKey, setRenderKey] = useState(0); //force rerender of resource list

    const config = {
        apiKey: '1dcdbfd3666496afca45cbaf34d6776e',
        host: hostFromUrl,
        forceRedirect: true,
    };
    const app = createApp(config);

    useEffect(() => {
        console.log('classifyingProducts updated:', classifyingProducts);
        if (classifyingProducts.length > 0) {
            const updatedSelectedProducts = selectedProducts.map((product) => {
                const found = classifyingProducts.find(cp => cp.shopifyID === product.shopifyID);
                return found ? found : product;
            });
            setSelectedProducts(updatedSelectedProducts);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classifyingProducts]);

    useEffect(() => {
        for (const product of selectedProducts) {
            if (product.classification !== 'SW' && product.classification !== 'FW' && product.classification !== 'FE') {
                setAllowPublish(false);
                return;
            }
        }
        setAllowPublish(true);
    }, [selectedProducts]);

    useEffect(() => {
        console.log('selectedProducts updated:', selectedProducts);
        setRenderKey(renderKey + 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProducts]);

    useEffect(() => {
        checkConnectionStatus();
    }, [checkConnectionStatus]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.post('/api/shopifyApp/getShopifySession', {
                    shop: `${shopName}.myshopify.com`,
                });
                setShopifySession(response.data);

                //double check testing
                console.log('shopify client scope:', shopify.config.scopes.compressedScopes);
                console.log('shopify stored session scope:', response.data.scope);
                const clientScopesArray = Array.from(shopify.config.scopes.compressedScopes);
                const sortedClientScopesArray = clientScopesArray.sort();
                const sessionScopesArray = (response.data.scope.split(',').sort());
                const areScopesEqual = JSON.stringify(sortedClientScopesArray) === JSON.stringify(sessionScopesArray);
                if (!areScopesEqual) {
                    console.log('scopes are not equal, redirecting to auth page');
                    const redirect = Redirect.create(app);
                    redirect.dispatch(Redirect.Action.REMOTE, '/api/shopifyAuth/startAuth', { force: true })
                }

                const responseListings = await axios.post('/api/shopifyApp/getShopifyListingsCount', {
                    shopName: shopName,
                    accessToken: response.data.accessToken,
                });
                if (responseListings.status === 200) {
                    setProductPublishCount(responseListings.data.count);
                }
            } catch (error) {
                console.error('Error fetching shopify session data and listings count:', error);
            }
        }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {

    }, [shopifySession]);



    const redirectToBulkEditor = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.ADMIN_PATH, {
            path: `/admin/bulk?resource_name=Product&edit=variants.price%3Astring`,
        });
    };

    async function fetchActiveProductsCount() {
        try {
            const response = await axios.post('/api/shopifyApp/getActiveProductsCount', {
                shop: shopName + '.myshopify.com',
            });
            if (response.status === 200) {
                setActivePublishCount(response.data.count);
            }
        } catch (error) {
            console.error('Error fetching shopify active publish count:', error);
        }
    }

    useEffect(() => {
        fetchActiveProductsCount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    async function resourceFeedbackStart() {
        const response = await axios.post('/api/shopifyApp/handleResourceFeedback', {
            shopName: shopName,
            status: 'startClassifyingFeedback',
        });
        console.log('feedback creation response status:', response.status);
        if (response.status === 200) {
            return true;
        } else {
            return false;
        }
    }

    async function resourceFeedbackEnd() {
        const response = await axios.post('/api/shopifyApp/handleResourceFeedback', {
            shopName: shopName,
            status: 'endClassifyingFeedback',
        });
        console.log('feedback creation response status:', response.status);

        if (response.status === 200) {
            return true;
        } else {
            return false;
        }
    }

    const picker = ResourcePicker.create(app, {
        resourceType: ResourcePicker.ResourceType.Product,
        options: {
            selectMultiple: true,
        },
    });

    picker.subscribe(ResourcePicker.Action.SELECT, async (selectPayload) => {
        console.log('Selected products', selectPayload.selection);
        const productsArray = selectPayload.selection;
        const selectedProductsArray = [];
        setSelectedProducts([]);
        setClassifyingProducts([]);
        for (const product of productsArray) {
            console.log('product:', product);
            if (product.hasOnlyDefaultVariant === true) {
                const title = product.title;
                const desc = (product.descriptionHtml).replace(/<[^>]*>/g, '');
                const imageID = (product.images[0]) ? product.images[0].id : null;
                const price = product.variants[0].price; //in format of 0.00
                const invAmount = product.totalInventory;
                const shopifyID = product.id;
                const SKU = product.variants[0].sku;
                const attributes = { title, desc, imageID, price, invAmount, SKU, shopifyID };
                console.log('attributes:', attributes);
                const imageResponse = await axios.post('/api/shopifyApp/handleShopifyImage', {
                    shopifyID: shopifyID,
                    shopName: shopName,
                });
                console.log('imageResponse:', imageResponse);
                const systemTagAWS = (imageResponse.data.imageURL === null) ? `#shop_(${shopName}.myshopify.com)` : `#shop_(${shopName}.myshopify.com), #imageURL_(${imageResponse.data.imageURL})`;
                const productAWS = {
                    shopifyID: shopifyID, //remove before creating product
                    name: title,
                    description: (desc === '') ? title : desc,
                    price: price * 100, //stripe requires price in cents
                    classification: null,
                    amountOnHand: invAmount,
                    amountCommit: 0,
                    amountTotal: invAmount,
                    systemTag: systemTagAWS,
                };
                console.log('product:', productAWS);
                selectedProductsArray.push(productAWS);
            } else {
                //multiple variants, treat like separate products, for loop; possible same image & desc, everything else diff
                const product_imageID = (product.images[0]) ? product.images[0].id : null;
                const desc = (product.descriptionHtml).replace(/<[^>]*>/g, '');
                const variantsArray = product.variants;
                for (const variant of variantsArray) {
                    const title = variant.displayName; //full title with variant name
                    const price = variant.price; //in format of 0.00
                    const invAmount = variant.inventoryQuantity;
                    const shopifyID = variant.id;
                    const imageID = (variant.imageID === undefined) ? product_imageID : variant.imageID;
                    const SKU = variant.sku;
                    const attributes = { title, desc, imageID, price, invAmount, SKU, shopifyID };
                    console.log('attributes:', attributes);
                    const imageResponse = await axios.post('/api/shopifyApp/handleShopifyImage', {
                        shopifyID: (variant.imageID === undefined) ? product.id : shopifyID,
                        shopName: shopName,
                    }
                    );
                    console.log('imageResponse:', imageResponse);
                    const systemTagAWS = (imageResponse.data.imageURL === null) ? `#shop_(${shopName}.myshopify.com)` : `#shop_(${shopName}.myshopify.com), #imageURL_(${imageResponse.data.imageURL})`;
                    const productAWS = {
                        shopifyID: shopifyID, //remove before creating product
                        name: title,
                        description: (desc === '') ? title : desc,
                        price: price * 100, //stripe requires price in cents
                        classification: null,
                        amountOnHand: invAmount,
                        amountCommit: 0,
                        amountTotal: invAmount,
                        systemTag: systemTagAWS,
                    };
                    console.log('product:', productAWS);
                    selectedProductsArray.push(productAWS);
                }
            }
        }
        setSelectedProducts(selectedProductsArray);
        setShowBanner(true);
        resourceFeedbackStart();
        console.log('selectedProductsArray:', selectedProductsArray);
    });

    function applyClassification(classification) {
        console.log('classification:', classification);
        console.log('classifyingProducts before updating:', classifyingProducts);
        const updatedClassifyingProducts = classifyingProducts.map((product) => ({
            ...product,
            classification: classification === 'clear' ? null : classification,
        }));
        setClassifyingProducts(updatedClassifyingProducts);


    }


    const promotedBulkActions = [
        {
            content: 'Clear All Classifications',
            onAction: () => {
                console.log('clearing classifications...');
                applyClassification('clear');
            },
        },
    ];
    const bulkActions = [
        {
            content: 'Classify Saltwater (SW)',
            onAction: () => {
                console.log('classifying products as SW...');
                applyClassification('SW');
            },
        },
        {
            content: 'Classify FreshWater (FW)',
            onAction: () => {
                console.log('classifying products as FW...');
                applyClassification('FW');
            },
        },
        {
            content: 'Classify Food & Equipment (FE)',
            onAction: () => {
                console.log('classifying products as FE...');
                applyClassification('FE');
            },
        },
    ];

    function renderItem(item) {
        const { shopifyID, name, description, classification } = item;
        return (
            <ResourceItem id={shopifyID.toString()}>
                <Text variant='bodyMd' fontWeight='bold' as='h3'>{name}</Text>
                <div>
                    <p>Description: {description}</p>
                    <p>Classification: <strong>{classification}</strong></p>
                </div>
            </ResourceItem>
        );
    }

    function handleOpenModal() {
        setShowModal(true);
    }

    function FeedbackBanner() {
        if (selectedProducts.length > 0 && showBanner === true) {
            return (
                <Banner
                    title="Products in Fish Reef Require Classification Before Publishing!"
                    status="warning"
                    action={{ content: 'Classify Products', onAction: handleOpenModal }}
                    secondaryAction={{ content: 'Clear Selection', onAction: handleCancel }}
                    onDismiss={() => {
                        setShowBanner(false);
                        setSelectedProducts([]);
                        setClassifyingProducts([]);
                    }}
                >
                    <p>{selectedProducts.length} product(s) must be classified into one of the following classifications:
                        SW (Saltwater), FW (FreshWater), or FE (Food & Equipment). Each variant of a product acts as a new product in our system.</p>
                </Banner>
            );
        }
    }

    function handleCancel() {
        setSelectedProducts([]);
        setClassifyingProducts([]);
        setShowBanner(false);
        setClassifyingProducts([]);
        setShowModal(false);
    }


    async function handlePublish() {
        console.log('classifying products...');

        setShowModal(false);
        let successCount = 0;
        let errorCount = 0;

        for (const product of selectedProducts) {
            const response = await axios.post('/api/shopifyApp/handleImportProducts', {
                name: product.name,
                description: product.description,
                price: product.price,
                classification: product.classification,
                amountOnHand: product.amountOnHand,
                amountCommit: product.amountCommit,
                amountTotal: product.amountTotal,
                systemTag: product.systemTag,
            });
            console.log('response status from create product:', response.status);
            if (response.status === 200) {
                successCount++;
            } else {
                errorCount++;
            }
        }

        console.log('successCount:', successCount);
        console.log('errorCount:', errorCount);

        resourceFeedbackEnd();
        handleCancel();
        fetchActiveProductsCount();
    }

    return (
        <AppProvider i18n={enTranslations}>
            <Page fullWidth title="Welcome to Cerberus">
                <Layout>
                    <Layout.AnnotatedSection
                        id="AccountConnection"
                        title="Fish Reef Account"
                        description="Connect your Fish Reef Account so you can manage and sync with The Fish Reef.">
                        <OnBoardPage shopName={shopName} />
                        <Divider />
                    </Layout.AnnotatedSection>


                    <Layout.AnnotatedSection
                        title="Publishing"
                        description="Products that are being synced to your catalog, or have errors preventing their sync, are shown here. 
                        Select products to publish them from your catalog. May take a few minutes to update."
                    >

                        <LegacyCard sectioned title="Product Status" actions={[{ content: 'Manage Availability', onAction: redirectToBulkEditor }]}>

                            <LegacyCard.Section>

                                <Banner title="Product Classification Requirement" onDismiss={() => { }}>
                                    <Text>
                                        <strong>Important:</strong> Products must be classified before publishing.
                                        In order to publish, all products must be classified into one of the following classifications:
                                        SW (Saltwater), FW (FreshWater), or FE (Food & Equipment). Each variant of a product acts as a new product in our system.
                                        You will be prompted to classify products after selecting them to publish.
                                    </Text>
                                </Banner>

                                <FeedbackBanner />

                            </LegacyCard.Section>
                            <LegacyCard.Section>
                                <Button disabled={(connected) ? false : true} onClick={() => picker.dispatch(ResourcePicker.Action.OPEN)}>Select Products To Publish</Button>




                                <Text>
                                    <strong>{productPublishCount}</strong> available product listings found in your Shopify catalog.
                                </Text>

                            </LegacyCard.Section>
                            <LegacyCard.Section>

                                <Text><Badge status="success">published</Badge> {activePublishCount} products (including variants) currently published to Fish Reef</Text>
                                <Text><Badge status="critical">Not published</Badge> {(productPublishCount - activePublishCount < 0) ? 0 : (productPublishCount - activePublishCount)} product listings </Text>

                            </LegacyCard.Section>
                        </LegacyCard>

                    </Layout.AnnotatedSection>

                    <Layout>
                        <Modal
                            open={showModal}
                            onClose={handleCancel}
                            title="Classify Selected Products"
                            primaryAction={{
                                content: 'Classify & Publish',
                                onAction: () => {
                                    handlePublish();
                                },
                                disabled: allowPublish ? false : true,
                            }}
                            secondaryActions={[
                                {
                                    content: 'Cancel & Clear',
                                    onAction: () => {
                                        handleCancel();
                                        setShowModal(false);
                                    },
                                },
                            ]}
                        >
                            <Modal.Section>
                                <div>
                                    <LegacyCard sectioned>
                                        <ResourceList
                                            key={renderKey} //force rerender
                                            items={selectedProducts}
                                            renderItem={renderItem}
                                            selectedItems={classifyingProducts.map(product => product.shopifyID.toString())} // Convert id to string if it's a number
                                            onSelectionChange={(newSelectedItems) => {
                                                const newClassifyingProducts = selectedProducts.filter(product =>
                                                    newSelectedItems.includes(product.shopifyID.toString()) // Convert id to string if it's a number
                                                );
                                                setClassifyingProducts(newClassifyingProducts);
                                            }}
                                            promotedBulkActions={promotedBulkActions}
                                            bulkActions={bulkActions}
                                        />
                                    </LegacyCard>
                                </div>
                            </Modal.Section>
                        </Modal>
                    </Layout>

                    <Layout>
                        <FooterHelp sectioned>
                            Contact us for {' '}
                            <Link url="">
                                any questions or concerns
                            </Link>
                        </FooterHelp>
                    </Layout>
                </Layout>
            </Page>
        </AppProvider>

    );
}
