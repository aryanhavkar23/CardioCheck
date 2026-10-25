// CardioCheck Global Application State

export const state = {
  doctor: null,
  activeRoute: 'dashboard', // 'dashboard' | 'form' | 'results' | 'patient-profile'
  activePatientId: null,
  activePatient: null,
  activeAssessmentId: null,
  activeAssessment: null,
  dashboardSummary: null,
  patients: [],
  isLoading: false,
  notification: null
};

export function setNotification(message, type = 'info', duration = 3500) {
  state.notification = { message, type };
  window.dispatchEvent(new CustomEvent('state:notification', { detail: { message, type } }));
  if (duration > 0) {
    setTimeout(() => {
      state.notification = null;
      window.dispatchEvent(new CustomEvent('state:notification', { detail: null }));
    }, duration);
  }
}
