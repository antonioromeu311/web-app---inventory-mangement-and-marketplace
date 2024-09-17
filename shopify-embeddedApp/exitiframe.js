import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge, Loading } from "@shopify/app-bridge-react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import AppBridgeProvider from "src/components/appBridgeProvider";

export default function ExitIframe() {
    return (
        <AppBridgeProvider>
            <ExitIframeContent />
        </AppBridgeProvider>
    );
}

function ExitIframeContent() {
    const app = useAppBridge();
    const router = useRouter();
    

    useEffect(() => {
        // wait for router to be ready, and for query values to be populated
        if (!router.isReady) return;
        
        const params = new URLSearchParams(router.asPath.split('?')[1]);
        const redirectUri = params.get("redirectUri");
        
        if (!!app && !!redirectUri) {
            const url = new URL(decodeURIComponent(redirectUri));

            if (url.hostname === window.location.hostname) {
                const redirect = Redirect.create(app);
                redirect.dispatch(
                    Redirect.Action.REMOTE,
                    decodeURIComponent(redirectUri)
                );
            }
        }
    }, [app, router.isReady, router.asPath]);

    return <Loading />;
}