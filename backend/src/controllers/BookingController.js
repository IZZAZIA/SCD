class BookingController {
  constructor(bookingService) { this.bookings = bookingService; }
  request = async (req, res) => res.status(201).json(await this.bookings.request(req.user, req.body));
  mine = async (req, res) => res.json(await this.bookings.listMine(req.user));
  all = async (req, res) => res.json(await this.bookings.listAll(req.query));
  get = async (req, res) => res.json(await this.bookings.getById(req.user, req.params.id));
  review = async (req, res) => res.json(await this.bookings.review(req.user, req.params.id, req.body));
  cancel = async (req, res) => res.json(await this.bookings.cancel(req.user, req.params.id));
}
module.exports = BookingController;
