import { api } from '../api.js';
import { state, setNotification } from '../state.js';

export function renderAssessmentResults(container, router) {
  const assessment = state.activeAssessment || {
    assessment_id: 1,
    reference_id: 'ASM-2024-0982',
    patient_id: state.activePatientId || 1,
    patient_name: state.activePatient?.name || 'Eleanor Vance',
    patient_mrn: state.activePatient?.mrn || 'PT-8821',
    timestamp: 'October 24, 2024 at 14:15 EDT',
    prediction: 1,
    classification_label: 'Class 1: Heart Disease Category Present',
    explanation: 'The submitted clinical features were classified into the heart-disease-present category.',
    doctor_notes: 'Patient presents with atypical angina alongside marked ST depression (3.6mm) on resting ECG. Recommend urgent outpatient coronary CT angiography and direct cardiology consult within 48h.',
    display_features: {
      'Age': '62 years',
      'Sex': 'Female',
      'Chest Pain Type': 'Atypical Angina',
      'Resting Blood Pressure': '140 mm Hg',
      'Serum Cholesterol': '268 mg/dL',
      'Fasting Blood Sugar': '≤ 120 mg/dL (Normal)',
      'Resting ECG': 'ST-T Wave Abnormality',
      'Maximum Heart Rate': '160 bpm',
      'Exercise-Induced Angina': 'Yes',
      'ST Depression': '3.6 mm',
      'Peak ST Slope': 'Flat / Downsloping',
      'Major Vessels (Fluoroscopy)': '2 vessels',
      'Thalassemia Scintigraphy': 'Reversible Defect'
    }
  };

  const isClass1 = assessment.prediction === 1;
  const accentColor = isClass1 ? 'bg-error' : 'bg-secondary';
  const badgeClass = isClass1 ? 'bg-error-container/40 text-error' : 'bg-secondary-container/40 text-secondary';
  const headingText = isClass1 ? 'Class 1: Heart Disease Category Present' : 'Class 0: No Heart Disease Category';
  const descText = assessment.explanation || (isClass1
    ? 'The submitted clinical features were classified into the heart-disease-present category.'
    : 'The submitted clinical features were classified into the no-heart-disease category.');

  const displayFeat = assessment.display_features || {};

  container.innerHTML = `
    <div class="flex flex-col w-full gap-space-lg pb-space-xl">
      <!-- Top Context Bar -->
      <div class="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col xl:flex-row items-start xl:items-center justify-between gap-space-md">
        <div class="flex flex-wrap items-center gap-space-md">
          <div class="flex items-center gap-space-sm bg-surface-container-low px-space-md py-1.5 rounded-lg">
            <span class="material-symbols-outlined text-secondary text-[20px]">badge</span>
            <div class="flex flex-col">
              <span class="font-label-ui text-label-ui text-on-surface-variant uppercase">Patient Ref</span>
              <span class="font-label-data-md text-label-data-md text-on-surface font-semibold">${escapeHtml(assessment.patient_mrn || 'PT-8821')}</span>
            </div>
          </div>
          <div class="flex flex-col">
            <span class="font-label-ui text-label-ui text-on-surface-variant uppercase">Patient Name</span>
            <span class="font-headline-md text-headline-md text-primary">${escapeHtml(assessment.patient_name || 'Eleanor Vance')}</span>
          </div>
          <span class="hidden md:inline-block text-outline-variant font-label-data-md">|</span>
          <div class="flex items-center gap-space-xs text-on-surface-variant">
            <span class="material-symbols-outlined text-[18px]">calendar_today</span>
            <span class="font-body-sm text-body-sm">${escapeHtml(assessment.timestamp || 'Recorded')}</span>
          </div>
        </div>
        <div class="flex items-center gap-space-sm">
          <button id="returnToProfileTopBtn" class="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-lg text-secondary hover:bg-surface-container transition-colors font-medium text-body-sm" type="button">
            <span class="material-symbols-outlined text-[18px]">arrow_back</span> Return to Patient Profile
          </button>
        </div>
      </div>

      <!-- Classification Result Card -->
      <div class="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1.5 ${accentColor}"></div>
        <div class="flex flex-col gap-space-md">
          <div class="flex items-center justify-between flex-wrap gap-space-sm">
            <span class="inline-flex items-center gap-space-xs px-space-sm py-1 rounded ${badgeClass} font-label-ui text-label-ui uppercase tracking-wider font-semibold">
              <span class="material-symbols-outlined text-[16px]">${isClass1 ? 'warning' : 'verified'}</span> CLASSIFICATION RESULT
            </span>
            <span class="font-body-sm text-body-sm text-on-surface-variant">Assessment Reference: ${escapeHtml(assessment.reference_id || 'ASM-2024-0982')}</span>
          </div>
          <div class="flex flex-col gap-space-xs">
            <h1 class="font-headline-xl text-headline-xl text-primary tracking-tight">${headingText}</h1>
            <p class="font-body-lg text-body-lg text-on-surface leading-relaxed">${escapeHtml(descText)}</p>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Classification key: <span class="font-medium text-on-surface">Class 0:</span> Classified into the no-heart-disease category &nbsp;|&nbsp; <span class="font-medium text-on-surface">Class 1:</span> Classified into the heart-disease-present category
            </p>
          </div>
          <div class="p-space-sm px-space-md bg-surface-container-low rounded-lg flex items-center gap-space-sm text-on-surface">
            <span class="material-symbols-outlined text-[18px] text-secondary flex-shrink-0">info</span>
            <span class="font-body-sm text-body-sm text-on-surface-variant">This model result is not a confirmed medical diagnosis. Corroborate with direct clinical examination.</span>
          </div>
        </div>
      </div>

      <!-- Clinical Information (13 Submitted Values) -->
      <div class="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
        <div class="flex items-center justify-between pb-1">
          <div class="flex items-center gap-space-xs">
            <span class="material-symbols-outlined text-secondary text-[20px]">clinical_notes</span>
            <h2 class="font-headline-md text-headline-md text-primary">Clinical Information (13 Submitted Values)</h2>
          </div>
          <span class="font-body-sm text-body-sm text-on-surface-variant">Recorded snapshot</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-sm">
          ${renderFeaturesGrid(displayFeat)}
        </div>
      </div>

      <!-- Doctor's Notes -->
      <div class="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-space-xs">
            <span class="material-symbols-outlined text-secondary text-[20px]">edit_note</span>
            <h3 class="font-headline-md text-headline-md text-primary">Doctor's Notes</h3>
          </div>
          <span class="font-label-ui text-label-ui uppercase text-on-surface-variant font-medium">${escapeHtml(state.doctor?.full_name || 'Dr. Sarah Jenkins, MD')}</span>
        </div>
        <div class="relative w-full">
          <textarea class="w-full p-space-md bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container transition-all resize-none" id="doctorNotes" placeholder="Enter clinical observations or follow-up recommendations..." rows="3">${escapeHtml(assessment.doctor_notes || '')}</textarea>
        </div>
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md pt-space-xs">
          <button class="h-10 px-space-lg bg-primary-container text-on-primary rounded-lg font-label-ui text-label-ui hover:bg-primary transition-all flex items-center justify-center gap-space-xs shadow-sm font-semibold" id="saveNotesBtn" type="button">
            <span class="material-symbols-outlined text-[18px]">save</span>Save Notes
          </button>
          <div class="flex items-center gap-space-md self-end sm:self-auto">
            <button class="h-10 px-space-md bg-surface-container-low text-on-surface rounded-lg font-label-ui text-label-ui hover:bg-surface-container transition-all flex items-center justify-center gap-space-xs font-semibold" id="exportPdfBtn" type="button">
              <span class="material-symbols-outlined text-[18px]">picture_as_pdf</span>Generate Report
            </button>
            <button id="returnToProfileBottomBtn" class="font-body-sm text-body-sm text-secondary hover:text-on-secondary-container transition-colors font-medium flex items-center gap-1" type="button">
              <span class="material-symbols-outlined text-[16px]">arrow_back</span>Return to Patient Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  setupResultsInteractions(container, router, assessment);
}

function renderFeaturesGrid(features) {
  const defaultKeys = [
    ['Age', features['Age'] || '62 years'],
    ['Sex', features['Sex'] || 'Female'],
    ['Chest Pain Type', features['Chest Pain Type'] || 'Atypical Angina'],
    ['Resting Blood Pressure', features['Resting Blood Pressure'] || '140 mm Hg'],
    ['Serum Cholesterol', features['Serum Cholesterol'] || '268 mg/dL'],
    ['Fasting Blood Sugar', features['Fasting Blood Sugar'] || '≤ 120 mg/dL (Normal)'],
    ['Resting ECG', features['Resting ECG'] || 'ST-T Wave Abnormality'],
    ['Maximum Heart Rate', features['Maximum Heart Rate'] || '160 bpm'],
    ['Exercise-Induced Angina', features['Exercise-Induced Angina'] || 'Yes'],
    ['ST Depression', features['ST Depression'] || '3.6 mm'],
    ['Peak ST Slope', features['Peak ST Slope'] || 'Flat / Downsloping'],
    ['Major Vessels (Fluoroscopy)', features['Major Vessels (Fluoroscopy)'] || '2 vessels'],
    ['Thalassemia Scintigraphy', features['Thalassemia Scintigraphy'] || 'Reversible Defect'],
  ];

  return defaultKeys.map(([label, val]) => `
    <div class="flex items-center justify-between p-space-sm bg-surface-container-low rounded-lg">
      <span class="font-body-sm text-body-sm text-on-surface-variant">${escapeHtml(label)}</span>
      <span class="font-label-data-sm text-label-data-sm font-semibold text-on-surface">${escapeHtml(val)}</span>
    </div>
  `).join('');
}

function setupResultsInteractions(container, router, assessment) {
  const saveBtn = container.querySelector('#saveNotesBtn');
  const exportBtn = container.querySelector('#exportPdfBtn');
  const notesArea = container.querySelector('#doctorNotes');

  saveBtn?.addEventListener('click', async () => {
    const notesText = notesArea.value.trim();
    saveBtn.disabled = true;
    const origHtml = saveBtn.innerHTML;
    saveBtn.innerHTML = `<span class="material-symbols-outlined text-[18px] animate-spin">refresh</span> Saving...`;

    try {
      await api.updateAssessmentNotes(assessment.assessment_id || assessment.id, {
        doctor_notes: notesText,
        status: 'reviewed'
      });
      assessment.doctor_notes = notesText;
      saveBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">check</span> Notes Recorded to EHR';
      setNotification('Clinical notes recorded and saved to patient record.', 'success');
      setTimeout(() => {
        saveBtn.innerHTML = origHtml;
        saveBtn.disabled = false;
      }, 2000);
    } catch (err) {
      alert(`Failed to save notes: ${err.message}`);
      saveBtn.innerHTML = origHtml;
      saveBtn.disabled = false;
    }
  });

  exportBtn?.addEventListener('click', async () => {
    const origHtml = exportBtn.innerHTML;
    exportBtn.disabled = true;
    exportBtn.innerHTML = `<span class="material-symbols-outlined text-[18px] animate-spin">downloading</span> Generating PDF...`;

    try {
      setNotification('Compiling clinical data into ReportLab PDF...', 'info');
      const filename = `${assessment.reference_id || 'Assessment'}_CardioCheck_Report.pdf`;
      await api.downloadReport(assessment.assessment_id || assessment.id, filename);
      exportBtn.innerHTML = `<span class="material-symbols-outlined text-[18px]">done_all</span> Report Downloaded`;
      setNotification('CardioCheck clinical PDF report downloaded successfully.', 'success');
      setTimeout(() => {
        exportBtn.innerHTML = origHtml;
        exportBtn.disabled = false;
      }, 2500);
    } catch (err) {
      alert(`PDF download failed: ${err.message}`);
      exportBtn.innerHTML = origHtml;
      exportBtn.disabled = false;
    }
  });

  const goProfile = () => {
    if (assessment.patient_id) {
      state.activePatientId = assessment.patient_id;
    }
    router.navigate('patient-profile');
  };

  container.querySelector('#returnToProfileTopBtn')?.addEventListener('click', goProfile);
  container.querySelector('#returnToProfileBottomBtn')?.addEventListener('click', goProfile);
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
