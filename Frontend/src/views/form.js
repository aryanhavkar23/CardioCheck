import { api } from '../api.js';
import { state, setNotification } from '../state.js';

export function renderClinicalForm(container, router) {
  // Determine patient context
  const patient = state.activePatient || {
    id: 1,
    name: 'Eleanor Vance',
    mrn: 'PT-8821',
    age: 62,
    sex: 0,
    dob: '1962-03-14',
    ward: 'West Pavilion 4B',
    protocol: 'Coronary Artery Disease Comprehensive Risk Workup'
  };

  const patientSexStr = patient.sex === 0 ? 'Female' : 'Male';

  container.innerHTML = `
    <div class="flex flex-col w-full">
      <!-- Patient Context Banner -->
      <div class="w-full bg-surface-container-lowest rounded-xl shadow-sm p-space-lg mb-space-lg flex flex-col xl:flex-row items-start xl:items-center justify-between gap-space-md">
        <div class="flex items-center gap-space-md">
          <div class="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
            <span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 1;">medical_information</span>
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-space-sm">
              <span class="font-headline-lg text-headline-lg text-on-surface">${escapeHtml(patient.name)}</span>
              <span class="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-data-sm text-label-data-sm font-semibold">MRN: ${escapeHtml(patient.mrn)}</span>
              <span class="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-ui text-label-ui uppercase font-semibold">Active Inpatient Evaluation</span>
            </div>
            <div class="flex flex-wrap items-center gap-x-space-md gap-y-1 font-body-sm text-body-sm text-on-surface-variant mt-1">
              <span>DOB: <strong class="text-on-surface font-label-data-sm text-label-data-sm">${escapeHtml(patient.dob || '1962-03-14')} (${patient.age} yrs)</strong></span>
              <span class="text-outline-variant">•</span>
              <span>Biological Sex: <strong class="text-on-surface">${patientSexStr}</strong></span>
              <span class="text-outline-variant">•</span>
              <span>Attending: <strong class="text-on-surface font-medium">${escapeHtml(state.doctor?.full_name || 'Dr. Sarah Jenkins, MD')}</strong></span>
              <span class="text-outline-variant">•</span>
              <span>Protocol: <strong class="text-primary font-medium">${escapeHtml(patient.protocol || 'CAD Risk Workup')}</strong></span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-lg self-stretch xl:self-auto justify-between xl:justify-start">
          <div class="flex flex-col text-left">
            <span class="font-label-ui text-label-ui text-on-surface-variant uppercase">Evaluation Type</span>
            <span class="font-label-data-md text-label-data-md font-semibold text-primary">Standard Diagnostic Workup</span>
          </div>
          <div class="h-8 w-px bg-outline-variant"></div>
          <div class="flex items-center gap-1.5 text-secondary">
            <span class="material-symbols-outlined text-[18px]">verified</span>
            <span class="font-label-data-sm text-label-data-sm font-semibold">13 Clinical Criteria</span>
          </div>
        </div>
      </div>

      <!-- Stepper Navigation Bar -->
      <div class="w-full bg-surface-container-lowest rounded-xl shadow-sm p-space-md mb-space-lg">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-space-sm relative">
          <!-- Step 1 -->
          <button class="step-nav-btn text-left p-space-sm rounded-lg bg-surface-container flex items-center gap-space-sm transition-all" id="step-btn-1" type="button">
            <div class="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-data-sm text-label-data-sm font-bold" id="step-badge-1">1</div>
            <div class="flex flex-col min-w-0">
              <span class="font-label-ui text-label-ui uppercase text-on-surface-variant font-semibold">Step A • 3 Features</span>
              <span class="font-headline-md text-headline-md text-on-surface truncate">Demographics &amp; Pain</span>
            </div>
          </button>
          <!-- Step 2 -->
          <button class="step-nav-btn text-left p-space-sm rounded-lg bg-surface hover:bg-surface-container transition-all flex items-center gap-space-sm" id="step-btn-2" type="button">
            <div class="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-label-data-sm text-label-data-sm font-semibold" id="step-badge-2">2</div>
            <div class="flex flex-col min-w-0">
              <span class="font-label-ui text-label-ui uppercase text-on-surface-variant font-semibold">Step B • 5 Features</span>
              <span class="font-headline-md text-headline-md text-on-surface-variant truncate">Biometrics &amp; Lab Data</span>
            </div>
          </button>
          <!-- Step 3 -->
          <button class="step-nav-btn text-left p-space-sm rounded-lg bg-surface hover:bg-surface-container transition-all flex items-center gap-space-sm" id="step-btn-3" type="button">
            <div class="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-label-data-sm text-label-data-sm font-semibold" id="step-badge-3">3</div>
            <div class="flex flex-col min-w-0">
              <span class="font-label-ui text-label-ui uppercase text-on-surface-variant font-semibold">Step C • 5 Features</span>
              <span class="font-headline-md text-headline-md text-on-surface-variant truncate">Cardiac Stress &amp; Anatomy</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Main Grid: 8-Column Form + 4-Column Live Model Contract Preview -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <!-- Main Form Content (8 Columns) -->
        <div class="lg:col-span-8 flex flex-col gap-space-lg">
          <form class="flex flex-col gap-space-lg" id="cad-form" onsubmit="event.preventDefault();">
            <!-- STEP 1 CONTENT -->
            <section class="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-lg" id="step-section-1">
              <div class="flex items-center justify-between pb-space-sm border-b border-surface-container">
                <div class="flex flex-col">
                  <span class="font-label-ui text-label-ui text-secondary font-bold uppercase tracking-wider">Section 1 of 3</span>
                  <h2 class="font-headline-lg text-headline-lg text-on-surface">Demographics &amp; Chest Pain Presentation</h2>
                </div>
                <span class="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-data-sm text-label-data-sm font-semibold">Step In Progress</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center justify-between">
                    <label class="font-label-ui text-label-ui font-semibold text-on-surface uppercase" for="feature-age">Age</label>
                    <span class="font-body-sm text-body-sm text-on-surface-variant">Adult reference: 18–100 yrs</span>
                  </div>
                  <div class="relative rounded-lg bg-surface-container-low focus-within:bg-surface-container focus-within:ring-2 focus-within:ring-secondary transition-all">
                    <input class="w-full bg-transparent px-space-md py-2.5 text-on-surface font-label-data-md text-label-data-md focus:outline-none pr-16" id="feature-age" max="100" min="18" placeholder="Years" type="number" value="${patient.age || 62}"/>
                    <span class="absolute right-3 top-2.5 font-label-data-sm text-label-data-sm text-on-surface-variant pointer-events-none">years</span>
                  </div>
                  <p class="font-body-sm text-body-sm text-on-surface-variant">Verified from medical record (${escapeHtml(patient.name)}, age ${patient.age}).</p>
                </div>
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center justify-between">
                    <label class="font-label-ui text-label-ui font-semibold text-on-surface uppercase">Biological Sex</label>
                    <span class="font-label-data-sm text-label-data-sm text-secondary font-semibold" id="sexLabel">${patientSexStr}</span>
                  </div>
                  <div class="grid grid-cols-2 gap-space-xs p-1 rounded-lg bg-surface-container-low">
                    <button class="py-2 text-center rounded-md font-label-ui text-label-ui ${patient.sex === 0 ? 'font-bold bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'} transition-all" id="sex-btn-0" type="button">Female</button>
                    <button class="py-2 text-center rounded-md font-label-ui text-label-ui ${patient.sex === 1 ? 'font-bold bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'} transition-all" id="sex-btn-1" type="button">Male</button>
                  </div>
                  <input id="feature-sex" type="hidden" value="${patient.sex || 0}"/>
                  <p class="font-body-sm text-body-sm text-on-surface-variant">Physiological risk profile stratified accordingly.</p>
                </div>
              </div>
              <div class="flex flex-col gap-space-sm pt-space-xs">
                <div class="flex items-center justify-between">
                  <label class="font-label-ui text-label-ui font-semibold text-on-surface uppercase" for="feature-cp">Chest Pain Classification</label>
                  <span class="font-label-data-sm text-label-data-sm text-on-surface-variant">AHA/ACC Angina Criteria</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                  <label class="cp-option flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-all">
                    <input class="mt-1 accent-primary" name="feature_cp" type="radio" value="0"/>
                    <div class="flex flex-col">
                      <span class="font-label-ui text-label-ui font-semibold text-on-surface">Typical Angina</span>
                      <span class="font-body-sm text-body-sm text-on-surface-variant">Substernal chest discomfort provoked by physical exertion or stress; relieved by rest or nitroglycerin.</span>
                    </div>
                  </label>
                  <label class="cp-option flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-highest/60 ring-2 ring-secondary cursor-pointer transition-all">
                    <input checked class="mt-1 accent-secondary" name="feature_cp" type="radio" value="1"/>
                    <div class="flex flex-col">
                      <span class="font-label-ui text-label-ui font-bold text-on-surface">Atypical Angina ★</span>
                      <span class="font-body-sm text-body-sm text-on-surface-variant">Presents 2 of the 3 classic criteria. Frequent presentation in female cardiac patients.</span>
                    </div>
                  </label>
                  <label class="cp-option flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-all">
                    <input class="mt-1 accent-primary" name="feature_cp" type="radio" value="2"/>
                    <div class="flex flex-col">
                      <span class="font-label-ui text-label-ui font-semibold text-on-surface">Non-Anginal Chest Pain</span>
                      <span class="font-body-sm text-body-sm text-on-surface-variant">Sharp, fleeting or pleuritic sensations unaffected by exertion, rest, or sublingual nitrates.</span>
                    </div>
                  </label>
                  <label class="cp-option flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-all">
                    <input class="mt-1 accent-primary" name="feature_cp" type="radio" value="3"/>
                    <div class="flex flex-col">
                      <span class="font-label-ui text-label-ui font-semibold text-on-surface">Asymptomatic</span>
                      <span class="font-body-sm text-body-sm text-on-surface-variant">Absence of subjective anginal symptoms; screening or silent myocardial ischemia testing.</span>
                    </div>
                  </label>
                </div>
              </div>
            </section>

            <!-- STEP 2 CONTENT -->
            <section class="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-lg" id="step-section-2">
              <div class="flex items-center justify-between pb-space-sm border-b border-surface-container">
                <div class="flex flex-col">
                  <span class="font-label-ui text-label-ui text-secondary font-bold uppercase tracking-wider">Section 2 of 3</span>
                  <h2 class="font-headline-lg text-headline-lg text-on-surface">Clinical Biometrics &amp; Laboratory Findings</h2>
                </div>
                <span class="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-data-sm text-label-data-sm font-semibold">Clinical Review</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center justify-between">
                    <label class="font-label-ui text-label-ui font-semibold text-on-surface uppercase" for="feature-trestbps">Resting Blood Pressure</label>
                    <span class="font-body-sm text-body-sm text-on-surface-variant">Normal: &lt;120 mm Hg</span>
                  </div>
                  <div class="relative rounded-lg bg-surface-container-low focus-within:bg-surface-container focus-within:ring-2 focus-within:ring-secondary transition-all">
                    <input class="w-full bg-transparent px-space-md py-2.5 text-on-surface font-label-data-md text-label-data-md focus:outline-none pr-20" id="feature-trestbps" max="240" min="80" placeholder="120" type="number" value="140"/>
                    <span class="absolute right-3 top-2.5 font-label-data-sm text-label-data-sm text-on-surface-variant pointer-events-none">mm Hg</span>
                  </div>
                  <div class="flex items-center gap-1 font-body-sm text-body-sm text-error">
                    <span class="material-symbols-outlined text-[14px]">info</span>
                    <span>Stage 2 Hypertension range (&gt;139 mm Hg)</span>
                  </div>
                </div>
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center justify-between">
                    <label class="font-label-ui text-label-ui font-semibold text-on-surface uppercase" for="feature-chol">Serum Total Cholesterol</label>
                    <span class="font-body-sm text-body-sm text-on-surface-variant">Desirable: &lt;200 mg/dL</span>
                  </div>
                  <div class="relative rounded-lg bg-surface-container-low focus-within:bg-surface-container focus-within:ring-2 focus-within:ring-secondary transition-all">
                    <input class="w-full bg-transparent px-space-md py-2.5 text-on-surface font-label-data-md text-label-data-md focus:outline-none pr-20" id="feature-chol" max="600" min="100" placeholder="200" type="number" value="268"/>
                    <span class="absolute right-3 top-2.5 font-label-data-sm text-label-data-sm text-on-surface-variant pointer-events-none">mg/dL</span>
                  </div>
                  <span class="font-body-sm text-body-sm text-on-surface-variant">Fasting lipid panel result: Elevated (borderline high &gt;240 mg/dL).</span>
                </div>
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center justify-between">
                    <label class="font-label-ui text-label-ui font-semibold text-on-surface uppercase" for="feature-fbs">Fasting Blood Sugar</label>
                    <span class="font-label-data-sm text-label-data-sm text-secondary font-semibold">Threshold: 120 mg/dL</span>
                  </div>
                  <select class="w-full bg-surface-container-low rounded-lg px-space-md py-2.5 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary transition-all" id="feature-fbs">
                    <option selected value="0">Normal (≤ 120 mg/dL)</option>
                    <option value="1">Elevated (&gt; 120 mg/dL — Impaired / Diabetic)</option>
                  </select>
                  <span class="font-body-sm text-body-sm text-on-surface-variant">Recent laboratory metabolic panel: 108 mg/dL (Normal).</span>
                </div>
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center justify-between">
                    <label class="font-label-ui text-label-ui font-semibold text-on-surface uppercase" for="feature-restecg">Resting Electrocardiogram</label>
                    <span class="font-label-data-sm text-label-data-sm text-on-surface-variant">12-Lead Resting Baseline</span>
                  </div>
                  <select class="w-full bg-surface-container-low rounded-lg px-space-md py-2.5 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary transition-all" id="feature-restecg">
                    <option value="0">Normal Baseline Trace</option>
                    <option selected value="1">ST-T Wave Abnormality (T-wave inversion / ST &gt; 0.05 mV)</option>
                    <option value="2">Left Ventricular Hypertrophy (Estes Voltage Criteria)</option>
                  </select>
                  <span class="font-body-sm text-body-sm text-on-surface-variant">Resting trace recorded prior to graded exercise testing protocol.</span>
                </div>
                <div class="flex flex-col gap-1.5 md:col-span-2">
                  <div class="flex items-center justify-between">
                    <label class="font-label-ui text-label-ui font-semibold text-on-surface uppercase" for="feature-thalach">Maximum Heart Rate Achieved</label>
                    <span class="font-body-sm text-body-sm text-on-surface-variant">Predicted Max: 158 bpm (220 − age)</span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-space-md items-center">
                    <div class="relative md:col-span-2 rounded-lg bg-surface-container-low focus-within:bg-surface-container focus-within:ring-2 focus-within:ring-secondary transition-all">
                      <input class="w-full bg-transparent px-space-md py-2.5 text-on-surface font-label-data-md text-label-data-md focus:outline-none pr-16" id="feature-thalach" max="220" min="60" placeholder="150" type="number" value="160"/>
                      <span class="absolute right-3 top-2.5 font-label-data-sm text-label-data-sm text-on-surface-variant pointer-events-none">bpm</span>
                    </div>
                    <div class="p-space-sm rounded-lg bg-surface-container flex flex-col text-left">
                      <span class="font-label-ui text-label-ui text-on-surface-variant uppercase font-semibold">% Predicted Max Achieved</span>
                      <span class="font-label-data-md text-label-data-md font-bold text-primary" id="maxHrCalculated">101.2% (Target Achieved)</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- STEP 3 CONTENT -->
            <section class="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-lg" id="step-section-3">
              <div class="flex items-center justify-between pb-space-sm border-b border-surface-container">
                <div class="flex flex-col">
                  <span class="font-label-ui text-label-ui text-secondary font-bold uppercase tracking-wider">Section 3 of 3</span>
                  <h2 class="font-headline-lg text-headline-lg text-on-surface">Stress Test Findings &amp; Fluoroscopy</h2>
                </div>
                <span class="px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-data-sm text-label-data-sm font-semibold">Ischemic Markers Present</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center justify-between">
                    <label class="font-label-ui text-label-ui font-semibold text-on-surface uppercase">Exercise-Induced Angina</label>
                    <span class="font-label-data-sm text-label-data-sm text-error font-semibold" id="exangLabel">Positive Finding</span>
                  </div>
                  <div class="grid grid-cols-2 gap-space-xs p-1 rounded-lg bg-surface-container-low">
                    <button class="py-2 text-center rounded-md font-label-ui text-label-ui text-on-surface-variant hover:text-on-surface transition-all" id="exang-btn-0" type="button">No</button>
                    <button class="py-2 text-center rounded-md font-label-ui text-label-ui font-bold bg-error-container text-on-error-container shadow-sm transition-all" id="exang-btn-1" type="button">Yes</button>
                  </div>
                  <input id="feature-exang" type="hidden" value="1"/>
                  <p class="font-body-sm text-body-sm text-on-surface-variant">Patient reported substernal tightness at Stage III Bruce protocol.</p>
                </div>
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center justify-between">
                    <label class="font-label-ui text-label-ui font-semibold text-on-surface uppercase" for="feature-oldpeak">ST Depression Induced by Exercise</label>
                    <span class="font-body-sm text-body-sm text-on-surface-variant">Oldpeak</span>
                  </div>
                  <div class="relative rounded-lg bg-surface-container-low focus-within:bg-surface-container focus-within:ring-2 focus-within:ring-secondary transition-all">
                    <input class="w-full bg-transparent px-space-md py-2.5 text-on-surface font-label-data-md text-label-data-md focus:outline-none pr-16" id="feature-oldpeak" max="6.2" min="0" placeholder="0.0" step="0.1" type="number" value="3.6"/>
                    <span class="absolute right-3 top-2.5 font-label-data-sm text-label-data-sm text-on-surface-variant pointer-events-none">mm</span>
                  </div>
                  <span class="font-body-sm text-body-sm text-error font-medium">Significant ST segment depression relative to baseline (&gt; 2.0 mm).</span>
                </div>
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center justify-between">
                    <label class="font-label-ui text-label-ui font-semibold text-on-surface uppercase" for="feature-slope">Slope of Peak Exercise ST Segment</label>
                    <span class="font-label-data-sm text-label-data-sm text-on-surface-variant">Post-Stress Morphology</span>
                  </div>
                  <select class="w-full bg-surface-container-low rounded-lg px-space-md py-2.5 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary transition-all" id="feature-slope">
                    <option value="0">Upsloping</option>
                    <option value="1">Flat</option>
                    <option selected value="2">Downsloping (High Risk)</option>
                  </select>
                  <span class="font-body-sm text-body-sm text-on-surface-variant">Calculated at J-point + 80 milliseconds.</span>
                </div>
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center justify-between">
                    <label class="font-label-ui text-label-ui font-semibold text-on-surface uppercase" for="feature-ca">Major Cardiac Vessels Colored by Fluoroscopy</label>
                    <span class="font-label-data-sm text-label-data-sm text-on-surface-variant">Coronary Angiography Preview</span>
                  </div>
                  <select class="w-full bg-surface-container-low rounded-lg px-space-md py-2.5 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary transition-all" id="feature-ca">
                    <option value="0">0 major vessels</option>
                    <option value="1">1 major vessel</option>
                    <option selected value="2">2 major vessels (LAD, RCA)</option>
                    <option value="3">3 major vessels</option>
                  </select>
                  <span class="font-body-sm text-body-sm text-on-surface-variant">Fluoroscopy finding from cardiac catheterization imaging preview.</span>
                </div>
                <div class="flex flex-col gap-1.5 md:col-span-2">
                  <div class="flex items-center justify-between">
                    <label class="font-label-ui text-label-ui font-semibold text-on-surface uppercase" for="feature-thal">Thalassemia / Myocardial Perfusion Scintigraphy</label>
                    <span class="font-label-data-sm text-label-data-sm text-on-surface-variant">Nuclear Stress Imaging</span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                    <label class="thal-option p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer flex items-center gap-space-xs transition-all">
                      <input class="accent-primary" name="feature_thal" type="radio" value="1"/>
                      <span class="font-body-sm text-body-sm text-on-surface">Normal Blood Flow</span>
                    </label>
                    <label class="thal-option p-space-sm rounded-lg bg-surface-container-highest/60 ring-2 ring-secondary cursor-pointer flex items-center gap-space-xs transition-all">
                      <input checked class="accent-secondary" name="feature_thal" type="radio" value="2"/>
                      <span class="font-body-sm text-body-sm text-on-surface font-semibold">Reversible Defect (Ischemia) ★</span>
                    </label>
                    <label class="thal-option p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer flex items-center gap-space-xs transition-all">
                      <input class="accent-primary" name="feature_thal" type="radio" value="3"/>
                      <span class="font-body-sm text-body-sm text-on-surface">Fixed Defect (Infarct)</span>
                    </label>
                  </div>
                  <p class="font-body-sm text-body-sm text-on-surface-variant">Nuclear perfusion scan indicates transient myocardial ischemia during stress protocol.</p>
                </div>
              </div>
            </section>
          </form>
        </div>

        <!-- Live Model Contract & API Payload Sidebar (4 Columns) -->
        <div class="lg:col-span-4 flex flex-col gap-space-md sticky top-20">
          <div class="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm">
            <div class="flex items-center justify-between pb-space-xs border-b border-surface-container">
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-secondary text-[20px]">checklist</span>
                <span class="font-headline-md text-headline-md text-on-surface">Required Clinical Inputs</span>
              </div>
              <span class="px-2 py-0.5 rounded bg-secondary-container font-label-data-sm text-label-data-sm text-on-secondary-container font-semibold">13 / 13 Completed</span>
            </div>
            <div class="flex flex-col gap-2 pt-1">
              <div class="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-surface-container-low">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                  <span class="font-body-sm text-body-sm text-on-surface font-medium">Step A: Demographics &amp; Pain (3)</span>
                </div>
                <span class="font-label-data-sm text-label-data-sm text-secondary font-bold">Complete</span>
              </div>
              <div class="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-surface-container-low">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                  <span class="font-body-sm text-body-sm text-on-surface font-medium">Step B: Biometrics &amp; Labs (5)</span>
                </div>
                <span class="font-label-data-sm text-label-data-sm text-secondary font-bold">Complete</span>
              </div>
              <div class="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-surface-container-low">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                  <span class="font-body-sm text-body-sm text-on-surface font-medium">Step C: Stress &amp; Anatomy (5)</span>
                </div>
                <span class="font-label-data-sm text-label-data-sm text-secondary font-bold">Complete</span>
              </div>
            </div>
          </div>

          <div class="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm">
            <div class="flex items-center gap-1.5 pb-space-xs border-b border-surface-container">
              <span class="material-symbols-outlined text-secondary text-[20px]">menu_book</span>
              <span class="font-headline-md text-headline-md text-on-surface">Assessment Protocol Guidelines</span>
            </div>
            <div class="flex flex-col gap-space-sm text-body-sm text-on-surface-variant">
              <div class="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                <span class="font-label-ui text-label-ui font-semibold text-on-surface">Duke Treadmill Score Reference</span>
                <p class="text-[14px]">Exercise Time − (5 × ST Depression mm) − (4 × Angina Index). High risk: score &lt; −11.</p>
              </div>
              <div class="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                <span class="font-label-ui text-label-ui font-semibold text-on-surface">Resting ECG Diagnostic Criteria</span>
                <p class="text-[14px]">ST-T wave abnormality requires T-wave inversions &gt; 1 mm in anterior/inferior leads or ST elevation/depression &gt; 0.05 mV.</p>
              </div>
              <div class="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                <span class="font-label-ui text-label-ui font-semibold text-on-surface">Fluoroscopy Vessel Definition</span>
                <p class="text-[14px]">Count epicardial coronary vessels with ≥50% luminal stenosis (LAD, LCx, RCA).</p>
              </div>
            </div>
          </div>

          <div class="p-space-md rounded-xl bg-surface-container-low border border-dashed border-outline-variant flex flex-col gap-space-xs">
            <div class="flex items-center gap-1.5 text-on-surface">
              <span class="material-symbols-outlined text-[18px] text-secondary">shield</span>
              <span class="font-label-ui text-label-ui font-semibold uppercase">Clinical Decision Support Notice</span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant italic">
              “Decision support algorithm output is probabilistic and intended to supplement, not supersede, direct physician clinical evaluation and judgment.”
            </p>
          </div>
        </div>
      </div>

      <!-- Sticky Bottom Navigation & Validation Bar -->
      <div class="w-full mt-space-xl bg-surface-container-lowest rounded-xl shadow-md p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md sticky bottom-4 z-30">
        <div class="flex items-center gap-space-sm text-secondary">
          <span class="material-symbols-outlined text-[24px]">task_alt</span>
          <div class="flex flex-col">
            <span class="font-headline-md text-headline-md text-on-surface">All 13 required clinical features recorded and validated</span>
            <span class="font-body-sm text-body-sm text-on-surface-variant">Ready for clinical review and diagnostic classification.</span>
          </div>
        </div>
        <div class="flex items-center gap-space-sm w-full sm:w-auto justify-end flex-wrap">
          <button id="cancelFormBtn" class="px-space-md py-2.5 rounded-lg bg-surface hover:bg-surface-container text-on-surface font-label-ui text-label-ui uppercase tracking-wider font-semibold transition-all" type="button">
            Cancel
          </button>
          <button id="saveDraftBtn" class="px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-ui text-label-ui uppercase tracking-wider font-semibold transition-all" type="button">
            Save Draft
          </button>
          <button id="prev-step-btn" class="px-space-md py-2.5 rounded-lg bg-surface-container text-on-surface font-label-ui text-label-ui uppercase tracking-wider font-semibold hover:bg-surface-container-high transition-all" type="button">
            Previous Step
          </button>
          <button id="next-step-btn" class="px-space-lg py-2.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-headline-md text-headline-md flex items-center gap-space-xs transition-all shadow-sm" type="button">
            <span>Continue to Step B</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  `;

  setupFormInteractions(container, router, patient);
}

