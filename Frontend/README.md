# CardioCheck — Clinical Decision Support Frontend

Integrated Single Page Application (SPA) implementing the Google Stitch design for CardioCheck. Preserves 100% of the visual styling, typography, colors, and layout from the original Stitch export while providing real interactive state management and API integration.

---

## 1. Overview & Stitch Screens Integrated

The frontend faithfully combines the 4 Stitch screen exports into a seamless, reactive clinical application:

1. **Doctor Dashboard** (`#dashboard`):
   - Dynamic physician greeting and session status.
   - Live KPI cards: Total Patients, Recent Assessments, Awaiting Review, Follow-ups Scheduled.
   - Diagnostic Assessment Queue with real-time text search, classification filters (`Class 0`, `Class 1`), and review status tabs (`All`, `Pending`, `Reviewed`).
   - Quick patient intake form to register new patients directly from the dashboard.

2. **13-Feature Clinical Assessment Form** (`#form`):
   - Inpatient evaluation banner with active patient context (Name, MRN, Ward, Protocol).
   - 3-step interactive clinical stepper:
     - **Step 1: Patient Demographics & Baseline Vitals** (`age`, `sex`, `cp`, `trestbps`).
     - **Step 2: Laboratory & Stress Test Biomarkers** (`chol`, `fbs`, `restecg`, `thalach`, `exang`).
     - **Step 3: Imaging, Fluoroscopy & Scintigraphy** (`oldpeak`, `slope`, `ca`, `thal`).
   - Draft saving capability (`api.saveAssessmentDraft`) and one-click Cleveland model inference.

3. **Classification Results** (`#results`):
   - Urgent Amber / Teal classification banner indicating `Class 0` or `Class 1`.
   - Grid displaying all 13 submitted clinical parameter snapshots.
   - Interactive Doctor's Notes editor with live EHR saving.
   - Real-time PDF clinical report download button.

4. **Patient Profile & Assessment History** (`#patient-profile`):
   - Longitudinal risk trend sparklines and vitals comparison.
   - Chronological table of dated assessment records with immutable feature values.
   - Action buttons to view individual past assessments, download past PDF reports, or initiate a new assessment workup.

5. **Modals & Overlays**:
   - **Physician Authentication Modal**: Supports sign-in, account creation, and a "One-Click Sign In (Dr. Sarah Jenkins)" button for rapid demonstration.
   - **Patient Registration & Edit Modal**: Add new patients or update demographics.

---

## 2. Design System & Tokens Preserved

- **Typography**: `Inter` (UI elements, headings, body) and `JetBrains Mono` (clinical data values, MRNs, references).
- **Tailwind Palette**:
  - `primary`: `#000f1d`
  - `primary-container`: `#0f2537`
  - `secondary`: `#006a61` (Clinical Teal accent)
  - `secondary-container`: `#86f2e4`
  - `surface-container-lowest`: `#ffffff`
  - `surface-container-low`: `#eff4ff`
  - `error`: `#ba1a1a`
- **Zero Framework Bloat**: Pure Vanilla JavaScript with modular views, compiled and bundled via modern Vite.

---

## 3. Setup and Execution (Windows PowerShell)

```powershell
# 1. Navigate to Frontend
cd "d:\workspace\Heart dieases\Frontend"

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. (Optional) Build production bundle
npm run build
```

The frontend will run by default at `http://localhost:5173`. It connects automatically to the FastAPI backend running at `http://localhost:8000`.

---

## 4. Physician Demo Access

When opening the app:
1. Click **"One-Click Sign In (Dr. Sarah Jenkins)"** on the physician sign-in modal, or enter:
   - **Email**: `doctor@cardiocheck.io`
   - **Password**: `CardioCheck2026!`
2. You will be greeted on the Doctor Dashboard with pre-loaded patients (including Eleanor Vance `PT-8821`) and historical evaluations.
3. Click **"Start Assessment"** to test 13-feature inference, review the classification, and download a clinical PDF report.
