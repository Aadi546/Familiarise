import { badRequest } from './httpError.js';

export function requireString(value, field, maxLength = 5000) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw badRequest(`${field} is required.`);
  }

  const normalized = value.trim();

  if (normalized.length > maxLength) {
    throw badRequest(`${field} is too long.`);
  }

  return normalized;
}

export function optionalString(value, field, maxLength = 5000) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw badRequest(`${field} must be text.`);
  }

  const normalized = value.trim();

  if (normalized.length > maxLength) {
    throw badRequest(`${field} is too long.`);
  }

  return normalized || null;
}

export function requireUuid(value, field) {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (typeof value !== 'string' || !uuidPattern.test(value)) {
    throw badRequest(`${field} must be a valid id.`);
  }

  return value;
}

export function requirePin(value) {
  if (typeof value !== 'string' || !/^[0-9]{4}$/.test(value)) {
    throw badRequest('PIN must be exactly 4 digits.');
  }

  return value;
}
