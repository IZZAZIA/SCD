// DESIGN PATTERN: OBSERVER (second concrete observer) - optional email channel (proposal: "email is optional").
// Listens for notification.created and forwards it. The default transport only logs; plug in nodemailer later.
class EmailObserver {
  constructor({ userRepository, transport = (to, subject, text) => console.log(`[email] to=${to} | ${subject} | ${text}`) }) {
    this.users = userRepository;
    this.transport = transport;
  }
  async update(_topic, { notification }) {
    const user = await this.users.findById(notification.userId);
    if (user?.isActive()) await this.transport(user.email, 'BOOKT notification', notification.message);
  }
}
module.exports = EmailObserver;
