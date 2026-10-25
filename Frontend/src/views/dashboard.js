import { api } from '../api.js';
import { state, setNotification } from '../state.js';

export function renderDashboard(container, router) {
  const summary = state.dashboardSummary || {
    doctor: { name: 'Dr. Sarah Jenkins, MD', department: 'Cardiology Dept' },
    kpis: { total_patients: 248, recent_assessments: 38, awaiting_review: 5, follow_ups_scheduled: 14 },
    distribution: { class_0_pct: 64.5, class_0_count: 160, class_1_pct: 35.5, class_1_count: 88, total_evaluated: 248 },
    queue: []
  };

  const doc = state.doctor || summary.doctor;

  container.innerHTML = `
    <div class="flex flex-col w-full">
      <!-- Dynamic Clinical Greeting Bar -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
        <div class="flex flex-col">
          <div class="flex items-center gap-space-sm mb-1">
            <span class="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-data-sm text-label-data-sm tracking-wider uppercase">Cleveland Clinic Cohort Reference</span>
            <span class="h-1.5 w-1.5 rounded-full bg-secondary"></span>
            <span class="font-label-ui text-label-ui text-secondary font-semibold">Active Session</span>
          </div>
          <h1 class="font-headline-lg text-headline-lg text-primary tracking-tight">Welcome back, ${escapeHtml(doc.full_name || doc.name || 'Doctor')} — Clinical Decision Support Hub</h1>
          <p class="font-body-md text-body-md text-on-surface-variant">Demonstration environment. Powered by Cleveland Dataset-trained Logistic Regression.</p>
        </div>
        <!-- Quick Actions Header Segment -->
        <div class="flex items-center gap-space-sm self-start lg:self-center">
          <button id="dashStartAssessmentBtn" class="group flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high shadow-sm transition-all duration-200" type="button">
            <span class="material-symbols-outlined text-[18px] text-secondary">cardiology</span>
            <span class="font-label-ui text-label-ui">Start New Assessment</span>
          </button>
          <button id="dashAddPatientBtn" class="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container shadow-sm transition-all duration-200" type="button">
            <span class="material-symbols-outlined text-[18px]">person_add</span>
            <span class="font-label-ui text-label-ui">+ Add Patient</span>
          </button>
        </div>
      </div>

      <!-- KPI Metric Overview Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl">
        <!-- Total Patients -->
        <div class="relative overflow-hidden p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between mb-space-sm">
            <span class="font-label-ui text-label-ui uppercase tracking-wider text-on-surface-variant">Total Patients</span>
            <div class="h-8 w-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
              <span class="material-symbols-outlined text-[20px]">groups</span>
            </div>
          </div>
          <div class="flex items-baseline justify-between">
            <span class="font-label-data-lg text-label-data-lg text-primary text-2xl font-bold">${summary.kpis.total_patients}</span>
            <div class="flex items-center gap-0.5 text-on-secondary-container bg-secondary-container/20 px-2 py-0.5 rounded-full">
              <span class="material-symbols-outlined text-[14px]">trending_up</span>
              <span class="font-label-data-sm text-label-data-sm font-semibold">+12 this mo</span>
            </div>
          </div>
          <div class="mt-3 pt-2">
            <svg class="w-full h-5 text-secondary" fill="none" preserveAspectRatio="none" viewBox="0 0 100 20">
              <path d="M0 16 L20 14 L40 17 L60 8 L80 10 L100 3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
          </div>
        </div>

        <!-- Recent Assessments -->
        <div class="relative overflow-hidden p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between mb-space-sm">
            <span class="font-label-ui text-label-ui uppercase tracking-wider text-on-surface-variant">Recent Assessments</span>
            <div class="h-8 w-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-[20px]">fact_check</span>
            </div>
          </div>
          <div class="flex items-baseline justify-between">
            <span class="font-label-data-lg text-label-data-lg text-primary text-2xl font-bold">${summary.kpis.recent_assessments}</span>
            <span class="font-body-sm text-body-sm text-on-surface-variant">past 7 days</span>
          </div>
          <div class="mt-3 pt-2">
            <svg class="w-full h-5 text-primary-container" fill="none" preserveAspectRatio="none" viewBox="0 0 100 20">
              <path d="M0 12 L18 10 L35 15 L52 7 L70 12 L85 6 L100 4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
          </div>
        </div>

        <!-- Awaiting Review -->
        <div class="relative overflow-hidden p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between mb-space-sm">
            <span class="font-label-ui text-label-ui uppercase tracking-wider text-on-surface-variant">Awaiting Review</span>
            <div class="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <span class="material-symbols-outlined text-[20px]">priority_high</span>
            </div>
          </div>
          <div class="flex items-baseline justify-between">
            <span class="font-label-data-lg text-label-data-lg text-primary text-2xl font-bold">${summary.kpis.awaiting_review}</span>
            <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-label-data-sm text-label-data-sm font-semibold flex items-center gap-1">
              <span class="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse"></span> Requires action
            </span>
          </div>
          <div class="mt-3 pt-2">
            <div class="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
              <div class="h-full bg-amber-500 rounded-full" style="width: ${Math.min(100, summary.kpis.awaiting_review * 20)}%;"></div>
            </div>
          </div>
        </div>

        <!-- Follow-up Scheduled -->
        <div class="relative overflow-hidden p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between mb-space-sm">
            <span class="font-label-ui text-label-ui uppercase tracking-wider text-on-surface-variant">Follow-ups Scheduled</span>
            <div class="h-8 w-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
              <span class="material-symbols-outlined text-[20px]">calendar_month</span>
            </div>
          </div>
          <div class="flex items-baseline justify-between">
            <span class="font-label-data-lg text-label-data-lg text-primary text-2xl font-bold">${summary.kpis.follow_ups_scheduled}</span>
            <span class="font-body-sm text-body-sm text-on-surface-variant">scheduled this week</span>
          </div>
          <div class="mt-3 pt-2">
            <div class="flex gap-1 h-5 items-end">
              <span class="w-full bg-surface-container h-2 rounded-t"></span>
              <span class="w-full bg-surface-container h-3 rounded-t"></span>
              <span class="w-full bg-secondary h-5 rounded-t"></span>
              <span class="w-full bg-surface-container h-3.5 rounded-t"></span>
              <span class="w-full bg-surface-container h-2.5 rounded-t"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Section: Diagnostic Assessment Queue & Workbench -->
      <div class="flex flex-col rounded-xl bg-surface-container-lowest shadow-sm mb-space-lg overflow-hidden">
        <!-- Header & Interactive Filter Bar -->
        <div class="p-space-lg flex flex-col xl:flex-row xl:items-center justify-between gap-space-md bg-surface-container-lowest">
          <div class="flex flex-col">
            <div class="flex items-center gap-space-xs">
              <h2 class="font-headline-md text-headline-md text-primary tracking-tight">Recent Patient Assessments &amp; Clinical Queue</h2>
              <span class="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-data-sm text-label-data-sm">${summary.queue.length} Active</span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Cleveland v1 Logistic Regression output mapping (binary presence ≥ 50% diameter narrowing)</p>
          </div>
          <!-- Filters & Search Toolbar -->
          <div class="flex flex-wrap items-center gap-space-sm">
            <!-- Search Input -->
            <div class="relative min-w-[260px] flex-1 sm:flex-initial">
              <span class="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">search</span>
              <input class="w-full pl-9 pr-3 py-1.5 bg-surface rounded-lg text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-low transition-all" id="patientQueueSearch" placeholder="Search Patient Name or ID..." type="text"/>
            </div>
            <!-- Filter: Status -->
            <div class="flex items-center rounded-lg bg-surface p-1">
              <button class="px-3 py-1 text-on-primary bg-primary rounded-md font-label-ui text-label-ui transition-colors" id="filterAll" type="button">All</button>
              <button class="px-3 py-1 text-on-surface-variant hover:text-on-surface rounded-md font-label-ui text-label-ui transition-colors" id="filterPending" type="button">Pending Review</button>
              <button class="px-3 py-1 text-on-surface-variant hover:text-on-surface rounded-md font-label-ui text-label-ui transition-colors" id="filterReviewed" type="button">Reviewed</button>
            </div>
            <!-- Filter: Classification -->
            <div class="relative">
              <select class="appearance-none bg-surface text-on-surface font-label-ui text-label-ui pl-3 pr-8 py-2 rounded-lg cursor-pointer focus:outline-none" id="classificationSelect">
                <option value="ALL">All Inferences</option>
                <option value="CLASS_0">Class 0 (No Heart Disease)</option>
                <option value="CLASS_1">Class 1 (Heart Disease Present)</option>
              </select>
              <span class="material-symbols-outlined pointer-events-none absolute right-2 top-2.5 text-on-surface-variant text-[16px]">expand_more</span>
            </div>
            <!-- Reset -->
            <button class="p-2 rounded-lg bg-surface text-on-surface-variant hover:text-primary transition-colors" id="resetFiltersBtn" title="Reset View" type="button">
              <span class="material-symbols-outlined text-[18px]">refresh</span>
            </button>
          </div>
        </div>

        <!-- Tabular Patient Queue -->
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface text-on-surface-variant font-label-ui text-label-ui uppercase tracking-wider">
                <th class="py-3 px-space-lg">Patient Ref ID</th>
                <th class="py-3 px-space-md">Patient Demographics</th>
                <th class="py-3 px-space-md">Assessment Timestamp</th>
                <th class="py-3 px-space-md">ML Classification (LR Cleveland)</th>
                <th class="py-3 px-space-md">Review Status</th>
                <th class="py-3 px-space-lg text-right">Clinical Actions</th>
              </tr>
            </thead>
            <tbody class="font-body-md text-body-md divide-y-0" id="patientQueueTableBody">
              ${renderQueueRows(summary.queue)}
            </tbody>
          </table>
          <div id="queueEmptyState" class="hidden flex-col items-center justify-center py-12 px-4 text-center">
            <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-2">person_search</span>
            <p class="font-headline-md text-primary mb-1">No matching patients in queue</p>
            <p class="font-body-sm text-on-surface-variant">Adjust your filter criteria or register a new patient.</p>
          </div>
        </div>
      </div>

      <!-- Lower Split: Quick Intake Shortcut & Cohort Risk Distribution -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-space-lg mb-space-lg">
        <!-- Rapid Assessment Entry Step 1 of 4 -->
        <div class="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
          <div class="flex flex-col">
            <div class="flex items-center justify-between mb-space-sm">
              <div class="flex items-center gap-space-xs">
                <span class="material-symbols-outlined text-secondary text-[20px]">speed</span>
                <h3 class="font-headline-md text-headline-md text-primary tracking-tight">Rapid Assessment Intake</h3>
              </div>
              <span class="font-label-ui text-label-ui uppercase tracking-wider text-on-surface-variant">Step 1 of 4</span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-md">Rapidly enter standard Cleveland parameters (Age, CP, Resting BP, ST Slope) for urgent triage classification.</p>
            <div class="space-y-space-sm mb-space-md">
              <div class="flex items-center justify-between p-2 rounded bg-surface">
                <span class="font-label-ui text-label-ui text-on-surface">Target Patient:</span>
                <span class="font-label-data-sm text-label-data-sm text-primary font-semibold">PT-8821 (Eleanor Vance)</span>
              </div>
              <div class="flex items-center justify-between p-2 rounded bg-surface">
                <span class="font-label-ui text-label-ui text-on-surface">Active Algorithm:</span>
                <span class="font-label-data-sm text-label-data-sm text-secondary font-semibold">Cleveland_LogReg_v1.0.joblib</span>
              </div>
            </div>
          </div>
          <button id="quickContinueWizardBtn" class="w-full py-2 px-space-sm bg-primary text-on-primary rounded-lg font-label-ui text-label-ui hover:bg-primary-container transition-colors text-center" type="button">
            Continue Wizard →
          </button>
        </div>

        <!-- Diagnostic Model Distribution & Performance -->
        <div class="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
          <div class="flex flex-col">
            <div class="flex items-center justify-between mb-space-sm">
              <div class="flex items-center gap-space-xs">
                <span class="material-symbols-outlined text-primary text-[20px]">analytics</span>
                <h3 class="font-headline-md text-headline-md text-primary tracking-tight">Cohort Risk Distribution</h3>
              </div>
              <span class="font-label-ui text-label-ui uppercase tracking-wider text-on-surface-variant">Ward 4B</span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-md">Real-time classification split across active inpatient telemetry monitors.</p>
            <div class="space-y-3 mb-space-sm">
              <div>
                <div class="flex justify-between font-label-ui text-label-ui mb-1">
                  <span class="text-on-surface">Class 0: Negative / Low Risk</span>
                  <span class="font-label-data-sm text-label-data-sm text-secondary">${summary.distribution.class_0_pct}% (${summary.distribution.class_0_count})</span>
                </div>
                <div class="w-full bg-surface-container rounded-full h-2">
                  <div class="bg-secondary h-2 rounded-full" style="width: ${summary.distribution.class_0_pct}%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between font-label-ui text-label-ui mb-1">
                  <span class="text-on-surface">Class 1: Coronary Artery Disease Suspicion</span>
                  <span class="font-label-data-sm text-label-data-sm text-error">${summary.distribution.class_1_pct}% (${summary.distribution.class_1_count})</span>
                </div>
                <div class="w-full bg-surface-container rounded-full h-2">
                  <div class="bg-error h-2 rounded-full" style="width: ${summary.distribution.class_1_pct}%"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="pt-space-sm flex items-center justify-between text-on-surface-variant font-label-data-sm text-label-data-sm border-t border-surface-container/60">
            <span>Sensitivity: 86.1%</span>
            <span>Specificity: 82.4%</span>
            <span>AUC: 0.912</span>
          </div>
        </div>

        <!-- Rapid Patient Quick Register Widget -->
        <div class="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
          <div class="flex flex-col">
            <div class="flex items-center justify-between mb-space-sm">
              <div class="flex items-center gap-space-xs">
                <span class="material-symbols-outlined text-secondary text-[20px]">badge</span>
                <h3 class="font-headline-md text-headline-md text-primary tracking-tight">Quick Intake Shortcut</h3>
              </div>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">Initiate rapid record creation for emergency admittance triage.</p>
            <form id="quickIntakeForm" class="space-y-2.5">
              <div>
                <label class="block font-label-ui text-label-ui text-on-surface mb-1">Patient Full Name</label>
                <input id="quickName" class="w-full px-3 py-1.5 bg-surface rounded-lg text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-low transition-all" placeholder="e.g. Robert Kowalski" required type="text"/>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block font-label-ui text-label-ui text-on-surface mb-1">Age</label>
                  <input id="quickAge" class="w-full px-3 py-1.5 bg-surface rounded-lg text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-low transition-all" max="100" min="18" placeholder="58" required type="number" value="58"/>
                </div>
                <div>
                  <label class="block font-label-ui text-label-ui text-on-surface mb-1">Sex</label>
                  <select id="quickSex" class="w-full px-3 py-1.5 bg-surface rounded-lg text-on-surface font-body-sm text-body-sm focus:outline-none">
                    <option value="1">Male</option>
                    <option value="0">Female</option>
                  </select>
                </div>
              </div>
              <button class="w-full mt-2 py-2 px-space-sm bg-surface-container text-on-surface hover:bg-surface-container-high rounded-lg font-label-ui text-label-ui transition-colors font-medium" type="submit">
                Register &amp; Begin Evaluation
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Mandatory Clinical Disclaimer Banner -->
      <div class="p-space-md rounded-xl bg-surface-container-low flex flex-col sm:flex-row items-start sm:items-center gap-space-sm text-on-surface-variant">
        <div class="p-2 rounded-lg bg-surface-container-lowest text-primary flex-shrink-0">
          <span class="material-symbols-outlined text-[20px]">gavel</span>
        </div>
        <div class="flex flex-col">
          <span class="font-label-ui text-label-ui uppercase tracking-wider font-semibold text-primary">Demonstration Data Only • Clinical Decision Support Disclaimer</span>
          <p class="font-body-sm text-body-sm leading-relaxed">
            CardioCheck's Logistic Regression model is trained on the Cleveland Heart Disease Dataset and is not yet clinically validated. Outputs represent statistical classification within dataset bounds, not definitive diagnoses. Always corroborate model probabilistic scores with comprehensive echocardiograms, angiograms, and primary physician assessment.
          </p>
        </div>
      </div>
    </div>
  `;

  // --- Attach Event Listeners ---
  setupDashboardInteractions(container, router, summary);
}

