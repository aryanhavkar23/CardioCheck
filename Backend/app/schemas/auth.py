from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class DoctorRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=128)
    department: Optional[str] = "Cardiology Dept"
    license_number: Optional[str] = None

class DoctorLogin(BaseModel):
    email: EmailStr
    password: str

class DoctorOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    department: str
    license_number: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    doctor: DoctorOut
