import { api } from './client.js';

export function login(fullName, pin) {
  return api('/login', {
    method: 'POST',
    body: JSON.stringify({ fullName, pin })
  });
}
