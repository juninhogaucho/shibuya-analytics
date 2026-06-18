export { ApiError } from './api/httpClient'
export {
  assertDashboardBackendReady,
  getDashboardAlerts,
  getDashboardOverview,
  getEdgePortfolio,
  getShadowBoxing,
  getSlumpPrescription,
  getTradeHistory,
  getTradePasteMemory,
  getTradingReportComparison,
  getTradingReports,
  parseTradePaste,
  submitParsedTrades,
  uploadTradesCSV,
} from './api/dashboard'
export {
  bootstrapPassword,
  changePassword,
  clearAllData,
  forgotPassword,
  isAuthenticated,
  login,
  logout,
  register,
  requestActivation,
  resetPassword,
  verifyActivation,
} from './api/auth'
export type {
  BootstrapPasswordResponse,
  ChangePasswordResponse,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordResponse,
} from './api/auth'
export {
  createCheckoutSession,
  getCheckoutSession,
  trackAffiliateClick,
} from './api/checkout'
export type {
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  CheckoutSessionStatus,
} from './api/checkout'
export {
  getTraderProfileContext,
  logTraderLifecycleEvent,
  saveTraderDailyBriefing,
  saveTraderDailyDebrief,
  saveTraderProfileContext,
} from './api/trader'
export type {
  TraderLifecycleEventPayload,
  TraderProfileContextPayload,
} from './api/trader'
export {
  bookMyAppointment,
  cancelMyAppointment,
  createSupportTicket,
  getAppointmentSlots,
  getMyAppointments,
  getSupportTicket,
  getSupportTickets,
  replyToSupportTicket,
} from './api/support'
export {
  getShibuyaAffiliateReport,
  getShibuyaOpsCase,
  getShibuyaOpsCases,
  sendShibuyaOpsReminder,
  updateShibuyaOpsCase,
} from './api/ops'
export { submitContactMessage } from './api/site'
export type { ContactMessagePayload } from './api/site'
