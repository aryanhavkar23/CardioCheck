import { api } from './api.js';
import { state, setNotification } from './state.js';
import { Router } from './router.js';
import { setupAuthModal } from './views/authModal.js';
import { setupPatientModal } from './views/patientModal.js';

document.addEventListener('DOMContentLoaded', () => {
  const router = new Router('mainContainer');
  const authModal = setupAuthModal(router);
  const patientModal = setupPatientModal(router);

  // Wire Global Toasts
  const toastContainer = document.getElementById('toastContainer');
  window.addEventListener('notification', (e) => {
    const { message, type = 'info' } = e.detail || {};
    if (!message || !toastContainer) return;

    const toast = document.createElement('div');
    const borderColors = {
      success: 'border-secondary bg-surface-container-lowest text-on-surface shadow-lg',
      error: 'border-error bg-error-container/90 text-on-error-container shadow-lg',
      info: 'border-primary bg-surface-container-lowest text-on-surface shadow-md'
    };
    const iconNames = {
      success: 'check_circle',
      error: 'warning',
      info: 'info'
    };
    const iconColors = {
      success: 'text-secondary',
      error: 'text-error',
      info: 'text-primary'
    };

    toast.className = `pointer-events-auto p-space-md rounded-xl border-l-4 ${borderColors[type] || borderColors.info} flex items-start gap-space-sm animate-fade-in transition-all`;
    toast.innerHTML = `
      <span class="material-symbols-outlined text-[20px] ${iconColors[type] || iconColors.info} flex-shrink-0 mt-0.5">${iconNames[type] || 'info'}</span>
      <div class="flex-1 font-body-sm text-body-sm font-medium leading-snug">${escapeHtml(message)}</div>
      <button class="text-on-surface-variant hover:text-on-surface transition-colors ml-1" type="button">
        <span class="material-symbols-outlined text-[16px]">close</span>
      </button>
    `;

    toast.querySelector('button')?.addEventListener('click', () => {
      toast.remove();
    });

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  });

  // Doctor Info Updates
  function updateDoctorDisplay(doc) {
    if (!doc) return;
    const nameEl = document.getElementById('doctorHeaderName');
    const deptEl = document.getElementById('doctorHeaderDept');
    const avatarEl = document.getElementById('doctorAvatarInitials');

    const fullName = doc.full_name || doc.name || 'Dr. Sarah Jenkins, MD';
    const dept = doc.department || 'Cardiology Dept';

    if (nameEl) nameEl.textContent = fullName;
    if (deptEl) deptEl.textContent = dept;
    if (avatarEl) {
      const parts = fullName.replace(/^(Dr\.|MD)\s*/gi, '').trim().split(' ');
      const initials = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0][0].toUpperCase();
      avatarEl.textContent = initials || 'DR';
    }
  }

  window.addEventListener('doctor:updated', (e) => {
    updateDoctorDisplay(e.detail);
  });

  // Header & Sidebar Actions
  document.getElementById('headerAddPatientBtn')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('modal:add-patient'));
  });

  document.getElementById('sidebarSignOutBtn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to sign out of CardioCheck?')) {
      api.logout();
      setNotification('Signed out of clinical session.', 'info');
      authModal.open();
    }
  });

  document.getElementById('userMenuBtn')?.addEventListener('click', () => {
    if (confirm(`Active Session: ${state.doctor?.full_name || 'Dr. Sarah Jenkins, MD'}\nWould you like to log out or switch account?`)) {
      api.logout();
      authModal.open();
    }
  });

  document.getElementById('notificationsBellBtn')?.addEventListener('click', () => {
    setNotification('Clinical alert center: No urgent critical dysrhythmia telemetry flags detected.', 'info');
  });

  // Global search input handling
  const searchInput = document.getElementById('globalSearchInput');
  searchInput?.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) return;

      try {
        const patients = await api.getPatients();
        const found = patients.find(p => p.name.toLowerCase().includes(q) || (p.mrn && p.mrn.toLowerCase().includes(q)));
        if (found) {
          state.activePatient = found;
          state.activePatientId = found.id;
          router.navigate('patient-profile');
          setNotification(`Opened patient record for ${found.name} (${found.mrn}).`, 'success');
        } else {
          setNotification(`No patient record matched query "${q}".`, 'error');
        }
      } catch (err) {
        setNotification(`Search error: ${err.message}`, 'error');
      }
    }
  });

  // Check auth and boot router
  if (api.isAuthenticated()) {
    router.init();
    // Warm up doctor info from summary
    api.getDashboardSummary().then(s => {
      state.dashboardSummary = s;
      if (s.doctor) {
        state.doctor = s.doctor;
        updateDoctorDisplay(s.doctor);
      }
    }).catch(() => {});
  } else {
    authModal.open();
  }
});

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
