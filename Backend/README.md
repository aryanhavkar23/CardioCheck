# CardioCheck — Clinical Decision Support Backend

Robust Python FastAPI backend powering the CardioCheck clinical decision support interface. Integrates the trained Cleveland Heart Disease Logistic Regression model and StandardScaler, enforces strict doctor tenant isolation, preserves immutable 13-feature diagnostic snapshots, and compiles dynamic PDF clinical reports.

---

## 1. Architecture Overview

- **Framework**: FastAPI (Asynchronous Python 3.14+)
- **Database**: SQLite via SQLAlchemy ORM (configured for concurrent WAL mode)
- **Authentication**: JWT Bearer Tokens (HS256) + direct `bcrypt` password hashing
- **ML Engine**: Scikit-Learn `LogisticRegression` loaded via `joblib`, conditioned by `StandardScaler`
- **Report Engine**: ReportLab PDF generation with hospital-grade clinical formatting
- **Validation**: Pydantic v2 schemas (`ConfigDict(from_attributes=True)`)

---

## 2. Machine Learning Model Artifacts

Located in `Backend/Models/`:
- `heart_disease_scaler.pkl` — `StandardScaler` fitted on the 13 Cleveland clinical features.
- `logistic_regression_model.pkl` — `LogisticRegression` model yielding binary classification:
  - **Class 0**: Classified into the *no-heart-disease* category.
  - **Class 1**: Classified into the *heart-disease-present* category.

### 13 Input Features (Exact Order Expected by Scaler)

| # | Feature | Form Value Range | Cleveland Training Code | Clinical Meaning |
|---|---|---|---|---|
| 1 | `age` | 18–120 | Continuous | Patient age in years |
| 2 | `sex` | 0, 1 | 0 = Female, 1 = Male | Biological sex |
| 3 | `cp` | 0, 1, 2, 3 | 1 = Typical, 2 = Atypical, 3 = Non-Anginal, 4 = Asymptomatic | Chest pain type (mapped automatically to 1–4) |
| 4 | `trestbps` | 80–220 | Continuous | Resting blood pressure (mm Hg) |
| 5 | `chol` | 100–600 | Continuous | Serum cholesterol (mg/dL) |
| 6 | `fbs` | 0, 1 | 0 = ≤120 mg/dL, 1 = >120 mg/dL | Fasting blood sugar |
| 7 | `restecg` | 0, 1, 2 | 0 = Normal, 1 = ST-T Abnormality, 2 = LV Hypertrophy | Resting electrocardiographic results |
| 8 | `thalach` | 60–220 | Continuous | Maximum heart rate achieved during stress test |
| 9 | `exang` | 0, 1 | 0 = No, 1 = Yes | Exercise-induced angina |
| 10 | `oldpeak` | 0.0–6.5 | Continuous | ST depression induced by exercise relative to rest (mm) |
| 11 | `slope` | 0, 1, 2 | 1 = Upsloping, 2 = Flat, 3 = Downsloping | Slope of peak exercise ST segment (mapped to 1–3) |
| 12 | `ca` | 0, 1, 2, 3 | 0–3 | Number of major vessels colored by fluoroscopy |
| 13 | `thal` | 1, 2, 3 | 3 = Normal, 6 = Fixed defect, 7 = Reversible defect | Thalassemia scintigraphy (mapped to 3, 6, 7) |

---

## 3. API Endpoints

### Health & System
- `GET /api/health` or `/api/v1/health` — Backend status and loaded model telemetry.

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a physician account with department and license number.
- `POST /api/auth/login` — Authenticate physician and return JWT bearer token.
- `GET /api/auth/me` — Return current authenticated physician profile.
- `POST /api/auth/logout` — Invalidate client token.

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard/summary` — Doctor greeting, KPIs, cohort distribution metrics, and active evaluation queue.

### Patients (`/api/patients`)
- `GET /api/patients/` — List all patients belonging to the authenticated physician (supports `?search=` query).
- `POST /api/patients/` — Register new patient (auto-generates MRN if blank).
- `GET /api/patients/{id}` — Fetch specific patient profile with full assessment history.
- `PUT /api/patients/{id}` — Update patient demographics (preserves prior diagnostic snapshots).
- `GET /api/patients/{id}/assessments` — List all past assessments for this patient.
- `POST /api/patients/{id}/assessments/drafts` — Save or update in-progress clinical form draft.

### Assessments & Inference (`/api/assessments`)
- `POST /api/assessments/{patient_id}/predict` — Validates 13 features, runs scaler + model, creates immutable snapshot.
- `GET /api/assessments/{id}` — Retrieve assessment record with formatted display values and doctor notes.
- `PATCH /api/assessments/{id}/notes` — Update doctor's observations and recommendations.
- `GET /api/assessments/compare/{patient_id}` — Compare consecutive assessments with biomarker variance deltas.
- `GET /api/assessments/{id}/report` — Stream generated ReportLab PDF clinical report.

---

## 4. Setup and Execution (Windows PowerShell)

```powershell
# 1. Navigate to Backend
cd "d:\workspace\Heart dieases\Backend"

# 2. Install dependencies
python -m pip install -r requirements.txt

# 3. Seed Database with demonstration data (Dr. Jenkins & sample patients)
python -m app.seed

# 4. Launch Development Server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Pre-Configured Physician Credentials
- **Email**: `doctor@cardiocheck.io`
- **Password**: `CardioCheck2026!`
- **Physician**: Dr. Sarah Jenkins, MD (Cardiology Dept, License #MD-884129)

---

## 5. Running the Test Suite

```powershell
cd "d:\workspace\Heart dieases\Backend"
python -m pytest -v
```

All 20 comprehensive unit and integration tests validate:
- Authentication & JWT token security
- Strict multi-doctor patient isolation
- 13-feature inference correctness (Class 0 and Class 1)
- Validation rejections for missing/out-of-range clinical parameters
- Immutable historical snapshot preservation after patient demographic edits
- ReportLab PDF byte streaming and authorization
