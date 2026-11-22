class NotificationController {
  constructor(notificationService, reminderService) {
    this.notifications = notificationService;
    this.reminders = reminderService;
  }
  list = async (req, res) => res.json(await this.notifications.listFor(req.user));
  markRead = async (req, res) => res.json(await this.notifications.markRead(req.user, req.params.id));
  markAllRead = async (req, res) => res.json(await this.notifications.markAllRead(req.user));
  runReminders = async (_req, res) => res.json(await this.reminders.runOnce());
  sendReminder = async (req, res) => res.json(await this.reminders.sendManual(req.user, req.body));
}
module.exports = NotificationController;
