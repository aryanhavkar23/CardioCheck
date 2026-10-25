from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, field_validator, ConfigDict
import math

class AssessmentFeaturesInput(BaseModel):
    age: float = Field(..., ge=1, le=120, description="Age in years (18–100)")
    sex: int = Field(..., ge=0, le=1, description="Biological sex (0: Female, 1: Male)")
    cp: int = Field(..., description="Chest pain classification (0–3 or 1–4)")
    trestbps: float = Field(..., ge=50, le=300, description="Resting blood pressure (mm Hg)")
    chol: float = Field(..., ge=50, le=800, description="Serum cholesterol (mg/dL)")
    fbs: int = Field(..., ge=0, le=1, description="Fasting blood sugar > 120 mg/dL (0: <=120, 1: >120)")
    restecg: int = Field(..., ge=0, le=2, description="Resting ECG trace (0: Normal, 1: ST-T abn, 2: LVH)")
    thalach: float = Field(..., ge=40, le=260, description="Maximum heart rate achieved (bpm)")
    exang: int = Field(..., ge=0, le=1, description="Exercise-induced angina (0: No, 1: Yes)")
    oldpeak: float = Field(..., ge=0.0, le=10.0, description="ST depression induced by exercise (mm)")
    slope: int = Field(..., description="Slope of peak exercise ST segment (0–2 or 1–3)")
    ca: float = Field(..., ge=0, le=3, description="Number of major vessels colored by fluoroscopy (0–3)")
    thal: int = Field(..., description="Thalassemia scintigraphy (1–3 or 3, 6, 7)")

    @field_validator("age", "trestbps", "chol", "thalach", "oldpeak", "ca")
    @classmethod
    def validate_finite(cls, v):
        if not math.isfinite(v):
            raise ValueError("Numeric values must be finite numbers")
        return v

    @field_validator("cp")
    @classmethod
    def validate_cp(cls, v):
        if v not in [0, 1, 2, 3, 4]:
            raise ValueError("cp must be between 0–3 (form) or 1–4 (UCI)")
        return v

    @field_validator("slope")
    @classmethod
    def validate_slope(cls, v):
        if v not in [0, 1, 2, 3]:
            raise ValueError("slope must be 0–2 (form) or 1–3 (UCI)")
        return v

    @field_validator("thal")
    @classmethod
    def validate_thal(cls, v):
        if v not in [1, 2, 3, 6, 7]:
            raise ValueError("thal must be 1–3 (form) or 3, 6, 7 (UCI)")
        return v

class AssessmentDraftInput(BaseModel):
    age: Optional[float] = None
    sex: Optional[int] = None
    cp: Optional[int] = None
    trestbps: Optional[float] = None
    chol: Optional[float] = None
    fbs: Optional[int] = None
    restecg: Optional[int] = None
    thalach: Optional[float] = None
    exang: Optional[int] = None
    oldpeak: Optional[float] = None
    slope: Optional[int] = None
    ca: Optional[float] = None
    thal: Optional[int] = None
    doctor_notes: Optional[str] = None
    recommended_protocol: Optional[str] = None

class AssessmentNotesUpdate(BaseModel):
    doctor_notes: Optional[str] = None
    recommended_protocol: Optional[str] = None
    follow_up_text: Optional[str] = None
    status: Optional[str] = "reviewed"

class AssessmentOut(BaseModel):
    id: int
    reference_id: str
    patient_id: int
    doctor_id: int
    status: str
    created_at: datetime
    updated_at: datetime

    # Inputs snapshot
    features: Dict[str, Any]

    # Classification output
    prediction: Optional[int] = None
    probability_class_0: Optional[float] = None
    probability_class_1: Optional[float] = None
    model_identifier: Optional[str] = None
    explanation: Optional[str] = None

    # Notes
    doctor_notes: Optional[str] = None
    recommended_protocol: Optional[str] = None
    follow_up_text: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    report_generated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class AssessmentCompareOut(BaseModel):
    patient_id: int
    patient_name: str
    assessments: List[AssessmentOut]
    deltas: Dict[str, Any]
