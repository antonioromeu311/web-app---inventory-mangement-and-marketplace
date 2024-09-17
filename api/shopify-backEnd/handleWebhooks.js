import axios from "axios";



export default async function handleWebhooks(req, res) {

    console.log('handle shopify webhooks called');
    const { accessToken, shop } = req.body;
    console.log('shop:', shop);
    //check for existing webhooks
    try{
    const response = await axios.get(`https://${shop}/admin/api/2023-10/webhooks.json`, {
        headers: {
            'X-Shopify-Access-Token': accessToken,
        }
    });
    console.log('response from webhook post:', response.data.webhooks);

    if (response.data.webhooks.length > 0) {
        console.log('webhooks already exist');
        res.status(200).json(response.data); 
    } else {
        const listingsWebhooks = await axios.post(`https://${shop}/admin/api/2023-10/webhooks.json`, {
            "webhook": {
                "topic": "product_listings/update",
                "address": "",
                "format": "json"
            }
        }, {
            headers: {
                'X-Shopify-Access-Token': accessToken,
            }
        });
        console.log('listings response:', listingsWebhooks.data);

        res.status(200);
    }
    } catch (error) {
        console.error('Error fetching webhooks:', error.data);
        res.status(500).json(error.data);
    }
}
