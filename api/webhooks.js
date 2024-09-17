require('dotenv').config();
import { Stripe } from 'stripe';
import { buffer } from 'micro';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;
import axios from 'axios';

export const config = {
    api: {
        bodyParser: false,
    }
};


const handlePaymentFail = (session) => {
    console.log('Payment failed for session: ' + session.id);
};

async function HandlePaymentSuccess(session) {

    console.log('Payment successful for session: ' + session.id);

    const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
        session.id,
        {
            expand: ['line_items.data'],
        }
    );

    const lineItems = sessionWithLineItems.line_items.data;
    console.log('lineItems:\n', lineItems);

    const customerEmail = session.customer_details.email;
    const customerName = session.customer_details.name;
    const customerAddress = session.customer_details.address;


    const prepOrderResponse = await axios.post(``,
        {
            customerName: customerName,
            customerEmail: customerEmail,
            customerAddress: customerAddress,
            lineItems: lineItems
        }, {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 30000
    });

    if (prepOrderResponse && prepOrderResponse.status == 200) {
        console.log('Success! Data shipped off successfully!');
        return 'SUCCESS';
    } else {
        console.log('Failure! Data failed to ship off!');
        try {
            console.log('prepOrderResponse.status: ', prepOrderResponse.status);
        } catch (error) {
            console.log('prepOrderResponse does not exist: ', error);
        }
        return 'FAILURE';
    }
};

export default async function webhookHandler(req, res) {

    if (req.method == 'POST') {
        const buf = await buffer(req);
        const sig = req.headers['stripe-signature'];

        let event;

        try {

            if (!sig || !webhookSecret) return;
            event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);

        } catch (error) {
            console.log('Webhook error: ' + error.message);
            return res.status(400).send('Webhook error: ' + error.message);
        }

        const session = event.data.object;

        switch (event.type) {
            case 'checkout.session.completed': {

                if (session.payment_status === 'paid') {
                    const handlePaymentSuccessRes = await HandlePaymentSuccess(session);

                    if (handlePaymentSuccessRes === 'SUCCESS') {
                    res.status(200).json({ message: 'Data shipped off successfully!' }); 
                } else {
                    res.status(500).json({ message: 'Data failed to ship off!' }); }

                } else {
                    console.log('Payment failed! From checkout.session.completed');
                    handlePaymentFail(session);
                    res.status(500).json({ message: 'Payment failure! Order not created.' });
                }

                break;
            }

            case 'checkout.session.async_payment_succeeded': {
                HandlePaymentSuccess(session);
                break;
            }

            case 'checkout.session.async_payment_failed': {
                handlePaymentFail
                break;
            }

            default: {
                console.log('Unhandled event type:\n' + event.type);
                break;
            }


        }

        console.log('event type: ' + event.type);
        res.status(200).end();
        return;
    } else {
        res.status(405).send('Method Not Allowed');
    }
}
