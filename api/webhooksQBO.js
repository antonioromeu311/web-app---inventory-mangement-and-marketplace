import crypto from 'crypto';


export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
        return;
    }
        const webhookPayload = JSON.stringify(req.body);
        const signature = req.headers['intuit-signature'];
        const fields = ['realmId', 'name', 'id', 'operation', 'lastUpdated'];
        const newLine = '\r\n';
        console.log('Initial Payload: ' + JSON.stringify(req.body));

        //invalid signature
        if (!signature) {
            res.status(401).send('Unauthorized signature'); 
        }

        //empty payload, do nothing
        if (!webhookPayload) {
            res.status(200).send('Success');
        }
        
        //validate payload with intuit-signature hash
        const hash = crypto.createHmac('sha256', 
        process.env.QBO_WEBHOOK_SECRET).update(webhookPayload).digest('base64');
        if (hash == signature) {
            console.log('Validated Payload JSON: ' + webhookPayload);
            console.log('Validated Payload Stringified: ' + JSON.stringify(webhookPayload));
            res.status(200).send('Successfully validated payload');
        }
        else {
            res.status(401).send('Unauthorized signature');
        }
        
  
}