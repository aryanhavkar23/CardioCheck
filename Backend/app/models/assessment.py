import json
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    reference_id = Column(String(64), unique=True, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Status: draft, pending, reviewed
    status = Column(String(32), default="pending", nullable=False)

    # 13 submitted features (immutable snapshot)
    age = Column(Float, nullable=True)
    sex = Column(Integer, nullable=True)
    cp = Column(Integer, nullable=True)
    trestbps = Column(Float, nullable=True)
    chol = Column(Float, nullable=True)
    fbs = Column(Integer, nullable=True)
    restecg = Column(Integer, nullable=True)
    thalach = Column(Float, nullable=True)
    exang = Column(Integer, nullable=True)
    oldpeak = Column(Float, nullable=True)
    slope = Column(Integer, nullable=True)
    ca = Column(Float, nullable=True)
    thal = Column(Integer, nullable=True)

    input_snapshot_json = Column(Text, nullable=True)

    # Prediction outputs
    prediction = Column(Integer, nullable=True)  # 0 or 1
    probability_class_0 = Column(Float, nullable=True)
    probability_class_1 = Column(Float, nullable=True)
    model_identifier = Column(String(128), default="Cleveland_LogReg_v1.0")
    explanation = Column(Text, nullable=True)

    # Doctor's notes and clinical decisions
    doctor_notes = Column(Text, nullable=True)
    recommended_protocol = Column(String(255), nullable=True)
    follow_up_text = Column(String(128), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    # Report reference
    report_generated_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    patient = relationship("Patient", back_populates="assessments")
    doctor = relationship("User", back_populates="assessments")

    def get_features_dict(self):
        if self.input_snapshot_json:
            try:
                return json.loads(self.input_snapshot_json)
            except Exception:
                pass
        return {
            "age": self.age,
            "sex": self.sex,
            "cp": self.cp,
            "trestbps": self.trestbps,
            "chol": self.chol,
            "fbs": self.fbs,
            "restecg": self.restecg,
            "thalach": self.thalach,
            "exang": self.exang,
            "oldpeak": self.oldpeak,
            "slope": self.slope,
            "ca": self.ca,
            "thal": self.thal,
        }
