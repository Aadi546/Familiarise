import { loginWithPin } from '../services/auth.service.js';
import { requirePin, requireString } from '../utils/validators.js';

export async function login(req, res) {
  const fullName = requireString(req.body.fullName, 'Full name', 120);
  const pin = requirePin(req.body.pin);
  const result = await loginWithPin(fullName, pin);

  res.json(result);
}