function renderQueueRows(queue) {
  if (!queue || queue.length === 0) {
    return '';
  }
  return queue.map(item => {
    const isClass1 = item.prediction === 1;
    const classBadge = isClass1
      ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-data-sm text-label-data-sm font-semibold">
           <span class="h-1.5 w-1.5 rounded-full bg-error"></span>
           Class 1 (Heart Disease Category)
         </span>`
      : `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-data-sm text-label-data-sm font-semibold">
           <span class="h-1.5 w-1.5 rounded-full bg-secondary"></span>
           Class 0 (No Heart Disease)
         </span>`;

    const statusBadge = item.status === 'reviewed'
      ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container/50 text-secondary font-label-ui text-label-ui font-semibold">
           <span class="material-symbols-outlined text-[14px]">check_circle</span> Reviewed
         </span>`
      : `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-label-ui text-label-ui font-semibold">
           <span class="material-symbols-outlined text-[14px]">pending</span> Pending Review
         </span>`;

    const classData = isClass1 ? 'CLASS_1' : 'CLASS_0';

    return `
      <tr class="queue-row hover:bg-surface-container-low/50 transition-colors border-b border-surface-container/40"
          data-class="${classData}"
          data-id="${escapeHtml(item.patient_mrn || '')}"
          data-name="${escapeHtml(item.patient_name || '')}"
          data-status="${item.status || 'pending'}">
        <td class="py-3.5 px-space-lg whitespace-nowrap">
          <div class="flex items-center gap-space-xs">
            <span class="font-label-data-md text-label-data-md text-primary font-semibold">${escapeHtml(item.patient_mrn)}</span>
            ${item.has_flag ? `<span class="material-symbols-outlined text-amber-600 text-[16px]" title="Priority Review Flag">flag</span>` : ''}
          </div>
        </td>
        <td class="py-3.5 px-space-md whitespace-nowrap">
          <div class="flex flex-col">
            <span class="font-headline-md text-body-lg text-on-surface font-semibold">${escapeHtml(item.patient_name)}</span>
            <span class="font-label-data-sm text-label-data-sm text-on-surface-variant">${escapeHtml(item.patient_demographics)}</span>
          </div>
        </td>
        <td class="py-3.5 px-space-md whitespace-nowrap">
          <span class="font-label-data-sm text-label-data-sm text-on-surface">${escapeHtml(item.timestamp)}</span>
        </td>
        <td class="py-3.5 px-space-md whitespace-nowrap">
          ${classBadge}
        </td>
        <td class="py-3.5 px-space-md whitespace-nowrap">
          ${statusBadge}
        </td>
        <td class="py-3.5 px-space-lg text-right whitespace-nowrap">
          <div class="inline-flex items-center gap-1">
            <button class="open-profile-btn px-2.5 py-1 rounded bg-surface hover:bg-surface-container font-label-ui text-label-ui text-on-surface transition-colors"
                    data-patient-id="${item.patient_id}"
                    type="button">Open Profile</button>
            <button class="open-assessment-btn px-2.5 py-1 rounded bg-primary text-on-primary hover:bg-primary-container font-label-ui text-label-ui transition-colors"
                    data-patient-id="${item.patient_id}"
                    data-assessment-id="${item.assessment_id}"
                    type="button">View Result</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function setupDashboardInteractions(container, router, summary) {
  // Navigation buttons
  container.querySelector('#dashStartAssessmentBtn')?.addEventListener('click', () => {
    // If we have patients, default to the first or Eleanor Vance
    const defaultPat = summary.queue.find(q => q.patient_mrn === 'PT-8821') || summary.queue[0];
    if (defaultPat) {
      state.activePatientId = defaultPat.patient_id;
    }
    router.navigate('form');
  });

  container.querySelector('#quickContinueWizardBtn')?.addEventListener('click', () => {
    const el = summary.queue.find(q => q.patient_mrn === 'PT-8821') || summary.queue[0];
    if (el) state.activePatientId = el.patient_id;
    router.navigate('form');
  });

  container.querySelector('#dashAddPatientBtn')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('modal:add-patient'));
  });

  // Row action buttons
  container.querySelectorAll('.open-profile-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pId = parseInt(e.currentTarget.getAttribute('data-patient-id'), 10);
      state.activePatientId = pId;
      router.navigate('patient-profile');
    });
  });

  container.querySelectorAll('.open-assessment-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pId = parseInt(e.currentTarget.getAttribute('data-patient-id'), 10);
      const aId = parseInt(e.currentTarget.getAttribute('data-assessment-id'), 10);
      state.activePatientId = pId;
      state.activeAssessmentId = aId;
      router.navigate('results');
    });
  });

  // Table filtering
  const searchInput = container.querySelector('#patientQueueSearch');
  const filterAll = container.querySelector('#filterAll');
  const filterPending = container.querySelector('#filterPending');
  const filterReviewed = container.querySelector('#filterReviewed');
  const classSelect = container.querySelector('#classificationSelect');
  const resetBtn = container.querySelector('#resetFiltersBtn');
  const rows = container.querySelectorAll('.queue-row');
  const emptyState = container.querySelector('#queueEmptyState');

  let currentStatus = 'all';

  function setFilterActive(activeBtn) {
    [filterAll, filterPending, filterReviewed].forEach(b => {
      if (b) b.className = 'px-3 py-1 text-on-surface-variant hover:text-on-surface rounded-md font-label-ui text-label-ui transition-colors';
    });
    if (activeBtn) activeBtn.className = 'px-3 py-1 text-on-primary bg-primary rounded-md font-label-ui text-label-ui transition-colors';
  }

  function applyFilters() {
    const query = (searchInput.value || '').trim().toLowerCase();
    const selectedClass = classSelect.value;
    let visibleCount = 0;

    rows.forEach(row => {
      const pId = (row.getAttribute('data-id') || '').toLowerCase();
      const pName = (row.getAttribute('data-name') || '').toLowerCase();
      const status = row.getAttribute('data-status') || '';
      const cClass = row.getAttribute('data-class') || '';

      const matchesQuery = !query || pId.includes(query) || pName.includes(query);
      const matchesStatus = currentStatus === 'all' || status === currentStatus;
      const matchesClass = selectedClass === 'ALL' || cClass === selectedClass;

      if (matchesQuery && matchesStatus && matchesClass) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
      } else {
        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');
      }
    }
  }

  searchInput?.addEventListener('input', applyFilters);
  filterAll?.addEventListener('click', () => { currentStatus = 'all'; setFilterActive(filterAll); applyFilters(); });
  filterPending?.addEventListener('click', () => { currentStatus = 'pending'; setFilterActive(filterPending); applyFilters(); });
  filterReviewed?.addEventListener('click', () => { currentStatus = 'reviewed'; setFilterActive(filterReviewed); applyFilters(); });
  classSelect?.addEventListener('change', applyFilters);

  resetBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (classSelect) classSelect.value = 'ALL';
    currentStatus = 'all';
    setFilterActive(filterAll);
    applyFilters();
  });

  // Quick intake form submission
  const quickForm = container.querySelector('#quickIntakeForm');
  quickForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = container.querySelector('#quickName').value.trim();
    const age = parseInt(container.querySelector('#quickAge').value, 10);
    const sex = parseInt(container.querySelector('#quickSex').value, 10);

    try {
      setNotification(`Registering intake for ${name}...`, 'info');
      const newPat = await api.createPatient({ name, age, sex });
      setNotification(`Patient ${newPat.name} (${newPat.mrn}) created successfully.`, 'success');
      state.activePatientId = newPat.id;
      // Refresh dashboard summary then navigate to form
      api.getDashboardSummary().then(s => state.dashboardSummary = s).catch(() => {});
      router.navigate('form');
    } catch (err) {
      alert(`Registration error: ${err.message}`);
    }
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
