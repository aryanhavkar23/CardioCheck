import { api } from './api.js';
import { state, setNotification } from './state.js';
import { renderDashboard } from './views/dashboard.js';
import { renderClinicalForm } from './views/form.js';
import { renderAssessmentResults } from './views/results.js';
import { renderPatientProfile } from './views/patientProfile.js';

export class Router {
  constructor(mainContainerId = 'mainContainer') {
    this.mainContainerId = mainContainerId;
    this.currentRoute = '';
    this.routes = {
      'dashboard': this.handleDashboard.bind(this),
      'form': this.handleForm.bind(this),
      'results': this.handleResults.bind(this),
      'patient-profile': this.handlePatientProfile.bind(this),
      // Aliases for sidebar links
      'patients': this.handlePatients.bind(this),
      'assessments': this.handleForm.bind(this),
      'reports': this.handleReports.bind(this),
    };
  }

  get container() {
    return document.getElementById(this.mainContainerId);
  }

  init() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      this.navigate(hash, false);
    });

    // Listen to custom navigation events
    window.addEventListener('route:navigate', (e) => {
      if (e.detail?.path) {
        this.navigate(e.detail.path);
      }
    });

    const initial = window.location.hash.replace('#', '') || 'dashboard';
    this.navigate(initial, false);
  }

  refresh() {
    this.navigate(this.currentRoute || 'dashboard', false);
  }

  async navigate(route, updateHash = true) {
    if (!api.isAuthenticated()) {
      window.dispatchEvent(new CustomEvent('auth:required'));
      return;
    }

    const cleanRoute = route.split('?')[0].replace('#', '') || 'dashboard';
    this.currentRoute = cleanRoute;

    if (updateHash) {
      window.location.hash = cleanRoute;
    }

    this.updateActiveNavLink(cleanRoute);

    const handler = this.routes[cleanRoute] || this.routes['dashboard'];
    const container = this.container;
    if (!container) return;

    // Show smooth loading transition
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-[60vh] gap-space-sm text-on-surface-variant">
        <span class="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
        <span class="font-body-md text-body-md font-medium">Loading clinical workspace...</span>
      </div>
    `;

    try {
      await handler(container);
    } catch (err) {
      console.error(`Route error [${cleanRoute}]:`, err);
      container.innerHTML = `
        <div class="p-space-lg rounded-xl bg-error-container/20 border border-error text-error flex flex-col gap-space-sm max-w-xl mx-auto my-12">
          <div class="flex items-center gap-space-sm font-headline-md">
            <span class="material-symbols-outlined">error</span>
            <span>Error Loading View</span>
          </div>
          <p class="font-body-md text-on-surface">${escapeHtml(err.message || 'An unexpected error occurred.')}</p>
          <div class="flex gap-space-sm mt-space-sm">
            <button id="retryBtn" class="px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-ui">Retry</button>
            <button id="goDashBtn" class="px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface font-label-ui">Return to Dashboard</button>
          </div>
        </div>
      `;
      container.querySelector('#retryBtn')?.addEventListener('click', () => this.refresh());
      container.querySelector('#goDashBtn')?.addEventListener('click', () => this.navigate('dashboard'));
    }
  }

  updateActiveNavLink(route) {
    const navLinks = document.querySelectorAll('aside nav a[data-path]');
    const activeRouteKey = route === 'patient-profile' ? 'patients' : (route === 'results' ? 'assessments' : route);

    navLinks.forEach(link => {
      const p = link.getAttribute('data-path');
      if (p === activeRouteKey || p === route) {
        link.className = 'flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-colors bg-primary-container text-on-primary font-headline-md';
        link.setAttribute('aria-current', 'page');
      } else {
        link.className = 'flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors';
        link.removeAttribute('aria-current');
      }
    });
  }

  // --- Route Handlers ---

  async handleDashboard(container) {
    document.title = 'CardioCheck — Doctor Dashboard';
    try {
      const summary = await api.getDashboardSummary();
      state.dashboardSummary = summary;
      if (summary.doctor) {
        state.doctor = summary.doctor;
        window.dispatchEvent(new CustomEvent('doctor:updated', { detail: summary.doctor }));
      }
    } catch (e) {
      console.warn('Dashboard summary fetch failed, using state or fallback:', e.message);
    }
    renderDashboard(container, this);
  }

  async handleForm(container) {
    document.title = 'CardioCheck — 13-Feature Clinical Assessment';
    if (!state.activePatient) {
      if (state.activePatientId) {
        try {
          state.activePatient = await api.getPatient(state.activePatientId);
        } catch (e) {
          console.warn('Could not load active patient details:', e.message);
        }
      } else {
        try {
          const patients = await api.getPatients();
          if (patients && patients.length > 0) {
            state.activePatient = patients[0];
            state.activePatientId = patients[0].id;
          }
        } catch (e) {
          console.warn('Could not fetch patients for form context:', e.message);
        }
      }
    }
    renderClinicalForm(container, this);
  }

  async handleResults(container) {
    document.title = 'CardioCheck — Assessment Classification Result';
    if (!state.activeAssessment && state.activeAssessmentId) {
      try {
        state.activeAssessment = await api.getAssessment(state.activeAssessmentId);
      } catch (e) {
        console.warn('Could not load assessment by ID:', e.message);
      }
    }
    renderAssessmentResults(container, this);
  }

  async handlePatientProfile(container) {
    document.title = 'CardioCheck — Patient Profile & History';
    if (!state.activePatientId) {
      try {
        const patients = await api.getPatients();
        if (patients && patients.length > 0) {
          state.activePatientId = patients[0].id;
          state.activePatient = patients[0];
        }
      } catch (e) {
        console.warn('Could not fetch default patient for profile:', e.message);
      }
    }

    if (state.activePatientId) {
      try {
        const [pat, asses] = await Promise.all([
          api.getPatient(state.activePatientId),
          api.getPatientAssessments(state.activePatientId)
        ]);
        state.activePatient = pat;
        state.patientAssessments = asses;
      } catch (e) {
        console.warn('Could not fetch full patient profile details:', e.message);
      }
    }

    renderPatientProfile(container, this);
  }

  async handlePatients(container) {
    // Navigate to patient profile or select patient
    await this.handlePatientProfile(container);
  }

  async handleReports(container) {
    // Navigate to patient profile which houses the report download history
    await this.handlePatientProfile(container);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