function setupFormInteractions(container, router, patient) {
  let currentStep = 1;

  function switchStep(step) {
    currentStep = step;
    for (let i = 1; i <= 3; i++) {
      const btn = container.querySelector(`#step-btn-${i}`);
      const badge = container.querySelector(`#step-badge-${i}`);
      const section = container.querySelector(`#step-section-${i}`);
      if (!btn || !badge || !section) continue;

      if (i === step) {
        btn.classList.add('bg-surface-container');
        btn.classList.remove('bg-surface');
        badge.className = 'w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-data-sm text-label-data-sm font-bold';
        section.classList.remove('opacity-50');
        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        btn.classList.remove('bg-surface-container');
        btn.classList.add('bg-surface');
        badge.className = 'w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-label-data-sm text-label-data-sm font-semibold';
      }
    }

    const nextBtn = container.querySelector('#next-step-btn');
    if (nextBtn) {
      if (currentStep === 3) {
        nextBtn.innerHTML = `<span>Run Clinical Inference</span><span class="material-symbols-outlined text-[18px]">bolt</span>`;
      } else {
        nextBtn.innerHTML = `<span>Continue to Step ${currentStep === 1 ? 'B' : 'C'}</span><span class="material-symbols-outlined text-[18px]">arrow_forward</span>`;
      }
    }
  }

  container.querySelector('#step-btn-1')?.addEventListener('click', () => switchStep(1));
  container.querySelector('#step-btn-2')?.addEventListener('click', () => switchStep(2));
  container.querySelector('#step-btn-3')?.addEventListener('click', () => switchStep(3));

  container.querySelector('#prev-step-btn')?.addEventListener('click', () => {
    if (currentStep > 1) switchStep(currentStep - 1);
  });

  // Sex toggle
  const sexInput = container.querySelector('#feature-sex');
  const sexBtn0 = container.querySelector('#sex-btn-0');
  const sexBtn1 = container.querySelector('#sex-btn-1');
  const sexLabel = container.querySelector('#sexLabel');

  function setSex(val) {
    sexInput.value = val;
    if (val === 0) {
      sexBtn0.className = 'py-2 text-center rounded-md font-label-ui text-label-ui font-bold bg-surface-container-lowest text-primary shadow-sm transition-all';
      sexBtn1.className = 'py-2 text-center rounded-md font-label-ui text-label-ui text-on-surface-variant hover:text-on-surface transition-all';
      if (sexLabel) sexLabel.textContent = 'Female';
    } else {
      sexBtn1.className = 'py-2 text-center rounded-md font-label-ui text-label-ui font-bold bg-surface-container-lowest text-primary shadow-sm transition-all';
      sexBtn0.className = 'py-2 text-center rounded-md font-label-ui text-label-ui text-on-surface-variant hover:text-on-surface transition-all';
      if (sexLabel) sexLabel.textContent = 'Male';
    }
  }
  sexBtn0?.addEventListener('click', () => setSex(0));
  sexBtn1?.addEventListener('click', () => setSex(1));

  // Exang toggle
  const exangInput = container.querySelector('#feature-exang');
  const exangBtn0 = container.querySelector('#exang-btn-0');
  const exangBtn1 = container.querySelector('#exang-btn-1');
  const exangLabel = container.querySelector('#exangLabel');

  function setExang(val) {
    exangInput.value = val;
    if (val === 1) {
      exangBtn1.className = 'py-2 text-center rounded-md font-label-ui text-label-ui font-bold bg-error-container text-on-error-container shadow-sm transition-all';
      exangBtn0.className = 'py-2 text-center rounded-md font-label-ui text-label-ui text-on-surface-variant hover:text-on-surface transition-all';
      if (exangLabel) {
        exangLabel.textContent = 'Positive Finding';
        exangLabel.className = 'font-label-data-sm text-label-data-sm text-error font-semibold';
      }
    } else {
      exangBtn0.className = 'py-2 text-center rounded-md font-label-ui text-label-ui font-bold bg-surface-container-lowest text-primary shadow-sm transition-all';
      exangBtn1.className = 'py-2 text-center rounded-md font-label-ui text-label-ui text-on-surface-variant hover:text-on-surface transition-all';
      if (exangLabel) {
        exangLabel.textContent = 'Negative';
        exangLabel.className = 'font-label-data-sm text-label-data-sm text-secondary font-semibold';
      }
    }
  }
  exangBtn0?.addEventListener('click', () => setExang(0));
  exangBtn1?.addEventListener('click', () => setExang(1));

  // Radio styling updates
  container.querySelectorAll('input[name="feature_cp"]').forEach(radio => {
    radio.addEventListener('change', () => {
      container.querySelectorAll('.cp-option').forEach(l => {
        l.className = 'cp-option flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-all';
      });
      radio.closest('label').className = 'cp-option flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-highest/60 ring-2 ring-secondary cursor-pointer transition-all';
    });
  });

  container.querySelectorAll('input[name="feature_thal"]').forEach(radio => {
    radio.addEventListener('change', () => {
      container.querySelectorAll('.thal-option').forEach(l => {
        l.className = 'thal-option p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer flex items-center gap-space-xs transition-all';
      });
      radio.closest('label').className = 'thal-option p-space-sm rounded-lg bg-surface-container-highest/60 ring-2 ring-secondary cursor-pointer flex items-center gap-space-xs transition-all';
    });
  });

  // Calculate predicted HR max live
  const ageInput = container.querySelector('#feature-age');
  const thalachInput = container.querySelector('#feature-thalach');
  const maxHrDisplay = container.querySelector('#maxHrCalculated');

  function updateHrPercentage() {
    const age = parseFloat(ageInput.value) || 60;
    const thalach = parseFloat(thalachInput.value) || 150;
    const predMax = Math.max(1, 220 - age);
    const pct = ((thalach / predMax) * 100).toFixed(1);
    if (maxHrDisplay) {
      maxHrDisplay.textContent = `${pct}% (${pct >= 85 ? 'Target Achieved' : 'Submaximal'})`;
    }
  }
  ageInput?.addEventListener('input', updateHrPercentage);
  thalachInput?.addEventListener('input', updateHrPercentage);

  // Collect features from DOM
  function collectFeatures() {
    const cpChecked = container.querySelector('input[name="feature_cp"]:checked');
    const thalChecked = container.querySelector('input[name="feature_thal"]:checked');

    return {
      age: parseFloat(container.querySelector('#feature-age').value),
      sex: parseInt(container.querySelector('#feature-sex').value, 10),
      cp: cpChecked ? parseInt(cpChecked.value, 10) : 1,
      trestbps: parseFloat(container.querySelector('#feature-trestbps').value),
      chol: parseFloat(container.querySelector('#feature-chol').value),
      fbs: parseInt(container.querySelector('#feature-fbs').value, 10),
      restecg: parseInt(container.querySelector('#feature-restecg').value, 10),
      thalach: parseFloat(container.querySelector('#feature-thalach').value),
      exang: parseInt(container.querySelector('#feature-exang').value, 10),
      oldpeak: parseFloat(container.querySelector('#feature-oldpeak').value),
      slope: parseInt(container.querySelector('#feature-slope').value, 10),
      ca: parseFloat(container.querySelector('#feature-ca').value),
      thal: thalChecked ? parseInt(thalChecked.value, 10) : 2,
    };
  }

  // Cancel
  container.querySelector('#cancelFormBtn')?.addEventListener('click', () => {
    if (confirm('Discard clinical inputs and return to dashboard?')) {
      router.navigate('dashboard');
    }
  });

  // Save Draft
  container.querySelector('#saveDraftBtn')?.addEventListener('click', async () => {
    try {
      const features = collectFeatures();
      setNotification('Saving assessment draft...', 'info');
      const res = await api.saveAssessmentDraft(patient.id, features);
      setNotification(res.message || 'Draft saved successfully.', 'success');
    } catch (err) {
      alert(`Could not save draft: ${err.message}`);
    }
  });

  // Next or Submit
  container.querySelector('#next-step-btn')?.addEventListener('click', async () => {
    if (currentStep < 3) {
      switchStep(currentStep + 1);
    } else {
      // Run inference
      const features = collectFeatures();
      const nextBtn = container.querySelector('#next-step-btn');
      const origHtml = nextBtn.innerHTML;
      nextBtn.disabled = true;
      nextBtn.innerHTML = `<span>Processing Model Inference...</span><span class="material-symbols-outlined text-[18px] animate-spin">refresh</span>`;

      try {
        setNotification('Validating 13 features & executing Cleveland Logistic Regression...', 'info');
        const result = await api.predictAssessment(patient.id, features);
        setNotification('Classification calculated successfully.', 'success');

        state.activeAssessment = result;
        state.activeAssessmentId = result.assessment_id;
        state.activePatientId = patient.id;

        // Navigate to results
        router.navigate('results');
      } catch (err) {
        alert(`Prediction Inference Error: ${err.message}`);
        nextBtn.disabled = false;
        nextBtn.innerHTML = origHtml;
      }
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
