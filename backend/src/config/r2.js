import { S3Client } from '@aws-sdk/client-s3';
import { env, isR2Configured } from './env.js';

export const r2 = isR2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${env.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.r2AccessKeyId,
        secretAccessKey: env.r2SecretAccessKey
      }
    })
  : null;
