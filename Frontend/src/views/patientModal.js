import { api } from '../api.js';
import { state, setNotification } from '../state.js';

export function setupPatientModal(router) {
  let modalOverlay = document.getElementById('patientModalOverlay');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'patientModalOverlay';
    modalOverlay.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 hidden';
    document.body.appendChild(modalOverlay);
  }

  modalOverlay.innerHTML = `
    <div class="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant max-w-lg w-full overflow-hidden flex flex-col transform transition-all" id="patientModalBox">
      <!-- Modal Header -->
      <div class="p-space-lg border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
        <div class="flex items-center gap-space-sm">
          <div class="h-10 w-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center">
            <span class="material-symbols-outlined text-[22px]" id="patientModalIcon">person_add</span>
          </div>
          <div>
            <h3 class="font-headline-md text-headline-md text-primary font-bold" id="patientModalTitle">Register New Patient</h3>
            <p class="font-body-sm text-body-sm text-on-surface-variant" id="patientModalSubtitle">Enter clinical demographic details for decision support workup.</p>
          </div>
        </div>
        <button id="patientModalCloseBtn" class="h-8 w-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors" type="button">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <!-- Modal Body -->
      <form id="patientModalForm" class="p-space-lg flex flex-col gap-space-md">
        <input type="hidden" id="modalPatientId" value="" />

        <div>
          <label class="block font-label-ui text-label-ui uppercase tracking-wider text-on-surface-variant mb-1" for="modalName">Full Name *</label>
          <input id="modalName" required type="text" placeholder="e.g. Marcus Vance" class="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" />
        </div>

        <div class="grid grid-cols-2 gap-space-md">
          <div>
            <label class="block font-label-ui text-label-ui uppercase tracking-wider text-on-surface-variant mb-1" for="modalAge">Age (Years) *</label>
            <input id="modalAge" required type="number" min="1" max="120" placeholder="e.g. 58" class="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-label-data-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" />
          </div>
          <div>
            <label class="block font-label-ui text-label-ui uppercase tracking-wider text-on-surface-variant mb-1" for="modalSex">Biological Sex *</label>
            <select id="modalSex" required class="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all">
              <option value="1">Male (1)</option>
              <option value="0">Female (0)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-space-md">
          <div>
            <label class="block font-label-ui text-label-ui uppercase tracking-wider text-on-surface-variant mb-1" for="modalMrn">MRN (Optional)</label>
            <input id="modalMrn" type="text" placeholder="e.g. PT-9042" class="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-label-data-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" />
            <span class="text-[11px] text-on-surface-variant">Auto-generated if left blank</span>
          </div>
          <div>
            <label class="block font-label-ui text-label-ui uppercase tracking-wider text-on-surface-variant mb-1" for="modalDob">Date of Birth</label>
            <input id="modalDob" type="date" class="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" />
          </div>
        </div>

        <div>
          <label class="block font-label-ui text-label-ui uppercase tracking-wider text-on-surface-variant mb-1" for="modalPhone">Primary Phone</label>
          <input id="modalPhone" type="tel" placeholder="(555) 234-5678" class="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" />
        </div>

        <!-- Modal Actions -->
        <div class="flex items-center justify-end gap-space-sm pt-space-md border-t border-outline-variant mt-space-sm">
          <button id="patientModalCancelBtn" type="button" class="px-space-md py-2.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface font-label-ui text-label-ui transition-colors">
            Cancel
          </button>
          <button id="patientModalSubmitBtn" type="submit" class="px-space-lg py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-ui text-label-ui font-semibold flex items-center gap-space-xs shadow-sm transition-all">
            <span class="material-symbols-outlined text-[18px]">check</span>
            <span id="patientModalSubmitText">Save Patient</span>
          </button>
        </div>
      </form>
    </div>
  `;

  const form = modalOverlay.querySelector('#patientModalForm');
  const closeBtn = modalOverlay.querySelector('#patientModalCloseBtn');
  const cancelBtn = modalOverlay.querySelector('#patientModalCancelBtn');
  const idInput = modalOverlay.querySelector('#modalPatientId');
  const nameInput = modalOverlay.querySelector('#modalName');
  const ageInput = modalOverlay.querySelector('#modalAge');
  const sexSelect = modalOverlay.querySelector('#modalSex');
  const mrnInput = modalOverlay.querySelector('#modalMrn');
  const dobInput = modalOverlay.querySelector('#modalDob');
  const phoneInput = modalOverlay.querySelector('#modalPhone');
  const titleEl = modalOverlay.querySelector('#patientModalTitle');
  const subtitleEl = modalOverlay.querySelector('#patientModalSubtitle');
  const iconEl = modalOverlay.querySelector('#patientModalIcon');
  const submitText = modalOverlay.querySelector('#patientModalSubmitText');

  let editMode = false;

  function open(patient = null) {
    editMode = !!(patient && patient.id);
    if (editMode) {
      titleEl.textContent = 'Edit Patient Demographics';
      subtitleEl.textContent = `Updating records for MRN ${patient.mrn || 'N/A'}`;
      iconEl.textContent = 'edit';
      submitText.textContent = 'Update Demographics';

      idInput.value = patient.id;
      nameInput.value = patient.name || '';
      ageInput.value = patient.age || '';
      sexSelect.value = String(patient.sex ?? 1);
      mrnInput.value = patient.mrn || '';
      dobInput.value = patient.dob || '';
      phoneInput.value = patient.phone || '';
    } else {
      titleEl.textContent = 'Register New Patient';
      subtitleEl.textContent = 'Enter clinical demographic details for decision support workup.';
      iconEl.textContent = 'person_add';
      submitText.textContent = 'Register Patient';

      idInput.value = '';
      nameInput.value = '';
      ageInput.value = '';
      sexSelect.value = '1';
      mrnInput.value = '';
      dobInput.value = '';
      phoneInput.value = '';
    }

    modalOverlay.classList.remove('hidden');
    nameInput.focus();
  }

  function close() {
    modalOverlay.classList.add('hidden');
    form.reset();
  }

  closeBtn?.addEventListener('click', close);
  cancelBtn?.addEventListener('click', close);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) close();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const age = parseInt(ageInput.value, 10);
    const sex = parseInt(sexSelect.value, 10);
    const mrn = mrnInput.value.trim() || undefined;
    const dob = dobInput.value || undefined;
    const phone = phoneInput.value.trim() || undefined;

    if (!name || isNaN(age)) {
      alert('Please provide valid patient name and age.');
      return;
    }

    const submitBtn = modalOverlay.querySelector('#patientModalSubmitBtn');
    submitBtn.disabled = true;
    const origHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span class="material-symbols-outlined text-[18px] animate-spin">refresh</span> Saving...`;

    try {
      if (editMode) {
        const pId = parseInt(idInput.value, 10);
        const updated = await api.updatePatient(pId, { name, age, sex, mrn, dob, phone });
        setNotification(`Demographics updated for ${updated.name}.`, 'success');
        state.activePatient = updated;
        state.activePatientId = updated.id;
        close();
        // Refresh active view
        router.refresh();
      } else {
        const created = await api.createPatient({ name, age, sex, mrn, dob, phone });
        setNotification(`Patient ${created.name} (${created.mrn}) created.`, 'success');
        state.activePatient = created;
        state.activePatientId = created.id;
        close();
        // Refresh dashboard summary and navigate to profile or form
        api.getDashboardSummary().then(s => state.dashboardSummary = s).catch(() => {});
        router.navigate('patient-profile');
      }
    } catch (err) {
      alert(`Patient save error: ${err.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origHtml;
    }
  });

  window.addEventListener('modal:add-patient', () => open());
  window.addEventListener('modal:edit-patient', (e) => open(e.detail?.patient));

  return { open, close };
}
