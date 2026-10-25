from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class PatientBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    age: int = Field(..., ge=1, le=120)
    sex: int = Field(..., ge=0, le=1)  # 0: Female, 1: Male
    mrn: Optional[str] = None
    dob: Optional[str] = None
    blood_group: Optional[str] = "A+"
    ward: Optional[str] = "West Pavilion 4B"
    protocol: Optional[str] = "Coronary Artery Disease Comprehensive Risk Workup"
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    consent_status: Optional[str] = "Signed (Active)"
    allergies: Optional[str] = "None Reported"
    avatar_url: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = Field(None, ge=1, le=120)
    sex: Optional[int] = Field(None, ge=0, le=1)
    dob: Optional[str] = None
    blood_group: Optional[str] = None
    ward: Optional[str] = None
    protocol: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    consent_status: Optional[str] = None
    allergies: Optional[str] = None
    avatar_url: Optional[str] = None

class PatientOut(PatientBase):
    id: int
    doctor_id: int
    mrn: str
    created_at: datetime
    updated_at: datetime
    latest_assessment_id: Optional[str] = None
    latest_classification: Optional[int] = None
    latest_assessment_date: Optional[str] = None
    review_status: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
