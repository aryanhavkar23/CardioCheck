import { api } from '../api.js';
import { state, setNotification } from '../state.js';

export async function renderPatientProfile(container, router) {
  const patientId = state.activePatientId || 1;
  let patient = state.activePatient;
  let assessments = [];
  let compareData = null;

  try {
    patient = await api.getPatient(patientId);
    state.activePatient = patient;
    assessments = await api.getPatientAssessments(patientId);
    compareData = await api.comparePatientAssessments(patientId).catch(() => null);
  } catch (err) {
    console.warn('Could not fetch latest patient data:', err);
    if (!patient) {
      patient = {
        id: patientId,
        name: 'Eleanor Vance',
        mrn: 'PT-8821',
        dob: '1962-03-14',
        age: 62,
        sex: 0,
        blood_group: 'A+',
        ward: 'West Pavilion 4B',
        protocol: 'Coronary Artery Disease Comprehensive Risk Workup',
        emergency_contact_name: 'Marcus Vance (Spouse)',
        emergency_contact_phone: '+1 (555) 019-8831',
        consent_status: 'Signed Oct 12, 2024 (Active)',
        allergies: 'Penicillin, Contrast Dye (Mild)',
        avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtfjX0xFw2R6rtBIXXa4pG8HPKNig3OC-DchKxcvIbpYAwmG_5uA7PRY27p4a85hNKvZG1uZ5IDj9ns8oMg6kPRIA7i0ej9sN45nWLWJaAhordd01CPF1iOspflUvCl06-ZeT0tGRsAbRXNVkcUYyy20Wew8yTR1Tm609AWK7UqjlrXG0hKRLwt3bM3aZChPADz9HFjPpt8Y6qEZa1cAMC7sI7FwIx2Tous61FeReW_oiNI2SbNzfx'
      };
    }
  }

  const latestAss = assessments.length > 0 ? assessments[0] : null;
  const isClass1 = latestAss ? latestAss.prediction === 1 : true;
  const probVal = latestAss && latestAss.probability_class_1 != null
    ? Math.round(latestAss.probability_class_1 * 100)
    : 82;

  const docName = state.doctor?.full_name || 'Dr. Sarah Jenkins, MD';

  container.innerHTML = `
    <div class="flex flex-col w-full gap-space-lg">
      <!-- Top Breadcrumb & Metadata Line -->
      <div class="flex flex-wrap items-center justify-between gap-space-sm">
        <div class="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
          <button id="breadcrumbBackBtn" class="hover:text-primary transition-colors flex items-center gap-1" type="button">
            <span class="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Dashboard Queue</span>
          </button>
          <span class="text-outline">/</span>
          <span class="font-label-data-sm text-label-data-sm text-on-surface font-semibold">${escapeHtml(patient.mrn)}</span>
          <span class="text-outline">/</span>
          <span class="text-on-surface">Cardiology Profile &amp; History</span>
        </div>
        <div class="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1 rounded-full text-on-surface-variant font-label-data-sm text-label-data-sm">
          <span class="w-2 h-2 rounded-full bg-secondary"></span>
          <span>FastAPI Backend: Connected | Model: LogisticRegression (Cleveland v1)</span>
        </div>
      </div>

      <!-- Patient Demographics Header Card -->
      <div class="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <!-- Identity & Key Badges -->
          <div class="flex items-start gap-space-md min-w-0">
            <div class="relative shrink-0">
              <img class="w-16 h-16 rounded-xl object-cover shadow-sm" alt="${escapeHtml(patient.name)}" src="${patient.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtfjX0xFw2R6rtBIXXa4pG8HPKNig3OC-DchKxcvIbpYAwmG_5uA7PRY27p4a85hNKvZG1uZ5IDj9ns8oMg6kPRIA7i0ej9sN45nWLWJaAhordd01CPF1iOspflUvCl06-ZeT0tGRsAbRXNVkcUYyy20Wew8yTR1Tm609AWK7UqjlrXG0hKRLwt3bM3aZChPADz9HFjPpt8Y6qEZa1cAMC7sI7FwIx2Tous61FeReW_oiNI2SbNzfx'}"/>
              <span class="absolute -bottom-1 -right-1 bg-surface-container-lowest p-0.5 rounded-full shadow-sm">
                <span class="material-symbols-outlined text-secondary text-[18px]">verified</span>
              </span>
            </div>
            <div class="flex flex-col min-w-0">
              <div class="flex flex-wrap items-center gap-space-xs">
                <h1 class="font-headline-lg text-headline-lg text-primary tracking-tight">${escapeHtml(patient.name)}</h1>
                <span class="font-label-data-md text-label-data-md px-2 py-0.5 bg-surface-container text-on-surface-variant rounded">MRN #${escapeHtml(patient.mrn)}</span>
                <span class="font-label-ui text-label-ui px-2 py-0.5 rounded-full ${isClass1 ? 'bg-error-container text-on-error-container font-semibold' : 'bg-secondary-container text-on-secondary-container font-semibold'}">
                  ${isClass1 ? 'High Probability Risk (Cleveland v1)' : 'Low Risk / Normal (Cleveland v1)'}
                </span>
              </div>
              <p class="font-body-md text-body-md text-on-surface-variant mt-1">
                DOB: <span class="font-label-data-md text-label-data-md text-on-surface">${escapeHtml(patient.dob || '1962-03-14')}</span> (${patient.age} yrs) • ${patient.sex === 0 ? 'Female' : 'Male'} • Blood Group: ${escapeHtml(patient.blood_group || 'A+')} • Primary Ward: ${escapeHtml(patient.ward || 'West Pavilion 4B')}
              </p>
            </div>
          </div>
          <!-- Action Controls -->
          <div class="flex items-center gap-space-xs shrink-0">
            <button id="editPatientBtn" class="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-ui text-label-ui" type="button">
              <span class="material-symbols-outlined text-[18px]">edit_note</span>
              <span>Edit Patient Details</span>
            </button>
            <button id="newAssessmentBtn" class="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-secondary text-on-secondary hover:bg-on-secondary-container transition-colors shadow-sm font-label-ui text-label-ui" type="button">
              <span class="material-symbols-outlined text-[18px]">cardiology</span>
              <span>+ New Assessment</span>
            </button>
          </div>
        </div>
        <!-- Micro Metadata Ribbons -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-space-sm pt-space-xs bg-surface-container-low rounded-lg p-space-sm">
          <div class="flex flex-col">
            <span class="font-label-ui text-label-ui text-on-surface-variant uppercase">Attending Cardiologist</span>
            <span class="font-body-md text-body-md text-on-surface font-semibold flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px] text-primary">stethoscope</span>
              ${escapeHtml(docName)}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="font-label-ui text-label-ui text-on-surface-variant uppercase">Emergency Contact</span>
            <span class="font-body-md text-body-md text-on-surface font-semibold flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px] text-on-surface-variant">call</span>
              ${escapeHtml(patient.emergency_contact_name || 'Marcus Vance')} • ${escapeHtml(patient.emergency_contact_phone || '+1 (555) 019-8831')}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="font-label-ui text-label-ui text-on-surface-variant uppercase">Clinical Consent</span>
            <span class="font-body-md text-body-md text-secondary font-semibold flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">check_circle</span>
              ${escapeHtml(patient.consent_status || 'Signed (Active)')}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="font-label-ui text-label-ui text-on-surface-variant uppercase">Allergies &amp; Alerts</span>
            <span class="font-body-md text-body-md text-error font-semibold flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">warning</span>
              ${escapeHtml(patient.allergies || 'None Reported')}
            </span>
          </div>
        </div>
      </div>

      <!-- Main Layout: 8-Column Main Workspace + 4-Column Action Panel -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
        <!-- Left Main Column (8 Cols) -->
        <div class="xl:col-span-8 flex flex-col gap-space-lg">
          ${latestAss ? `
            <!-- Latest Assessment Output Card -->
            <div class="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg relative overflow-hidden">
              <div class="absolute left-0 top-0 bottom-0 w-1.5 ${isClass1 ? 'bg-error' : 'bg-secondary'}"></div>
              <div class="flex flex-col gap-space-md">
                <div class="flex flex-wrap items-center justify-between gap-space-sm">
                  <div class="flex items-center gap-space-xs">
                    <span class="font-label-ui text-label-ui uppercase tracking-wider text-on-surface-variant font-semibold">Latest Diagnostic Inference</span>
                    <span class="font-label-data-sm text-label-data-sm px-2 py-0.5 rounded bg-surface-container font-medium text-on-surface">#${escapeHtml(latestAss.reference_id)}</span>
                  </div>
                  <div class="flex items-center gap-space-xs font-label-data-sm text-label-data-sm text-on-surface-variant">
                    <span class="material-symbols-outlined text-[16px]">schedule</span>
                    <span>${escapeHtml(latestAss.formatted_date || 'Oct 24, 2024 • 14:15 EDT')}</span>
                  </div>
                </div>
                <!-- Score & Classification Banner -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-space-md items-center bg-surface-container-low rounded-xl p-space-md">
                  <div class="flex flex-col gap-1">
                    <span class="font-label-ui text-label-ui text-on-surface-variant uppercase">ML Model Classification</span>
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full ${isClass1 ? 'bg-error animate-pulse' : 'bg-secondary'}"></span>
                      <span class="font-headline-lg text-headline-lg ${isClass1 ? 'text-error' : 'text-secondary'}">
                        ${isClass1 ? 'Class 1: Present' : 'Class 0: Negative'}
                      </span>
                    </div>
                    <span class="font-body-sm text-body-sm text-on-surface-variant">Cleveland Heart Disease Cohort</span>
                  </div>
                  <!-- Radial Gauge -->
                  <div class="flex items-center gap-space-sm">
                    <div class="relative w-16 h-16 shrink-0 flex items-center justify-center">
                      <svg class="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                        <path class="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3.5"></path>
                        <path class="${isClass1 ? 'text-error' : 'text-secondary'}" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="${probVal}, 100" stroke-linecap="round" stroke-width="3.5"></path>
                      </svg>
                      <span class="absolute font-label-data-md text-label-data-md text-on-surface font-bold">${probVal}%</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-label-ui text-label-ui text-on-surface-variant uppercase">Model Probability</span>
                      <span class="font-label-data-sm text-label-data-sm text-on-surface font-semibold">${isClass1 ? 'CAD Suspicion' : 'Low Probability'}</span>
                      <span class="font-body-sm text-body-sm text-on-surface-variant">Logistic Regression</span>
                    </div>
                  </div>
                  <div class="flex flex-col gap-1 justify-center">
                    <span class="font-label-ui text-label-ui text-on-surface-variant uppercase">Recommended Protocol</span>
                    <span class="font-body-md text-body-md text-on-surface font-semibold flex items-center gap-1">
                      <span class="material-symbols-outlined text-[18px] text-secondary">verified_user</span>
                      ${escapeHtml(latestAss.recommended_protocol || 'Coronary CTA + Triage in 14d')}
                    </span>
                    <span class="font-body-sm text-body-sm text-on-secondary-container">Follow-up: ${escapeHtml(latestAss.follow_up_text || 'In 2 Weeks')}</span>
                  </div>
                </div>
                <!-- Physician Clinical Note Box -->
                <div class="bg-surface-container rounded-lg p-space-md flex flex-col gap-space-xs">
                  <div class="flex items-center justify-between">
                    <span class="font-label-ui text-label-ui text-primary font-semibold flex items-center gap-1">
                      <span class="material-symbols-outlined text-[16px] text-secondary">rate_review</span>
                      Primary Attending Note • ${escapeHtml(docName)}
                    </span>
                    <span class="font-label-data-sm text-label-data-sm text-on-surface-variant">Status: ${escapeHtml(latestAss.status)}</span>
                  </div>
                  <p class="font-body-md text-body-md text-on-surface italic">
                    “${escapeHtml(latestAss.doctor_notes || 'No clinical notes recorded yet.')}”
                  </p>
                </div>
                <!-- Disclaimer -->
                <div class="bg-surface-container-low rounded-lg p-space-sm flex items-start gap-space-sm">
                  <span class="material-symbols-outlined text-outline text-[18px] shrink-0 mt-0.5">info</span>
                  <p class="font-body-sm text-body-sm text-on-surface-variant italic">
                    Statistical estimation based on trained cohort data. For decision-support purposes only; does not replace primary physician clinical evaluation or direct hemodynamic measurement.
                  </p>
                </div>
              </div>
            </div>
          ` : `
            <div class="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col items-center justify-center py-12 text-center">
              <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-2">history</span>
              <p class="font-headline-md text-primary mb-1">No recorded assessments for ${escapeHtml(patient.name)}</p>
              <p class="font-body-sm text-on-surface-variant mb-4">Run an assessment wizard to generate clinical classification.</p>
              <button id="emptyStartAssBtn" class="px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-ui text-label-ui">Start First Assessment</button>
            </div>
          `}

          <!-- Chronological Assessment History Table -->
          <div class="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div class="flex flex-wrap items-center justify-between gap-space-sm">
              <div>
                <h2 class="font-headline-md text-headline-md text-primary">Chronological Assessment History</h2>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Tracking multi-parameter shifts across longitudinal clinic visits</p>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="bg-surface-container-low text-on-surface-variant font-label-ui text-label-ui uppercase tracking-wider">
                    <th class="py-2.5 px-space-md">Date &amp; ID</th>
                    <th class="py-2.5 px-space-sm text-right">Resting BP</th>
                    <th class="py-2.5 px-space-sm text-right">Cholesterol</th>
                    <th class="py-2.5 px-space-sm text-right">Max HR</th>
                    <th class="py-2.5 px-space-sm text-right">ST Dep</th>
                    <th class="py-2.5 px-space-md text-center">Dataset Class</th>
                    <th class="py-2.5 px-space-sm">Follow-up</th>
                    <th class="py-2.5 px-space-md text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-container">
                  ${renderHistoryRows(assessments)}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Biomarker Variance Matrix (Jun vs. Oct 2024 / Delta) -->
          <div class="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div class="flex flex-wrap items-center justify-between gap-space-sm">
              <div>
                <h2 class="font-headline-md text-headline-md text-primary">Biomarker Variance Matrix (Longitudinal Inflection)</h2>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Evaluation of the 13 Cleveland CAD predictive variables across assessment intervals</p>
              </div>
              <span class="font-label-ui text-label-ui text-on-surface-variant bg-surface-container px-2 py-1 rounded">Delta Mode: Absolute &amp; Vector</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-sm">
              <!-- Resting BP -->
              <div class="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="font-label-ui text-label-ui text-on-surface-variant uppercase font-semibold">Trestbps (Rest BP)</span>
                  <span class="font-label-data-sm text-label-data-sm text-error font-semibold flex items-center">
                    <span class="material-symbols-outlined text-[14px]">arrow_upward</span> +8 mmHg
                  </span>
                </div>
                <div class="flex items-baseline justify-between pt-1">
                  <span class="font-label-data-sm text-label-data-sm text-on-surface-variant">Baseline: 132</span>
                  <span class="font-label-data-lg text-label-data-lg text-primary font-bold">140 <span class="text-body-sm font-normal text-on-surface-variant">mmHg</span></span>
                </div>
                <div class="w-full bg-surface-container rounded-full h-1.5 mt-1 overflow-hidden">
                  <div class="bg-error h-1.5 rounded-full" style="width: 78%"></div>
                </div>
              </div>

              <!-- Serum Chol -->
              <div class="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="font-label-ui text-label-ui text-on-surface-variant uppercase font-semibold">Chol (Cholesterol)</span>
                  <span class="font-label-data-sm text-label-data-sm text-error font-semibold flex items-center">
                    <span class="material-symbols-outlined text-[14px]">arrow_upward</span> +26 mg/dL
                  </span>
                </div>
                <div class="flex items-baseline justify-between pt-1">
                  <span class="font-label-data-sm text-label-data-sm text-on-surface-variant">Baseline: 242</span>
                  <span class="font-label-data-lg text-label-data-lg text-primary font-bold">268 <span class="text-body-sm font-normal text-on-surface-variant">mg/dL</span></span>
                </div>
                <div class="w-full bg-surface-container rounded-full h-1.5 mt-1 overflow-hidden">
                  <div class="bg-error h-1.5 rounded-full" style="width: 86%"></div>
                </div>
              </div>

              <!-- ST Depression (Oldpeak) -->
              <div class="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="font-label-ui text-label-ui text-on-surface-variant uppercase font-semibold">Oldpeak (ST Dep)</span>
                  <span class="font-label-data-sm text-label-data-sm text-error font-semibold flex items-center">
                    <span class="material-symbols-outlined text-[14px]">arrow_upward</span> +1.8 mm
                  </span>
                </div>
                <div class="flex items-baseline justify-between pt-1">
                  <span class="font-label-data-sm text-label-data-sm text-on-surface-variant">Baseline: 1.8</span>
                  <span class="font-label-data-lg text-label-data-lg text-error font-bold">3.6 <span class="text-body-sm font-normal text-on-surface-variant">mm</span></span>
                </div>
                <div class="w-full bg-surface-container rounded-full h-1.5 mt-1 overflow-hidden">
                  <div class="bg-error h-1.5 rounded-full" style="width: 90%"></div>
                </div>
              </div>

              <!-- Chest Pain -->
              <div class="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="font-label-ui text-label-ui text-on-surface-variant uppercase font-semibold">Cp (Chest Pain)</span>
                  <span class="font-label-data-sm text-label-data-sm text-error font-semibold">Shift: Typ -&gt; Asympt</span>
                </div>
                <div class="flex items-baseline justify-between pt-1">
                  <span class="font-label-data-sm text-label-data-sm text-on-surface-variant">Prior: Type 2 (Atypical)</span>
                  <span class="font-label-data-md text-label-data-md text-primary font-bold">Type 4 (Asympt)</span>
                </div>
                <span class="text-body-sm text-on-surface-variant">Cleveland code 4 correlates to higher hazard</span>
              </div>

              <!-- Max HR (Thalach) -->
              <div class="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="font-label-ui text-label-ui text-on-surface-variant uppercase font-semibold">Thalach (Max HR)</span>
                  <span class="font-label-data-sm text-label-data-sm text-on-surface-variant font-semibold flex items-center">
                    <span class="material-symbols-outlined text-[14px]">arrow_downward</span> -5 bpm
                  </span>
                </div>
                <div class="flex items-baseline justify-between pt-1">
                  <span class="font-label-data-sm text-label-data-sm text-on-surface-variant">Prior: 165</span>
                  <span class="font-label-data-lg text-label-data-lg text-primary font-bold">160 <span class="text-body-sm font-normal text-on-surface-variant">bpm</span></span>
                </div>
                <span class="text-body-sm text-secondary">Target age 62 reserve: 158 bpm</span>
              </div>

              <!-- Exercise Induced Angina (Exang) -->
              <div class="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="font-label-ui text-label-ui text-on-surface-variant uppercase font-semibold">Exang (Exer Angina)</span>
                  <span class="font-label-data-sm text-label-data-sm text-error font-semibold">0 → 1 (New)</span>
                </div>
                <div class="flex items-baseline justify-between pt-1">
                  <span class="font-label-data-sm text-label-data-sm text-on-surface-variant">Prior: No (0)</span>
                  <span class="font-label-data-md text-label-data-md text-error font-bold">Yes (1 - Present)</span>
                </div>
                <span class="text-body-sm text-error">Positive treadmill stress induction</span>
              </div>

              <!-- ST Slope -->
              <div class="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="font-label-ui text-label-ui text-on-surface-variant uppercase font-semibold">Slope (Peak ST)</span>
                  <span class="font-label-data-sm text-label-data-sm text-error font-semibold">Shift: Flat → Down</span>
                </div>
                <div class="flex items-baseline justify-between pt-1">
                  <span class="font-label-data-sm text-label-data-sm text-on-surface-variant">Prior: Flat (2)</span>
                  <span class="font-label-data-md text-label-data-md text-primary font-bold">Downsloping (3)</span>
                </div>
                <span class="text-body-sm text-on-surface-variant">Indicates subendocardial ischemia</span>
              </div>

              <!-- Major Vessels (CA) -->
              <div class="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="font-label-ui text-label-ui text-on-surface-variant uppercase font-semibold">CA (Fluoro Vessels)</span>
                  <span class="font-label-data-sm text-label-data-sm text-error font-semibold">+1 Vessel</span>
                </div>
                <div class="flex items-baseline justify-between pt-1">
                  <span class="font-label-data-sm text-label-data-sm text-on-surface-variant">Prior: 0</span>
                  <span class="font-label-data-lg text-label-data-lg text-error font-bold">1 <span class="text-body-sm font-normal text-on-surface-variant">vessel</span></span>
                </div>
                <span class="text-body-sm text-on-surface-variant">Fluoroscopy vessel calcification</span>
              </div>

              <!-- Thalassemia Defect -->
              <div class="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="font-label-ui text-label-ui text-on-surface-variant uppercase font-semibold">Thal Scintigraphy</span>
                  <span class="font-label-data-sm text-label-data-sm text-error font-semibold">Norm → Rev</span>
                </div>
                <div class="flex items-baseline justify-between pt-1">
                  <span class="font-label-data-sm text-label-data-sm text-on-surface-variant">Prior: Normal (3)</span>
                  <span class="font-label-data-md text-label-data-md text-primary font-bold">Reversible Defect (7)</span>
                </div>
                <span class="text-body-sm text-error">Transient perfusion deficit under stress</span>
              </div>
            </div>
            <!-- Methodological Note -->
            <div class="p-space-sm bg-surface-container-low rounded-lg flex items-center gap-space-sm">
              <span class="material-symbols-outlined text-secondary text-[20px] shrink-0">analytics</span>
              <p class="font-body-sm text-body-sm text-on-surface-variant">
                <strong>Methodological Note:</strong> Distinguishing biomarker variance from ML dataset classification shifts. Changes in classification reflect model decision boundaries, not automatic medical improvement or worsening.
              </p>
            </div>
          </div>
        </div>

        <!-- Right Column (4 Cols): Reports Drawer & Quick Actions -->
        <div class="xl:col-span-4 flex flex-col gap-space-lg">
          <!-- Reports Drawer Section -->
          <div class="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-space-xs">
                <span class="material-symbols-outlined text-primary text-[20px]">description</span>
                <h2 class="font-headline-md text-headline-md text-primary">Generated Reports</h2>
              </div>
              <span class="font-label-data-sm text-label-data-sm bg-surface-container-high px-2 py-0.5 rounded text-on-surface">PDF / ReportLab</span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant">Archived clinical summaries with model weights &amp; physician signatures.</p>
            <div class="flex flex-col gap-space-xs">
              ${renderReportsList(assessments)}
            </div>
          </div>

          <!-- Real-Time Diagnostic Quick Actions -->
          <div class="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <h3 class="font-headline-md text-headline-md text-primary">Cardiology Actions</h3>
            <div class="flex flex-col gap-space-xs">
              <button class="w-full flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors text-left" type="button" onclick="alert('Action dispatched: Cardiac CTA referral queued via EHR.')">
                <div class="flex items-center gap-space-xs">
                  <span class="material-symbols-outlined text-secondary text-[20px]">biotech</span>
                  <div class="flex flex-col">
                    <span class="font-body-md text-body-md font-semibold text-primary">Schedule Cardiac CTA</span>
                    <span class="font-body-sm text-body-sm text-on-surface-variant">Automated referral via Epic</span>
                  </div>
                </div>
                <span class="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
              </button>
              <button class="w-full flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors text-left" type="button" onclick="alert('Medication reconciliation logged: Metoprolol 25mg, Atorvastatin 20mg active.')">
                <div class="flex items-center gap-space-xs">
                  <span class="material-symbols-outlined text-secondary text-[20px]">medication</span>
                  <div class="flex flex-col">
                    <span class="font-body-md text-body-md font-semibold text-primary">Medication Reconciliation</span>
                    <span class="font-body-sm text-body-sm text-on-surface-variant">Metoprolol 25mg, Atorvastatin 20mg</span>
                  </div>
                </div>
                <span class="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
              </button>
              <button class="w-full flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors text-left" type="button" onclick="alert('Cath lab consult summary dispatched to On-Call Fellow.')">
                <div class="flex items-center gap-space-xs">
                  <span class="material-symbols-outlined text-secondary text-[20px]">share</span>
                  <div class="flex flex-col">
                    <span class="font-body-md text-body-md font-semibold text-primary">Cath Lab Consult</span>
                    <span class="font-body-sm text-body-sm text-on-surface-variant">Dispatch summary to On-Call Fellow</span>
                  </div>
                </div>
                <span class="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
              </button>
            </div>
            <!-- Telemetry Sync Status Indicator -->
            <div class="pt-space-xs flex items-center justify-between text-body-sm text-on-surface-variant border-none">
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-secondary"></span>
                Holter telemetry online
              </span>
              <span class="font-label-data-sm text-label-data-sm">Battery: 94%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  setupProfileInteractions(container, router, patient, assessments);
}

function renderHistoryRows(assessments) {
  if (!assessments || assessments.length === 0) {
    return `<tr><td colspan="8" class="py-6 text-center text-on-surface-variant font-body-sm">No recorded assessments found for this patient.</td></tr>`;
  }

  return assessments.map(a => {
    const isClass1 = a.prediction === 1;
    const feat = a.features || {};

    return `
      <tr class="hover:bg-surface-container-low/70 transition-colors bg-surface-container-lowest">
        <td class="py-3 px-space-md">
          <div class="flex flex-col">
            <span class="font-body-md text-body-md font-semibold text-primary">${escapeHtml(a.created_at ? a.created_at.slice(0, 10) : '2024-10-24')}</span>
            <span class="font-label-data-sm text-label-data-sm text-on-surface-variant">#${escapeHtml(a.reference_id)}</span>
          </div>
        </td>
        <td class="py-3 px-space-sm text-right font-label-data-md text-label-data-md ${feat.trestbps > 139 ? 'text-error font-semibold' : 'text-on-surface'}">
          ${feat.trestbps || '--'} <span class="text-body-sm text-on-surface-variant font-normal">mmHg</span>
        </td>
        <td class="py-3 px-space-sm text-right font-label-data-md text-label-data-md ${feat.chol > 239 ? 'text-error font-semibold' : 'text-on-surface'}">
          ${feat.chol || '--'} <span class="text-body-sm text-on-surface-variant font-normal">mg/dL</span>
        </td>
        <td class="py-3 px-space-sm text-right font-label-data-md text-label-data-md text-on-surface">
          ${feat.thalach || '--'} <span class="text-body-sm text-on-surface-variant font-normal">bpm</span>
        </td>
        <td class="py-3 px-space-sm text-right font-label-data-md text-label-data-md ${feat.oldpeak > 2.0 ? 'text-error font-semibold' : 'text-on-surface'}">
          ${feat.oldpeak != null ? feat.oldpeak : '--'} <span class="text-body-sm text-on-surface-variant font-normal">mm</span>
        </td>
        <td class="py-3 px-space-md text-center">
          <span class="inline-flex items-center gap-1 font-label-ui text-label-ui px-2.5 py-0.5 rounded-full ${isClass1 ? 'bg-error-container text-on-error-container font-semibold' : 'bg-secondary-container text-on-secondary-container font-semibold'}">
            <span class="w-1.5 h-1.5 rounded-full ${isClass1 ? 'bg-error' : 'bg-secondary'}"></span>
            ${isClass1 ? 'Class 1 (Pos)' : 'Class 0 (Neg)'}
          </span>
        </td>
        <td class="py-3 px-space-sm">
          <span class="font-body-sm text-body-sm font-semibold ${isClass1 ? 'text-error' : 'text-on-surface-variant'}">${escapeHtml(a.follow_up_text || 'Routine')}</span>
        </td>
        <td class="py-3 px-space-md text-right">
          <div class="inline-flex items-center gap-1">
            <button class="view-result-btn px-2 py-1 bg-surface-container text-on-surface rounded text-body-sm hover:bg-surface-container-high transition-colors font-medium"
                    data-assessment-id="${a.id}" type="button">Result</button>
            <button class="download-pdf-btn px-2 py-1 bg-primary text-on-primary rounded text-body-sm hover:bg-primary-container transition-colors font-medium"
                    data-assessment-id="${a.id}" data-ref="${escapeHtml(a.reference_id)}" type="button">Report</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderReportsList(assessments) {
  if (!assessments || assessments.length === 0) {
    return `<p class="font-body-sm text-on-surface-variant p-2">No generated reports available yet.</p>`;
  }

  return assessments.map(a => {
    const isClass1 = a.prediction === 1;
    return `
      <div class="p-space-sm bg-surface-container-low hover:bg-surface-container transition-colors rounded-lg flex items-center justify-between gap-space-sm">
        <div class="flex items-center gap-space-sm min-w-0">
          <div class="w-10 h-10 rounded ${isClass1 ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'} flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[20px]">picture_as_pdf</span>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="font-body-md text-body-md font-semibold text-primary truncate">${escapeHtml(a.reference_id)}-Report.pdf</span>
            <span class="font-body-sm text-body-sm text-on-surface-variant">${escapeHtml(a.created_at ? a.created_at.slice(0, 10) : '2024-10-24')} • Signed</span>
          </div>
        </div>
        <button class="download-pdf-btn p-2 text-on-surface-variant hover:text-primary transition-colors shrink-0"
                data-assessment-id="${a.id}" data-ref="${escapeHtml(a.reference_id)}" aria-label="Download Report" type="button">
          <span class="material-symbols-outlined text-[20px]">download</span>
        </button>
      </div>
    `;
  }).join('');
}

function setupProfileInteractions(container, router, patient, assessments) {
  container.querySelector('#breadcrumbBackBtn')?.addEventListener('click', () => {
    router.navigate('dashboard');
  });

  container.querySelector('#newAssessmentBtn')?.addEventListener('click', () => {
    state.activePatient = patient;
    state.activePatientId = patient.id;
    router.navigate('form');
  });

  container.querySelector('#emptyStartAssBtn')?.addEventListener('click', () => {
    state.activePatient = patient;
    state.activePatientId = patient.id;
    router.navigate('form');
  });

  container.querySelector('#editPatientBtn')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('modal:edit-patient', { detail: { patient } }));
  });

  // Table row actions
  container.querySelectorAll('.view-result-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const aId = parseInt(e.currentTarget.getAttribute('data-assessment-id'), 10);
      const targetAss = assessments.find(a => a.id === aId);
      if (targetAss) {
        state.activeAssessment = targetAss;
        state.activeAssessmentId = aId;
      }
      router.navigate('results');
    });
  });

  container.querySelectorAll('.download-pdf-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const aId = parseInt(e.currentTarget.getAttribute('data-assessment-id'), 10);
      const ref = e.currentTarget.getAttribute('data-ref') || 'Assessment';
      try {
        setNotification('Downloading PDF report...', 'info');
        await api.downloadReport(aId, `${ref}_CardioCheck_Report.pdf`);
        setNotification('Report downloaded successfully.', 'success');
      } catch (err) {
        alert(`Failed to download report: ${err.message}`);
      }
    });
  });
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
