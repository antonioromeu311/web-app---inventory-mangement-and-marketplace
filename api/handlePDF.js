import { S3, GetObjectCommand } from '@aws-sdk/client-s3';
import { TextractClient, StartDocumentAnalysisCommand } from '@aws-sdk/client-textract';
import { fromIni } from '@aws-sdk/credential-provider-ini';

const s3 = new S3({ region: 'us-east-1', credentials: fromIni() });
const textract = new TextractClient({ region: 'us-east-1', credentials: fromIni() });

export default async function handler(req, res) {
  try {
    // send S3 object to textract
    const textractParams = {
      DocumentLocation: {
        S3Object: {
          Bucket: '',
          Name: '',
        },
      },
      FeatureTypes: ['TABLES', 'FORMS'],
      JobTag: 'AnalyzeDocument_PDF_Invoice', // optional, any string identify the job.
      NotificationChannel: {
        RoleArn: '',
        SNSTopicArn: ''
      }
    };

    const analyzeCommand = new StartDocumentAnalysisCommand(textractParams);
    const response = await textract.send(analyzeCommand);
    const jobId = response.JobId;

    // respond with job ID
    const jsonResponse = {
      message: 'PDF analysis started successfully',
      jobId: jobId,
    };

    res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Error starting PDF analysis:', error);
    res.status(500).json({ error: 'Failed to start PDF analysis. Error message: ' + error.message });
  }
}
