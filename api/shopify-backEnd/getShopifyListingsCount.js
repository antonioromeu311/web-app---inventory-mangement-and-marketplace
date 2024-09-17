import axios from 'axios';

export default async function getShopifyListingsCount(req, res) {
    const { shopName, accessToken } = req.body;

    try {
        const response = await axios.get(`https://${shopName}.myshopify.com/admin/api/2023-10/product_listings/count.json`, {
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
        });
        console.log('response:', response.data);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching publish count:', error.data);
        res.status(500).json({ count: null });
    }

}