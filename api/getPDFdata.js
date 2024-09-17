import { TextractClient, GetDocumentAnalysisCommand } from '@aws-sdk/client-textract';
import { fromIni } from '@aws-sdk/credential-provider-ini';

const textract = new TextractClient({ region: 'us-east-1', credentials: fromIni() });

export default async function getPDFdata(req, res) {
    try {
        const { JobId } = req.body;
        const params = {
            JobId: JobId,
        };


        const command = new GetDocumentAnalysisCommand(params);
        const response = await textract.send(command);

        if (!response || !response.JobStatus) {
            throw new Error('Invalid response from Textract service');
        }

        const blocks = response.Blocks;

        for (const block of blocks) {
            if (block.BlockType === 'LINE') {
                console.log(block.Text);
            }
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting PDF data:', error);
        res.status(500).json({ error: 'Failed to get PDF data. Error message: ' + error.message });
    }
}