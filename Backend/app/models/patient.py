from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    mrn = Column(String(64), index=True, nullable=False)
    name = Column(String(255), nullable=False)
    dob = Column(String(32), nullable=True)
    age = Column(Integer, nullable=False)
    sex = Column(Integer, nullable=False)  # 0 = Female, 1 = Male
    blood_group = Column(String(16), nullable=True, default="A+")
    ward = Column(String(128), nullable=True, default="West Pavilion 4B")
    protocol = Column(String(255), nullable=True, default="Coronary Artery Disease Comprehensive Risk Workup")
    emergency_contact_name = Column(String(255), nullable=True)
    emergency_contact_phone = Column(String(64), nullable=True)
    consent_status = Column(String(64), nullable=True, default="Signed (Active)")
    allergies = Column(String(255), nullable=True, default="None Reported")
    avatar_url = Column(String(512), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    doctor = relationship("User", back_populates="patients")
    assessments = relationship("Assessment", back_populates="patient", cascade="all, delete-orphan", order_by="desc(Assessment.created_at)")
