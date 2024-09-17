import { useState } from "react";
import { Provider } from "@shopify/app-bridge-react";
import { Banner, Layout, Page } from "@shopify/polaris";

export function AppBridgeProvider({ children }) {

    const apiKey = '';


    const [appBridgeConfig] = useState(() => {
        const host =
            new URLSearchParams(window.location.search).get("host") ||
            window.__SHOPIFY_DEV_HOST;

        window.__SHOPIFY_DEV_HOST = host;

        return {
            host,
            apiKey: apiKey,
            forceRedirect: true,
        };
    });

    if (!apiKey || !appBridgeConfig.host) {
        const bannerProps = !apiKey
            ? {
                title: "Missing Shopify API Key",
                children: (
                    <>
                        Your app is running without the SHOPIFY_API_KEY environment
                        variable. Please ensure that it is set when running or building
                        your React app.
                    </>
                ),
            }
            : {
                title: "Missing host query argument",
                children: (
                    <>
                        Your app can only load if the URL has a <b>host</b> argument.
                        Please ensure that it is set, or access your app using the
                        Partners Dashboard <b>Test your app</b> feature
                    </>
                ),
            };

        return (
            <Page narrowWidth>
                <Layout>
                    <Layout.Section>
                        <div style={{ marginTop: "100px" }}>
                            <Banner {...bannerProps} status="critical" />
                        </div>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    return (
        <Provider config={appBridgeConfig}>
            {children}
        </Provider>
    );
}


export default AppBridgeProvider;