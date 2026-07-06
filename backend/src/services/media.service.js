import crypto from 'node:crypto';
import path from 'node:path';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env, isR2Configured } from '../config/env.js';
import { r2 } from '../config/r2.js';
import { supabase } from '../config/supabase.js';
import { assertFamilyMember } from './family.service.js';
import { badRequest } from '../utils/httpError.js';

const allowedTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'audio/webm',
  'audio/mp4',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav'
]);
const maxUploadSize = 50 * 1024 * 1024;

export async function createUploadIntent({ familyId, userId, fileName, fileType, fileSize }) {
  await assertFamilyMember(userId, familyId);

  if (!isR2Configured || !r2) {
    throw badRequest('R2 is not configured. Add Cloudflare R2 values to backend/.env before uploading images.');
  }

  if (!allowedTypes.has(fileType)) {
    throw badRequest('Only common image, video, and audio files are supported.');
  }

  if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > maxUploadSize) {
    throw badRequest('Media must be 50 MB or smaller.');
  }

  const ext = path.extname(fileName || '').toLowerCase() || '.jpg';
  const key = `families/${familyId}/${crypto.randomUUID()}${ext}`;

  const command = new PutObjectCommand({
    Bucket: env.r2Bucket,
    Key: key,
    ContentType: fileType,
    ContentLength: fileSize
  });

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });
  const publicUrl = `${env.r2PublicBaseUrl.replace(/\/$/, '')}/${key}`;

  const { data, error } = await supabase
    .from('media_files')
    .insert({
      family_id: familyId,
      uploaded_by: userId,
      r2_key: key,
      public_url: publicUrl,
      file_type: fileType,
      file_size: fileSize
    })
    .select('id, public_url, file_type, file_size')
    .single();

  if (error) {
    throw error;
  }

  return {
    uploadUrl,
    mediaFile: data
  };
}
