class ReportController {
  constructor(reportService) { this.reports = reportService; }
  dashboard = async (req, res) => res.json(await this.reports.dashboard(req.user));
  utilization = async (req, res) => res.json(await this.reports.resourceUtilization(req.query));
  participation = async (_req, res) => res.json(await this.reports.eventParticipation());
}
module.exports = ReportController;
