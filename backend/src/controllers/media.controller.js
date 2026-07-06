import { createUploadIntent } from '../services/media.service.js';
import { env, isR2Configured } from '../config/env.js';
import { requireString, requireUuid } from '../utils/validators.js';
import { badRequest } from '../utils/httpError.js';

export async function getMediaStatus(req, res) {
  res.json({
    configured: isR2Configured,
    bucket: env.r2Bucket || null,
    publicBaseUrl: env.r2PublicBaseUrl || null,
    maxUploadMb: 50,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
  });
}

export async function createSignedUpload(req, res) {
  const familyId = requireUuid(req.body.familyId, 'Family id');
  const userId = requireUuid(req.body.userId, 'User id');
  const fileName = requireString(req.body.fileName, 'File name', 240);
  const fileType = requireString(req.body.fileType, 'File type', 80);
  const fileSize = Number(req.body.fileSize);

  if (!Number.isFinite(fileSize)) {
    throw badRequest('File size must be a number.');
  }

  const intent = await createUploadIntent({ familyId, userId, fileName, fileType, fileSize });

  res.status(201).json(intent);
}
