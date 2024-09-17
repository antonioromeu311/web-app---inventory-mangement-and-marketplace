require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function prepCheckout(req, res) {

    const getRetailPrice = (price) => {
        return Math.ceil(price * 1.5);
    }

    if (req.method == 'POST') { // Process a POST request
        console.log('prepCheckout function called');
        const cartItems = req.body;
        console.log('cart items:\n', cartItems);
        const products = await stripe.products.list({ active: true });
        const lineItems = [];

        try {
            for (const cartItem of cartItems) {
                const matchingProduct = products.data.find(
                    product => product.description === cartItem.name && product.price === getRetailPrice(cartItem.price)
                );

                if (matchingProduct !== undefined) {
                    // If the cart item exists as a product on Stripe, 
                    //add it to the line items array with the matching price ID
                    lineItems.push({
                        price: matchingProduct.price.id,
                        quantity: cartItem.quantity,
                    });
                } else {
                    // If the cart item does not exist as a product on Stripe, 
                    //create a new product and price and add it to the line items array
                    const newProduct = await stripe.products.create({
                        name: cartItem.name,
                        description: cartItem.description,
                    });

                    const newPrice = await stripe.prices.create({
                        unit_amount: getRetailPrice(cartItem.price), // Stripe prices are in cents
                        currency: 'usd',
                        product: newProduct.id,
                    });

                    lineItems.push({
                        price: newPrice.id,
                        quantity: cartItem.quantity,
                    });
                }
            }
        } catch (error) {
            console.log('error while stepping through cartItems during checkout prep:\n', error);
            console.log(error);
            return res.status(500).json({ message: error.message });
        }

        console.log('LINE ITEMS:\n' + JSON.stringify(lineItems));


        try {

            const session = await stripe.checkout.sessions.create({
                line_items: lineItems,
                mode: 'payment',
                success_url: ``,
                cancel_url: ``,
                shipping_address_collection: {
                    allowed_countries: ['US'],
                },
            });
            res.json({ url: session.url });
        } catch (error) {
            console.log('error:\n' + error);
            res.status(500).json({ message: error.message });
        }

    } else {
        // Handle any other HTTP method
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }

}
