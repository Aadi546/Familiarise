import { createReminder, getReminders } from '../services/reminder.service.js';
import { optionalString, requireString, requireUuid } from '../utils/validators.js';

export async function listReminders(req, res) {
  const familyId = requireUuid(req.params.familyId, 'Family id');
  const viewerId = requireUuid(req.query.viewerId, 'Viewer id');
  const reminders = await getReminders({ familyId, viewerId });

  res.json({ reminders });
}

export async function postReminder(req, res) {
  const familyId = requireUuid(req.params.familyId, 'Family id');
  const authorId = requireUuid(req.body.authorId, 'Author id');
  const title = requireString(req.body.title, 'Title', 160);
  const details = optionalString(req.body.details, 'Details', 1000);
  const remindOn = requireString(req.body.remindOn, 'Reminder date', 20);
  const reminder = await createReminder({ familyId, authorId, title, details, remindOn });

  res.status(201).json({ reminder });
}
